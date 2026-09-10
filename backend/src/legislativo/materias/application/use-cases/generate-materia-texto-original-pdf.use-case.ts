import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantUserRole, TenantUserStatus } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { PdfGeneratorService } from '../../../../common/pdf/pdf-generator.service';
import {
    materiaTextoOriginalTemplate,
    type MateriaTextoOriginalPdfInput,
} from '../../../../common/pdf/templates/materia-texto-original.template';
import {
    buildProcessoNumero,
    buildProtocoloLabel,
    tituloProposicao,
    verboPorSigla,
} from '../../../../common/pdf/templates/materia-texto-original.helpers';
import {
    buildMateriaPdfFooterTemplate,
    buildMateriaPdfHeaderTemplate,
    resolveMateriaPdfBranding,
} from '../../../../common/pdf/templates/materia-texto-original.branding';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

const MESES = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
];

function formatDateParts(date: Date) {
    const d = date.getDate();
    const m = date.getMonth();
    const y = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return {
        extenso: `${d} de ${MESES[m]} de ${y}`,
        curta: `${String(d).padStart(2, '0')}/${String(m + 1).padStart(2, '0')}/${y}`,
        hora: `${hh}:${mm}:${ss}`,
        ddmmyyyy: `${String(d).padStart(2, '0')}${String(m + 1).padStart(2, '0')}${y}`,
        ano: y,
        ddmm: `${String(d).padStart(2, '0')}${String(m + 1).padStart(2, '0')}`,
    };
}

