import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusMateria } from '@prisma/client';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { materiaAutoriaInclude, materiaRelationsInclude } from '../../../../common/prisma/prisma-includes';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AlterarStatusMateriaDto } from '../../application/dto/alterar-status-materia.dto';
import { AdicionarMateriaAutorDto } from '../../application/dto/materia-autor.dto';
import { CreateMateriaDto, FilterMateriaDto } from '../../application/dto/materia.dto';
import {
    AddCoautorMateriaDto,
    SetAutorExternoDto,
    SetAutorParlamentarDto,
    SetRelatorMateriaDto,
} from '../../application/dto/matter-autoria.dto';
import { ExecutarTramitacaoMateriaDto } from '../../application/dto/matter-tramitation.dto';
import { UpdateMateriaDto } from '../../application/dto/update-materia.dto';
import { MatterAuthorshipPayload } from '../../application/view-models/matter-authorship.view-model';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { MatterTramitationDomainService } from '../../domain/services/matter-tramitation-domain.service';
import {
    AutorExternoListItem,
    MateriaRepository,
    TramitarMateriaData,
} from '../../domain/repositories/materia.repository';
import {
    assertTransicaoStatusPermitida,
    syncEmTramitacaoFromStatus,
} from '../../domain/services/materia-workflow';

type TramitacaoEntry = {
    status: StatusMateria;
    observacao?: string;
    em: string;
};

@Injectable()
export class PrismaMateriaRepository implements MateriaRepository {
    private readonly tramitationService = new MatterTramitationDomainService();

    constructor(private readonly prisma: PrismaService) {}

    private mapPresentationDates(dto: {
        dataApresentacaoInicio?: string;
        dataApresentacaoFim?: string;
    }) {
        return {
            dataApresentacaoInicio: toOptionalDate(dto.dataApresentacaoInicio),
            dataApresentacaoFim: toOptionalDate(dto.dataApresentacaoFim),
        };
    }

    private resolveStatus(dto: {
        status?: StatusMateria;
        emTramitacao?: boolean;
    }) {
        if (dto.status) return dto.status;
        if (dto.emTramitacao === false) return StatusMateria.ARQUIVADA;
        return StatusMateria.DRAFT;
    }

    private appendTramitacao(
        atual: Prisma.JsonValue,
        entry: TramitacaoEntry,
    ): Prisma.InputJsonValue {
        const lista = Array.isArray(atual)
            ? [...(atual as TramitacaoEntry[])]
            : [];
        lista.push(entry);
        return lista as Prisma.InputJsonValue;
    }

    private async assertParlamentaresDoTenant(
        tenantId: string,
        parlamentarIds: string[],
    ) {
        const count = await this.prisma.parlamentar.count({
            where: {
                id: { in: parlamentarIds },
                ...tenantWhere(tenantId),
            },
        });
        if (count !== parlamentarIds.length) {
            throw new BadRequestException(
                'Um ou mais representantes não pertencem a esta câmara',
            );
        }
    }

    private async syncRepresentantes(
        tenantId: string,
        materiaId: string,
        representanteIds?: string[],
    ) {
        if (representanteIds === undefined) return;
        await this.prisma.materiaRepresentante.deleteMany({
            where: { materiaId },
        });
        if (!representanteIds.length) return;

        await this.assertParlamentaresDoTenant(tenantId, representanteIds);
        await this.prisma.materiaRepresentante.createMany({
            data: representanteIds.map((parlamentarId, index) => ({
                materiaId,
                parlamentarId,
                ordem: index + 1,
            })),
        });
    }

    private async assertParliamentarianOfTenant(
        tenantId: string,
        parliamentarianId: string,
    ) {
        const row = await this.prisma.parliamentarian.findFirst({
            where: {
                id: parliamentarianId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
        });
        if (!row) {
            throw new NotFoundException(
                'Parlamentar não encontrado nesta Câmara',
            );
        }
        return row;
    }

    private async assertParliamentariansWithUser(
        tenantId: string,
        parliamentarianIds: string[],
    ) {
        const count = await this.prisma.parliamentarian.count({
            where: {
                id: { in: parliamentarianIds },
                ...tenantWhere(tenantId),
                isRemoved: false,
                parliamentarianUser: { isRemoved: false },
            },
        });
        if (count !== parliamentarianIds.length) {
            throw new BadRequestException(
                'Um ou mais parlamentares não possuem vínculo de usuário ativo',
            );
        }
    }

    private async syncCoautores(
        tenantId: string,
        matterId: string,
        coautorIds?: string[],
        authorParliamentarianId?: string | null,
    ) {
        if (coautorIds === undefined) return;
        await this.prisma.matterCoauthor.deleteMany({ where: { matterId } });
        const ids = coautorIds.filter((id) => id !== authorParliamentarianId);
        if (!ids.length) return;

        await this.assertParliamentariansWithUser(tenantId, ids);
        await this.prisma.matterCoauthor.createMany({
            data: ids.map((parliamentarianId, index) => ({
                tenantId,
                matterId,
                parliamentarianId,
                ordem: index + 1,
            })),
        });
    }

    async replaceCoautores(
        tenantId: string,
        matterId: string,
        coautorIds: string[],
    ) {
        const matter = await this.findAutoriaOrThrow(tenantId, matterId);
        await this.syncCoautores(
            tenantId,
            matterId,
            coautorIds,
            matter.authorParliamentarianId,
        );
        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    async getAutoria(tenantId: string, matterId: string) {
        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    private async assertNumeroUnico(
        tenantId: string,
        tipoId: string,
        numero: number,
        anoId: string,
        ignoreMateriaId?: string,
    ) {
        const existente = await this.prisma.materia.findFirst({
            where: {
                tenantId,
                tipoId,
                numero,
                anoId,
                isRemoved: false,
                ...(ignoreMateriaId ? { id: { not: ignoreMateriaId } } : {}),
            },
        });
        if (existente) {
            throw new ConflictException(
                'Já existe matéria com este tipo, número e ano nesta câmara',
            );
        }
    }

    private async getNextNumeroProtocolo(
        tenantId: string,
        anoId?: string | null,
    ): Promise<number> {
        const aggregate = await this.prisma.materia.aggregate({
            where: {
                tenantId,
                isRemoved: false,
                ...(anoId ? { anoId } : {}),
            },
            _max: { numeroProtocolo: true },
        });
        return (aggregate._max.numeroProtocolo ?? 0) + 1;
    }

    private async backfillMissingProtocolNumbers<
        T extends {
            id: string;
            numero: number | null;
            numeroProtocolo: number | null;
            anoId: string | null;
        },
    >(tenantId: string, items: T[]): Promise<void> {
        for (const item of items) {
            if (item.numero != null || item.numeroProtocolo != null) continue;
            const numeroProtocolo = await this.getNextNumeroProtocolo(
                tenantId,
                item.anoId,
            );
            await this.prisma.materia.update({
                where: { id: item.id },
                data: { numeroProtocolo },
            });
            item.numeroProtocolo = numeroProtocolo;
        }
    }

    async create(tenantId: string, dto: CreateMateriaDto) {
        const status = this.resolveStatus(dto);
        if (dto.numero !== undefined && dto.anoId) {
            await this.assertNumeroUnico(
                tenantId,
                dto.tipoId,
                dto.numero,
                dto.anoId,
            );
        }

        const {
            dataApresentacaoInicio: _di,
            dataApresentacaoFim: _df,
            status: _status,
            emTramitacao: _em,
            representanteIds,
            coautorIds: _coautorIds,
            relatoresIds: _relatoresIds,
            ...rest
        } = dto;
        const { dataApresentacaoInicio, dataApresentacaoFim } =
            this.mapPresentationDates(dto);

        const primeiroAutorId = representanteIds?.[0] ?? rest.primeiroAutorId;
        const dataProtocolo = rest.dataProtocolo
            ? new Date(rest.dataProtocolo)
            : undefined;
        const { dataProtocolo: _dataProtocolo, ...matterFields } = rest;

        const numeroProtocolo =
            matterFields.numeroProtocolo ??
            (matterFields.numero == null
                ? await this.getNextNumeroProtocolo(tenantId, matterFields.anoId)
                : undefined);

        const materia = await this.prisma.materia.create({
            data: {
                ...matterFields,
                ...(numeroProtocolo != null ? { numeroProtocolo } : {}),
                dataProtocolo,
                primeiroAutorId,
                tenantId,
                dataApresentacaoInicio,
                dataApresentacaoFim,
                status,
                emTramitacao: syncEmTramitacaoFromStatus(status),
                tramitacaoJson: this.appendTramitacao([], {
                    status,
                    observacao: 'Cadastro da matéria',
                    em: new Date().toISOString(),
                }),
            },
        });

        await this.syncRepresentantes(tenantId, materia.id, representanteIds);
        return this.findOne(tenantId, materia.id);
    }

    findAll(tenantId: string, filters: FilterMateriaDto) {
        const where: Prisma.MateriaWhereInput = { ...tenantWhere(tenantId) };
        if (filters.tipoId) where.tipoId = filters.tipoId;
        if (filters.anoId) where.anoId = filters.anoId;
        if (filters.tematicaId) where.tematicaId = filters.tematicaId;
        if (filters.autorId) where.autorId = filters.autorId;
        if (filters.relatorId) where.relatorId = filters.relatorId;
        if (filters.statusTramitacaoId) {
            where.statusTramitacaoId = filters.statusTramitacaoId;
        }
        if (filters.status) {
            where.status = filters.status;
        } else if (filters.emTramitacao !== undefined) {
            where.emTramitacao = filters.emTramitacao;
        }
        if (filters.numero) where.numero = filters.numero;
        if (filters.ementa) {
            where.ementa = { contains: filters.ementa };
        }
        return paginatedQuery(
            () => this.prisma.materia.count({ where }),
            async (skip, take) => {
                const rows = await this.prisma.materia.findMany({
                    where,
                    include: materiaRelationsInclude,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                });
                await this.backfillMissingProtocolNumbers(tenantId, rows);
                return rows;
            },
            filters,
        );
    }

    async findOne(tenantId: string, id: string) {
        const item = await this.prisma.materia.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: {
                ...materiaRelationsInclude,
                pautaItens: {
                    where: { isRemoved: false },
                    include: { sessao: { include: { situacao: true } } },
                },
                normas: true,
            },
        });
        if (!item) throw new NotFoundException('Matéria não encontrada');
        await this.backfillMissingProtocolNumbers(tenantId, [item]);
        return item;
    }

    async update(tenantId: string, id: string, dto: UpdateMateriaDto) {
        const atual = await this.findOne(tenantId, id);

        if (
            dto.numero !== undefined &&
            (dto.anoId ?? atual.anoId) &&
            (dto.tipoId ?? atual.tipoId)
        ) {
            await this.assertNumeroUnico(
                tenantId,
                dto.tipoId ?? atual.tipoId,
                dto.numero ?? atual.numero!,
                dto.anoId ?? atual.anoId!,
                id,
            );
        }

        const {
            dataApresentacaoInicio: _di,
            dataApresentacaoFim: _df,
            status: _status,
            emTramitacao: _em,
            representanteIds,
            coautorIds,
            ...rest
        } = dto;
        const { dataApresentacaoInicio, dataApresentacaoFim } =
            this.mapPresentationDates(dto);

        let primeiroAutorId = rest.primeiroAutorId;
        if (representanteIds !== undefined) {
            primeiroAutorId =
                representanteIds.length > 0 ? representanteIds[0] : undefined;
        }

        if (dto.status !== undefined || dto.emTramitacao !== undefined) {
            throw new BadRequestException(
                'Status da matéria só pode ser alterado via tramitação',
            );
        }

        await this.prisma.materia.update({
            where: { id },
            data: {
                ...rest,
                primeiroAutorId,
                dataApresentacaoInicio,
                dataApresentacaoFim,
            },
        });

        await this.syncRepresentantes(tenantId, id, representanteIds);
        await this.syncCoautores(
            tenantId,
            id,
            coautorIds,
            atual.authorParliamentarianId,
        );
        return this.findOne(tenantId, id);
    }

    async tramitarMateria(
        tenantId: string,
        id: string,
        dto: ExecutarTramitacaoMateriaDto,
    ) {
        const materia = await this.findOne(tenantId, id);
        const current = materia.status as MatterStatus;
        let nextStatus: MatterStatus;
        try {
            nextStatus = this.tramitationService.resolveTransition(
                current,
                dto.action,
            );
        } catch (error) {
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Ação inválida',
            );
        }

        const observacao =
            dto.observacao?.trim() ||
            this.tramitationService.getDefaultObservacao(dto.action);

        return this.prisma.materia.update({
            where: { id },
            data: {
                status: nextStatus as StatusMateria,
                emTramitacao: syncEmTramitacaoFromStatus(nextStatus as StatusMateria),
                tramitacaoJson: this.appendTramitacao(materia.tramitacaoJson, {
                    status: nextStatus as StatusMateria,
                    observacao,
                    em: new Date().toISOString(),
                }),
            },
            include: materiaRelationsInclude,
        });
    }