@Injectable()
export class GenerateMateriaTextoOriginalPdfUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfGenerator: PdfGeneratorService,
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, matterId: string) {
        const materia = await this.prisma.materia.findFirst({
            where: { id: matterId, tenantId, isRemoved: false },
            include: {
                tipo: true,
                ano: true,
                authorParliamentarian: {
                    select: {
                        parliamentaryName: true,
                        parliamentarianUser: {
                            select: {
                                politicalParty: {
                                    select: { name: true, acronym: true },
                                },
                            },
                        },
                    },
                },
                autor: {
                    include: {
                        tenantPartner: {
                            select: {
                                nome: true,
                                cargo: true,
                                instituicao: true,
                            },
                        },
                    },
                },
            },
        });

        if (!materia) {
            throw new NotFoundException('Matéria não encontrada');
        }

        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: {
                name: true,
                tradeName: true,
                city: true,
                state: true,
                logo: true,
                cnpj: true,
                contactEmail: true,
                contactPhone: true,
                settings: true,
            },
        });

        if (!tenant) {
            throw new NotFoundException('Câmara não encontrada');
        }

        const board = await this.prisma.board.findFirst({
            where: { tenantId, status: 'ACTIVE', isRemoved: false },
            include: {
                legislature: {
                    select: { startDate: true, endDate: true, number: true },
                },
                members: {
                    where: { isRemoved: false },
                    include: {
                        parliamentarian: {
                            select: { parliamentaryName: true },
                        },
                        boardRole: { select: { name: true } },
                    },
                },
            },
        });

        const secretaria = await this.prisma.tenantUser.findFirst({
            where: {
                tenantId,
                role: TenantUserRole.SECRETARIA_LEGISLATIVA,
                status: TenantUserStatus.ACTIVE,
                isRemoved: false,
            },
            include: {
                user: { select: { firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        const dataBase = materia.dataProtocolo ?? materia.createdAt;
        const dataParts = formatDateParts(dataBase);
        const ano =
            materia.ano && 'valor' in materia.ano
                ? Number((materia.ano as { valor: number }).valor)
                : dataParts.ano;

        const tipoNome = materia.tipo?.nome ?? 'Matéria';
        const sigla =
            materia.sigla ??
            (materia.tipo as { sigla?: string | null } | null)?.sigla ??
            tipoNome;
        const numero = materia.numero;
        const numeroLabel =
            numero != null ? `${numero}/${ano}` : `s/n/${ano}`;

        const seqProcesso =
            materia.numeroProtocolo ?? materia.numero ?? 1;
        const numeroProcesso = buildProcessoNumero(seqProcesso, ano);
        const dataProtocoloLabel = buildProtocoloLabel({
            ddmm: dataParts.ddmm,
            ano: dataParts.ano,
            numeroProtocolo: materia.numeroProtocolo,
        });

        const autorParlamentar = materia.authorParliamentarian;
        const partner = materia.autor?.tenantPartner;
        const autorNome =
            autorParlamentar?.parliamentaryName?.trim() ||
            partner?.nome?.trim() ||
            'Autor não informado';

        const party =
            autorParlamentar?.parliamentarianUser?.politicalParty ?? null;
        const autorCargoPartido = autorParlamentar
            ? party
                ? `Vereador(a) do ${party.acronym} - ${party.name}`
                : 'Vereador(a)'
            : [partner?.cargo, partner?.instituicao]
                  .filter(Boolean)
                  .join(' — ') || 'Autor';

        const presidente =
            board?.members.find((m) =>
                /presid/i.test(m.boardRole.name),
            ) ?? board?.members[0];
        const presidenteNome =
            presidente?.parliamentarian.parliamentaryName?.trim() ||
            'PRESIDENTE DA CÂMARA MUNICIPAL';

        const secretariaNome = secretaria
            ? `${secretaria.user.firstName} ${secretaria.user.lastName}`.trim()
            : 'Secretária Legislativa';

        let bienio = String(ano);
        if (board?.legislature) {
            const ini = board.legislature.startDate.getFullYear();
            const fim = board.legislature.endDate
                ? board.legislature.endDate.getFullYear()
                : ini + 1;
            bienio = `${ini}/${fim}`;
        }

        const municipio =
            tenant.city?.trim() ||
            tenant.tradeName?.replace(/^Câmara Municipal de\s+/i, '').trim() ||
            tenant.name.replace(/^Câmara Municipal de\s+/i, '').trim() ||
            'Município';
        const uf = tenant.state?.trim() || 'CE';
        const tenantNome =
            tenant.tradeName?.trim() ||
            tenant.name.trim() ||
            `Câmara Municipal de ${municipio}`;

        const settings =
            tenant.settings &&
            typeof tenant.settings === 'object' &&
            !Array.isArray(tenant.settings)
                ? (tenant.settings as Record<string, unknown>)
                : {};
        const enderecoSetting =
            typeof settings.endereco === 'string'
                ? settings.endereco
                : typeof settings.address === 'string'
                  ? settings.address
                  : null;

        const branding = resolveMateriaPdfBranding({
            logo: tenant.logo,
            municipio,
            contactPhone: tenant.contactPhone,
            contactEmail: tenant.contactEmail,
            cnpj: tenant.cnpj,
            endereco: enderecoSetting,
        });

        const payload: MateriaTextoOriginalPdfInput = {
            tenantNome,
            municipio,
            uf,
            bienio,
            numeroProcesso,
            dataProtocoloLabel,
            dataProtocoloExtenso: dataParts.extenso,
            dataProtocoloCurta: dataParts.curta,
            horaProtocolo: dataParts.hora,
            autorNome,
            autorCargoPartido,
            ementa: materia.ementa,
            justificativa: materia.justificativa,
            observacoes: `${tipoNome.toUpperCase()} Nº ${numeroLabel}`,
            tipoNome,
            tipoNomeUpper: tipoNome.toUpperCase(),
            sigla: String(sigla).toUpperCase(),
            numeroLabel,
            tituloProposicao: tituloProposicao(
                tipoNome,
                String(sigla),
                numeroLabel,
            ),
            verboAcao: verboPorSigla(String(sigla)),
            presidenteNome,
            secretariaNome,
            secretariaCargo: 'Secretária Legislativa',
        };

        const html = materiaTextoOriginalTemplate(payload);
        const pdf = await this.pdfGenerator.gerarDeHtml(html, {
            cabecalhoHtml: buildMateriaPdfHeaderTemplate(branding),
            rodapeHtml: buildMateriaPdfFooterTemplate(branding),
            margem: { top: '42mm', bottom: '42mm', left: '14mm', right: '14mm' },
        });

        const uploadDir = join(process.cwd(), 'uploads', 'materias', tenantId);
        await mkdir(uploadDir, { recursive: true });
        const storedName = `${matterId}.pdf`;
        await writeFile(join(uploadDir, storedName), pdf);

        const textoOriginalUrl = `/uploads/materias/${tenantId}/${storedName}`;
        // Atualiza URL direto no Prisma para não reentrar no UpdateMateriaUseCase.
        await this.prisma.materia.update({
            where: { id: matterId },
            data: { textoOriginalUrl },
        });

        const updated = await this.repository.findOne(tenantId, matterId);
        return MatterViewModel.toHttp(updated as MateriaPrismaPayload);
    }
}