    async listTramitationActions(tenantId: string, id: string) {
        const materia = await this.findOne(tenantId, id);
        const current = materia.status as MatterStatus;
        return this.tramitationService.getAvailableActions(current);
    }

    async alterarStatus(
        tenantId: string,
        id: string,
        dto: AlterarStatusMateriaDto,
    ) {
        const materia = await this.findOne(tenantId, id);
        assertTransicaoStatusPermitida(materia.status, dto.status, {
            matterId: id,
            tenantId,
        });

        return this.prisma.materia.update({
            where: { id },
            data: {
                status: dto.status,
                emTramitacao: syncEmTramitacaoFromStatus(dto.status),
                tramitacaoJson: this.appendTramitacao(materia.tramitacaoJson, {
                    status: dto.status,
                    observacao: dto.observacao,
                    em: new Date().toISOString(),
                }),
            },
            include: materiaRelationsInclude,
        });
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id);
        return this.prisma.materia.update({
            where: { id },
            data: { isRemoved: true },
        });
    }

    async listarAutores(tenantId: string, materiaId: string) {
        await this.findOne(tenantId, materiaId);
        return this.prisma.materiaAutor.findMany({
            where: { materiaId },
            include: { autor: true },
            orderBy: { ordem: 'asc' },
        });
    }

    async adicionarAutor(
        tenantId: string,
        materiaId: string,
        dto: AdicionarMateriaAutorDto,
    ) {
        await this.findOne(tenantId, materiaId);

        const autor = await this.prisma.autor.findFirst({
            where: {
                id: dto.autorId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
        });
        if (!autor) throw new NotFoundException('Autor não encontrado');

        const ordemOcupada = await this.prisma.materiaAutor.findFirst({
            where: { materiaId, ordem: dto.ordem },
        });
        if (ordemOcupada) {
            throw new ConflictException(
                `Ordem ${dto.ordem} já está em uso nesta matéria`,
            );
        }

        try {
            return await this.prisma.materiaAutor.create({
                data: {
                    materiaId,
                    autorId: dto.autorId,
                    ordem: dto.ordem,
                },
                include: { autor: true },
            });
        } catch {
            throw new ConflictException('Autor já vinculado a esta matéria');
        }
    }

    async removerAutor(
        tenantId: string,
        materiaId: string,
        materiaAutorId: string,
    ) {
        await this.findOne(tenantId, materiaId);

        const vínculo = await this.prisma.materiaAutor.findFirst({
            where: { id: materiaAutorId, materiaId },
        });
        if (!vínculo)
            throw new NotFoundException('Vínculo autor/matéria não encontrado');

        return this.prisma.materiaAutor.delete({
            where: { id: materiaAutorId },
        });
    }

    private async findAutoriaOrThrow(
        tenantId: string,
        matterId: string,
    ): Promise<MatterAuthorshipPayload> {
        const item = await this.prisma.materia.findFirst({
            where: { id: matterId, ...tenantWhere(tenantId), isRemoved: false },
            include: materiaAutoriaInclude,
        });
        if (!item) throw new NotFoundException('Matéria não encontrada');
        return item as MatterAuthorshipPayload;
    }

    private async assertParliamentarianAuthorEligible(
        tenantId: string,
        parliamentarianId: string,
    ) {
        const row = await this.prisma.parliamentarian.findFirst({
            where: {
                id: parliamentarianId,
                ...tenantWhere(tenantId),
                isRemoved: false,
                parliamentarianUser: { isRemoved: false },
            },
        });
        if (!row) {
            throw new NotFoundException(
                'Parlamentar sem vínculo de usuário não pode ser autor desta matéria',
            );
        }
        return row;
    }

    async setAutorParlamentar(
        tenantId: string,
        matterId: string,
        dto: SetAutorParlamentarDto,
    ) {
        await this.findAutoriaOrThrow(tenantId, matterId);
        await this.assertParliamentarianAuthorEligible(
            tenantId,
            dto.parliamentarianId,
        );

        await this.prisma.materia.update({
            where: { id: matterId },
            data: {
                authorParliamentarianId: dto.parliamentarianId,
                autorId: null,
            },
        });

        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    async setAutorExterno(
        tenantId: string,
        matterId: string,
        dto: SetAutorExternoDto,
    ) {
        await this.findAutoriaOrThrow(tenantId, matterId);
        const autorExterno = await this.prisma.autorExterno.findFirst({
            where: {
                id: dto.autorExternoId,
                ...tenantWhere(tenantId),
                isRemoved: false,
            },
        });
        if (!autorExterno) {
            throw new NotFoundException(
                'Autor externo não encontrado nesta Câmara',
            );
        }

        let autor = await this.prisma.autor.findFirst({
            where: {
                tenantId,
                autorExternoId: dto.autorExternoId,
                isRemoved: false,
            },
        });

        if (!autor) {
            autor = await this.prisma.autor.create({
                data: {
                    tenantId,
                    nome: autorExterno.nome,
                    tipoAutorId: autorExterno.tipoAutorId,
                    autorExternoId: autorExterno.id,
                },
            });
        }

        await this.prisma.materia.update({
            where: { id: matterId },
            data: {
                autorId: autor.id,
                authorParliamentarianId: null,
            },
        });

        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    async addCoautor(
        tenantId: string,
        matterId: string,
        dto: AddCoautorMateriaDto,
    ) {
        const matter = await this.findAutoriaOrThrow(tenantId, matterId);
        await this.assertParliamentarianAuthorEligible(
            tenantId,
            dto.parliamentarianId,
        );

        if (matter.authorParliamentarianId === dto.parliamentarianId) {
            throw new BadRequestException(
                'Autor principal não pode ser listado novamente como coautor',
            );
        }

        const duplicate = await this.prisma.matterCoauthor.findFirst({
            where: { matterId, parliamentarianId: dto.parliamentarianId },
        });
        if (duplicate) {
            throw new ConflictException(
                'Parlamentar já é coautor desta matéria',
            );
        }

        const maxOrdem = await this.prisma.matterCoauthor.aggregate({
            where: { matterId },
            _max: { ordem: true },
        });
        const ordem = (maxOrdem._max.ordem ?? 0) + 1;

        await this.prisma.matterCoauthor.create({
            data: {
                tenantId,
                matterId,
                parliamentarianId: dto.parliamentarianId,
                ordem,
            },
        });

        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    async removeCoautor(
        tenantId: string,
        matterId: string,
        coauthorId: string,
    ) {
        await this.findAutoriaOrThrow(tenantId, matterId);

        const deleted = await this.prisma.matterCoauthor.deleteMany({
            where: { id: coauthorId, matterId, ...tenantWhere(tenantId) },
        });
        if (deleted.count === 0) {
            throw new NotFoundException('Coautor não encontrado nesta matéria');
        }

        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    async setRelator(
        tenantId: string,
        matterId: string,
        dto: SetRelatorMateriaDto,
    ) {
        await this.findAutoriaOrThrow(tenantId, matterId);
        await this.assertParliamentarianOfTenant(tenantId, dto.parliamentarianId);

        await this.prisma.materia.update({
            where: { id: matterId },
            data: {
                rapporteurParliamentarianId: dto.parliamentarianId,
            },
        });

        return this.findAutoriaOrThrow(tenantId, matterId);
    }

    // ── Métodos novos (clean DDD) ──────────────────────────────────────────

    async proximoNumero(
        tenantId: string,
        tipoId: string,
        anoId: string,
    ): Promise<number> {
        const result = await this.prisma.$queryRaw<[{ proximo: bigint }]>`
            SELECT COALESCE(MAX(numero), 0) + 1 AS proximo
            FROM materias
            WHERE tenant_id = ${tenantId}
              AND tipo_id = ${tipoId}
              AND ano_id = ${anoId}
              AND is_removed = false
            FOR UPDATE
        `;
        return Number(result[0].proximo);
    }

    async tramitar(
        id: string,
        tenantId: string,
        dados: TramitarMateriaData,
    ): Promise<void> {
        await this.prisma.$transaction([
            this.prisma.materia.update({
                where: { id },
                data: {
                    status: dados.novoStatus as StatusMateria,
                    emTramitacao: syncEmTramitacaoFromStatus(
                        dados.novoStatus as StatusMateria,
                    ),
                },
            }),
            this.prisma.tramitacaoHistorico.create({
                data: {
                    materiaId: id,
                    statusAnterior: dados.statusAnterior as StatusMateria | null,
                    statusNovo: dados.novoStatus as StatusMateria,
                    responsavelId: dados.responsavelId ?? null,
                    despacho: dados.despacho ?? null,
                    observacao: dados.observacao ?? null,
                    unidadeOrigemId: dados.unidadeOrigemId ?? null,
                    unidadeDestinoId: dados.unidadeDestinoId ?? null,
                },
            }),
        ]);
    }

    async listAutoresExternos(
        tenantId: string,
        tipoAutorId?: string,
    ): Promise<AutorExternoListItem[]> {
        const rows = await this.prisma.autorExterno.findMany({
            where: {
                tenantId,
                isRemoved: false,
                ...(tipoAutorId ? { tipoAutorId } : {}),
            },
            include: { tipoAutor: true },
            orderBy: { nome: 'asc' },
        });

        return rows.map((r) => ({
            id: r.id,
            nome: r.nome,
            cargo: r.cargo,
            instituicao: r.instituicao,
            registro: r.registro,
            partido: r.partido,
            uf: r.uf,
            tipoAutor: {
                id: r.tipoAutor.id,
                nome: r.tipoAutor.nome,
                idNegocio: r.tipoAutor.idNegocio,
            },
        }));
    }

    async addPublicacao(
        tenantId: string,
        materiaId: string,
        data: {
            dataPublicacao: Date;
            veiculo: string;
            paginaInicio?: number;
            paginaFim?: number;
            identificador?: string;
            urlExterna?: string;
            textoIntegral?: string;
        },
    ): Promise<{ id: string; dataPublicacao: Date; veiculo: string }> {
        await this.findOne(tenantId, materiaId);

        return this.prisma.publicacaoOficial.create({
            data: {
                tenantId,
                materiaId,
                dataPublicacao: data.dataPublicacao,
                veiculo: data.veiculo,
                paginaInicio: data.paginaInicio ?? null,
                paginaFim: data.paginaFim ?? null,
                identificador: data.identificador ?? null,
                urlExterna: data.urlExterna ?? null,
                textoIntegral: data.textoIntegral ?? null,
            },
            select: { id: true, dataPublicacao: true, veiculo: true },
        });
    }
}
