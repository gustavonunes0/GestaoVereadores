import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    Prisma,
    CodigoSituacaoSessao,
    ResultadoPauta,
    StatusMateria,
    StatusSessao as PrismaStatusSessao,
    StatusPautaItem as PrismaStatusPautaItem,
    FaseSessao as PrismaFaseSessao,
} from '@prisma/client';
import { SessaoPlenariaEntity } from '../../domain/entities/sessao-plenaria.entity';
import { StatusSessao, statusSessaoToCodigoSituacao } from '../../domain/enums/status-sessao.enum';
import { FaseSessao } from '../../domain/enums/fase-sessao.enum';
import {
    QuorumInfo,
    TransicionarStatusDados,
} from '../../domain/repositories/sessao-plenaria.repository';
import { toOptionalDate } from '../../../../common/prisma/date-fields';
import { buildDateRangeFilter } from '../../../../common/prisma/date-fields';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import {
    sessaoPlenariaInclude,
} from '../../../../common/prisma/prisma-includes';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MatterTramitationAction } from '../../../materias/domain/enums/matter-tramitation-action.enum';
import { MateriaRepository } from '../../../materias/domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../../materias/materias.tokens';
import {
    AddPautaItemDto,
    CreateSessaoPlenariaDto,
    FilterSessaoPlenariaDto,
    RegistrarPresencaDto,
    RegistrarResultadoPautaDto,
} from '../../application/dto/sessao.dto';
import { FilterPautaDto, UpdatePautaItemDto } from '../../application/dto/pauta.dto';
import {
    FilterPresencaDto,
    UpdatePresencaDto,
} from '../../application/dto/presenca.dto';
import { ExecutarCicloVidaSessaoDto } from '../../application/dto/session-lifecycle.dto';
import { UpdateSessaoPlenariaDto } from '../../application/dto/update-sessao.dto';
import { ActiveParliamentarianMandateChecker } from '../../../parlamentares/mandatos/domain/contracts/active-parliamentarian-mandate-checker';
import { assertParliamentarianHasActiveMandate } from '../../../parlamentares/mandatos/domain/services/mandate-workflow';
import { ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER } from '../../../parlamentares/mandatos/mandatos.tokens';
import {
    assertMateriaNaoDuplicadaNaPauta,
    assertOrdemDisponivelNaPauta,
    assertPodeRemoverItemPauta,
    getDefaultFasePauta,
} from '../../domain/services/pauta-workflow';
import { SessionLifecycleAction } from '../../domain/enums/session-lifecycle-action.enum';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { SessionLifecycleDomainService } from '../../domain/services/session-lifecycle-domain.service';
import { PlenarySessionDomainService } from '../../domain/services/plenary-session-domain.service';
import {
    assertSessaoAceitaPauta,
    assertSessaoNaoEncerrada,
    resolveSessionStatus,
} from '../../domain/services/sessao-workflow';
import {
    assertPresencaNaoDuplicada,
    resolveCamposPresenca,
    resolveCamposPresencaUpdate,
} from '../../domain/services/presenca-workflow';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';

type MandateProfileRefs = {
    parliamentarianProfileId?: string;
    legislatureProfileId?: string;
};

const pautaItemInclude = {
    materia: {
        include: {
            tipo: true,
            ano: true,
        },
    },
    votacao: {
        select: {
            id: true,
            tipoVotacao: true,
            resultado: true,
            realizadaAt: true,
        },
    },
} as const;

const presencaInclude = {
    parlamentar: { include: { pessoa: true } },
    parliamentarian: true,
} as const;

type LifecycleEntry = {
    status: SessionStatus;
    observacao?: string;
    em: string;
};

@Injectable()
export class PrismaSessaoPlenariaRepository implements SessaoPlenariaRepository {
    private readonly lifecycleService = new SessionLifecycleDomainService();
    private readonly domainService = new PlenarySessionDomainService();

    constructor(
        private readonly prisma: PrismaService,
        @Inject(ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER)
        private readonly mandateChecker: ActiveParliamentarianMandateChecker,
        @Inject(MATERIA_REPOSITORY)
        private readonly materiaRepository: MateriaRepository,
    ) {}

    private mapResultadoParaAcao(
        resultado: 'APROVADO' | 'REJEITADO',
    ): MatterTramitationAction {
        return resultado === 'APROVADO'
            ? MatterTramitationAction.APROVAR
            : MatterTramitationAction.REJEITAR;
    }

    private appendCicloVida(
        atual: Prisma.JsonValue,
        entry: LifecycleEntry,
    ): Prisma.InputJsonValue {
        const lista = Array.isArray(atual)
            ? [...(atual as LifecycleEntry[])]
            : [];
        lista.push(entry);
        return lista as Prisma.InputJsonValue;
    }

    private async resolveSituacaoIdByCodigo(codigo: CodigoSituacaoSessao) {
        const situacao = await this.prisma.situacaoSessao.findFirst({
            where: { codigo },
        });
        if (!situacao) {
            throw new BadRequestException(
                `Situação ${codigo} não configurada no sistema`,
            );
        }
        return situacao.id;
    }

    private async assertTipoSessaoDoTenant(tenantId: string, tipoSessaoId: string) {
        const tipo = await this.prisma.tipoSessao.findFirst({
            where: { id: tipoSessaoId, tenantId },
        });
        if (!tipo) {
            throw new NotFoundException(
                'Tipo de sessão não encontrado nesta Câmara',
            );
        }
        return tipo;
    }

    async create(tenantId: string, dto: CreateSessaoPlenariaDto) {
        await this.assertTipoSessaoDoTenant(tenantId, dto.tipoSessaoId);

        const dataInicio = new Date(dto.dataInicio);
        const dataFim = toOptionalDate(dto.dataFim);
        this.domainService.assertDateRange(dataInicio, dataFim);

        const situacaoId = await this.resolveSituacaoIdByCodigo(
            CodigoSituacaoSessao.AGENDADA,
        );
        const status = SessionStatus.AGENDADA;

        return this.prisma.sessaoPlenaria.create({
            data: {
                tenantId,
                dataInicio,
                dataFim,
                tipoSessaoId: dto.tipoSessaoId,
                situacaoId,
                sessaoLegislativaId: dto.sessaoLegislativaId,
                mensagem: dto.mensagem,
                cicloVidaJson: this.appendCicloVida([], {
                    status,
                    observacao: 'Cadastro da sessão',
                    em: new Date().toISOString(),
                }),
            },
            include: sessaoPlenariaInclude,
        });
    }

    findAll(tenantId: string, filters: FilterSessaoPlenariaDto) {
        const where: Prisma.SessaoPlenariaWhereInput = {
            ...tenantWhere(tenantId),
        };
        if (filters.tipoSessaoId) where.tipoSessaoId = filters.tipoSessaoId;
        if (filters.situacaoId) where.situacaoId = filters.situacaoId;
        if (filters.sessaoLegislativaId) {
            where.sessaoLegislativaId = filters.sessaoLegislativaId;
        }
        if (filters.legislaturaId) {
            where.sessaoLegislativa = { legislaturaId: filters.legislaturaId };
        }
        const range = buildDateRangeFilter(
            filters.dataInicioDe,
            filters.dataInicioAte,
        );
        if (range) where.dataInicio = range;

        return paginatedQuery(
            () => this.prisma.sessaoPlenaria.count({ where }),
            (skip, take) =>
                this.prisma.sessaoPlenaria.findMany({
                    where,
                    include: sessaoPlenariaInclude,
                    orderBy: { dataInicio: 'desc' },
                    skip,
                    take,
                }),
            filters,
        );
    }

    async findOne(tenantId: string, id: string) {
        const item = await this.prisma.sessaoPlenaria.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: sessaoPlenariaInclude,
        });
        if (!item)
            throw new NotFoundException('Sessão plenária não encontrada');
        return item;
    }

    async update(tenantId: string, id: string, dto: UpdateSessaoPlenariaDto) {
        const sessao = await this.findOne(tenantId, id);
        assertSessaoNaoEncerrada(sessao.situacao);

        if (dto.situacaoId !== undefined) {
            throw new BadRequestException(
                'Situação da sessão só pode ser alterada via ciclo de vida',
            );
        }

        const dataInicio = dto.dataInicio
            ? new Date(dto.dataInicio)
            : sessao.dataInicio;
        const dataFim =
            dto.dataFim !== undefined
                ? toOptionalDate(dto.dataFim)
                : sessao.dataFim;
        this.domainService.assertDateRange(dataInicio, dataFim);

        if (dto.tipoSessaoId) {
            await this.assertTipoSessaoDoTenant(tenantId, dto.tipoSessaoId);
        }

        return this.prisma.sessaoPlenaria.update({
            where: { id },
            data: {
                dataInicio: dto.dataInicio
                    ? new Date(dto.dataInicio)
                    : undefined,
                dataFim:
                    dto.dataFim !== undefined
                        ? toOptionalDate(dto.dataFim)
                        : undefined,
                tipoSessaoId: dto.tipoSessaoId,
                sessaoLegislativaId: dto.sessaoLegislativaId,
                mensagem: dto.mensagem,
            },
            include: sessaoPlenariaInclude,
        });
    }

    async executarCicloVida(
        tenantId: string,
        id: string,
        dto: ExecutarCicloVidaSessaoDto,
    ) {
        const sessao = await this.findOne(tenantId, id);
        const current = resolveSessionStatus(sessao.situacao);
        if (!current) {
            throw new BadRequestException('Situação da sessão não reconhecida');
        }

        let nextStatus: SessionStatus;
        try {
            nextStatus = this.lifecycleService.resolveTransition(
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
            this.lifecycleService.getDefaultObservacao(dto.action);

        const situacaoId = await this.resolveSituacaoIdByCodigo(
            nextStatus as CodigoSituacaoSessao,
        );

        const dataFim =
            dto.action === SessionLifecycleAction.ENCERRAR
                ? (sessao.dataFim ?? new Date())
                : undefined;

        return this.prisma.sessaoPlenaria.update({
            where: { id },
            data: {
                situacaoId,
                dataFim,
                cicloVidaJson: this.appendCicloVida(sessao.cicloVidaJson ?? [], {
                    status: nextStatus,
                    observacao,
                    em: new Date().toISOString(),
                }),
            },
            include: sessaoPlenariaInclude,
        });
    }

    async listLifecycleActions(tenantId: string, id: string) {
        const sessao = await this.findOne(tenantId, id);
        const current = resolveSessionStatus(sessao.situacao);
        if (!current) return [];
        return this.lifecycleService.getAvailableActions(current);
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id);
        return this.prisma.sessaoPlenaria.update({
            where: { id },
            data: { isRemoved: true },
        });
    }

    private async assertSessaoGerenciaPauta(tenantId: string, sessaoId: string) {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, ...tenantWhere(tenantId) },
            include: { situacao: true },
        });
        if (!sessao) {
            throw new NotFoundException('Sessão plenária não encontrada');
        }
        if (
            sessao.statusSessao === PrismaStatusSessao.AGENDADA ||
            sessao.statusSessao === PrismaStatusSessao.ABERTA
        ) {
            return sessao;
        }
        assertSessaoAceitaPauta(sessao.situacao);
        return sessao;
    }

    private async listActivePautaItems(sessaoId: string) {
        return this.prisma.pautaItem.findMany({
            where: { sessaoId, isRemoved: false },
            select: {
                id: true,
                materiaId: true,
                ordem: true,
                isRemoved: true,
            },
        });
    }

    async listPautaItens(
        tenantId: string,
        sessaoId: string,
        filters: FilterPautaDto,
    ) {
        await this.findOne(tenantId, sessaoId);

        const where: Prisma.PautaItemWhereInput = {
            sessaoId,
            isRemoved: false,
        };
        if (filters.fase) where.fase = filters.fase;

        return this.prisma.pautaItem.findMany({
            where,
            include: pautaItemInclude,
            orderBy: [{ fase: 'asc' }, { ordem: 'asc' }],
        });
    }

    async getPautaItemById(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ) {
        await this.findOne(tenantId, sessaoId);

        const item = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
            include: pautaItemInclude,
        });
        if (!item) {
            throw new NotFoundException('Item de pauta não encontrado');
        }

        const materia = item.materia;
        if (materia.tenantId !== tenantId) {
            throw new NotFoundException('Matéria não encontrada');
        }

        return item;
    }

    async addPautaItem(
        tenantId: string,
        sessaoId: string,
        dto: AddPautaItemDto,
    ) {
        await this.assertSessaoGerenciaPauta(tenantId, sessaoId);

        const materia = await this.prisma.materia.findFirst({
            where: { id: dto.materiaId, ...tenantWhere(tenantId) },
            include: { tipo: true },
        });
        if (!materia) throw new NotFoundException('Matéria não encontrada');

        const activeItems = await this.listActivePautaItems(sessaoId);
        assertMateriaNaoDuplicadaNaPauta(dto.materiaId, activeItems);

        const ordem =
            dto.ordem ??
            (activeItems.length === 0
                ? 1
                : Math.max(...activeItems.map((i) => i.ordem)) + 1);
        assertOrdemDisponivelNaPauta(ordem, activeItems);

        // RN-SPL-04: Inferir tipoPautaItem e fase pela sigla do tipo de matéria
        const sigla = materia.tipo?.sigla ?? '';
        const SIGLAS_LEITURA = ['OFC', 'IND', 'REQ'];
        const isLeitura = SIGLAS_LEITURA.includes(sigla);
        const tipoPautaItemInferido = isLeitura ? 'LEITURA' : 'DELIBERACAO';
        const faseInferida = isLeitura ? 'PEQUENO_EXPEDIENTE' : 'ORDEM_DO_DIA';

        const pautaItem = await this.prisma.pautaItem.create({
            data: {
                sessaoId,
                materiaId: dto.materiaId,
                ordem,
                fase: (dto.fase ?? faseInferida) as any,
                tipoPautaItem: (dto.tipoPautaItem ?? tipoPautaItemInferido) as any,
            },
            include: pautaItemInclude,
        });

        return pautaItem;
    }

    async updatePautaItem(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: UpdatePautaItemDto,
    ) {
        await this.assertSessaoGerenciaPauta(tenantId, sessaoId);

        const item = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
        });
        if (!item) {
            throw new NotFoundException('Item de pauta não encontrado');
        }

        const activeItems = await this.listActivePautaItems(sessaoId);
        if (dto.ordem !== undefined) {
            assertOrdemDisponivelNaPauta(dto.ordem, activeItems, pautaItemId);
        }

        return this.prisma.pautaItem.update({
            where: { id: pautaItemId },
            data: {
                ordem: dto.ordem,
                fase: dto.fase,
            },
            include: pautaItemInclude,
        });
    }

    async removerPautaItem(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ) {
        await this.assertSessaoGerenciaPauta(tenantId, sessaoId);

        const item = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
            include: { materia: true, votacao: true },
        });
        if (!item) throw new NotFoundException('Item de pauta não encontrado');

        const votacaoAberta =
            !!item.votacao && item.votacao.realizadaAt === null;
        assertPodeRemoverItemPauta(votacaoAberta);

        if (item.materia.status === StatusMateria.EM_PAUTA) {
            await this.materiaRepository.tramitarMateria(
                tenantId,
                item.materiaId,
                {
                    action: MatterTramitationAction.RETIRAR_DA_PAUTA,
                    observacao: 'Matéria retirada da pauta da sessão plenária',
                },
            );
        }

        return this.prisma.pautaItem.update({
            where: { id: pautaItemId },
            data: { isRemoved: true },
            include: pautaItemInclude,
        });
    }

    async registrarResultadoPauta(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarResultadoPautaDto,
    ) {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, ...tenantWhere(tenantId) },
            include: { situacao: true },
        });
        if (!sessao)
            throw new NotFoundException('Sessão plenária não encontrada');

        assertSessaoAceitaPauta(sessao.situacao);

        if (
            dto.resultado !== ResultadoPauta.APROVADO &&
            dto.resultado !== ResultadoPauta.REJEITADO
        ) {
            throw new BadRequestException(
                'Para atualizar o status da matéria use resultado APROVADO ou REJEITADO',
            );
        }

        const pautaItem = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
            include: { materia: true },
        });
        if (!pautaItem)
            throw new NotFoundException('Item de pauta não encontrado');

        if (pautaItem.materia.tenantId !== tenantId) {
            throw new NotFoundException('Matéria não encontrada');
        }

        await this.materiaRepository.tramitarMateria(
            tenantId,
            pautaItem.materiaId,
            {
                action: this.mapResultadoParaAcao(dto.resultado),
                observacao: `Resultado registrado na pauta: ${dto.resultado}`,
            },
        );

        return this.prisma.pautaItem.update({
            where: { id: pautaItemId },
            data: { resultado: dto.resultado },
            include: { materia: true },
        });
    }

    private async assertParlamentarMandatoAtivo(
        parlamentarId: string,
        legislaturaId?: string | null,
    ) {
        const where: Prisma.ParlamentarMandatoWhereInput = {
            parlamentarId,
            ativo: true,
        };
        if (legislaturaId) {
            where.legislaturaId = legislaturaId;
        }

        const mandato = await this.prisma.parlamentarMandato.findFirst({
            where,
        });
        if (!mandato) {
            throw new BadRequestException(
                legislaturaId
                    ? 'Parlamentar não possui mandato ativo na legislatura da sessão'
                    : 'Parlamentar não possui mandato ativo',
            );
        }
    }

    async listPresencas(
        tenantId: string,
        sessaoId: string,
        filters: FilterPresencaDto,
    ) {
        await this.findOne(tenantId, sessaoId);

        const where: Prisma.PresencaSessaoWhereInput = { sessaoId };
        if (filters.situacao) where.situacao = filters.situacao;
        if (filters.parlamentarId) where.parlamentarId = filters.parlamentarId;

        return this.prisma.presencaSessao.findMany({
            where,
            include: presencaInclude,
            orderBy: { createdAt: 'asc' },
        });
    }

    async getPresencaById(
        tenantId: string,
        sessaoId: string,
        presencaId: string,
    ) {
        await this.findOne(tenantId, sessaoId);

        const presenca = await this.prisma.presencaSessao.findFirst({
            where: { id: presencaId, sessaoId },
            include: presencaInclude,
        });
        if (!presenca) {
            throw new NotFoundException(
                'Registro de presença não encontrado',
            );
        }
        return presenca;
    }

    async updatePresenca(
        tenantId: string,
        sessaoId: string,
        presencaId: string,
        dto: UpdatePresencaDto,
    ) {
        const sessao = await this.findOne(tenantId, sessaoId);
        assertSessaoNaoEncerrada(sessao.situacao);

        const existing = await this.getPresencaById(
            tenantId,
            sessaoId,
            presencaId,
        );

        const campos = resolveCamposPresencaUpdate(existing, dto);

        return this.prisma.presencaSessao.update({
            where: { id: presencaId },
            data: campos,
            include: presencaInclude,
        });
    }

    async registrarPresenca(
        tenantId: string,
        sessaoId: string,
        dto: RegistrarPresencaDto,
    ) {
        const sessao = await this.findOne(tenantId, sessaoId);
        assertSessaoNaoEncerrada(sessao.situacao);

        if (dto.parliamentarianId) {
            const parliamentarian = await this.prisma.parliamentarian.findFirst({
                where: {
                    id: dto.parliamentarianId,
                    tenantId,
                    isRemoved: false,
                },
            });
            if (!parliamentarian) {
                throw new NotFoundException('Parlamentar não encontrado');
            }

            await this.assertMandateIfProvided(tenantId, dto);

            const existing = await this.prisma.presencaSessao.findUnique({
                where: {
                    sessaoId_parliamentarianId: {
                        sessaoId,
                        parliamentarianId: dto.parliamentarianId,
                    },
                },
            });
            assertPresencaNaoDuplicada(!!existing);

            const campos = resolveCamposPresenca(dto);

            return this.prisma.presencaSessao.create({
                data: {
                    sessaoId,
                    parliamentarianId: dto.parliamentarianId,
                    ...campos,
                },
                include: presencaInclude,
            });
        }

        if (!dto.parlamentarId) {
            throw new BadRequestException(
                'Informe parlamentarId ou parliamentarianId',
            );
        }

        const parlamentar = await this.prisma.parlamentar.findFirst({
            where: { id: dto.parlamentarId, ...tenantWhere(tenantId) },
        });
        if (!parlamentar) {
            throw new NotFoundException('Parlamentar não encontrado');
        }

        const legislaturaId = sessao.sessaoLegislativa?.legislaturaId ?? null;
        await this.assertParlamentarMandatoAtivo(
            dto.parlamentarId,
            legislaturaId,
        );
        await this.assertMandateIfProvided(tenantId, dto);

        const existing = await this.prisma.presencaSessao.findUnique({
            where: {
                sessaoId_parlamentarId: {
                    sessaoId,
                    parlamentarId: dto.parlamentarId,
                },
            },
        });
        assertPresencaNaoDuplicada(!!existing);

        const campos = resolveCamposPresenca(dto);

        return this.prisma.presencaSessao.create({
            data: {
                sessaoId,
                parlamentarId: dto.parlamentarId,
                ...campos,
            },
            include: presencaInclude,
        });
    }

    private async assertMandateIfProvided(
        tenantId: string,
        dto: MandateProfileRefs,
    ) {
        const { parliamentarianProfileId, legislatureProfileId } = dto;
        if (!parliamentarianProfileId && !legislatureProfileId) return;

        if (!parliamentarianProfileId || !legislatureProfileId) {
            throw new BadRequestException(
                'Informe parliamentarianProfileId e legislatureProfileId para validar mandato',
            );
        }

        const hasActiveMandate = await this.mandateChecker.hasActiveMandate(
            tenantId,
            parliamentarianProfileId,
            legislatureProfileId,
        );
        assertParliamentarianHasActiveMandate(hasActiveMandate);
    }

    // ─── Novos métodos DDD (M4) ────────────────────────────────────────────

    async findSessaoById(id: string, tenantId: string): Promise<SessaoPlenariaEntity | null> {
        const raw = await this.prisma.sessaoPlenaria.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        if (!raw) return null;

        const entity = new SessaoPlenariaEntity();
        entity.id = raw.id;
        entity.tenantId = raw.tenantId;
        entity.tipoSessaoId = raw.tipoSessaoId;
        entity.sessaoLegislativaId = raw.sessaoLegislativaId;
        entity.dataInicio = raw.dataInicio;
        entity.dataFim = raw.dataFim;
        entity.statusSessao = raw.statusSessao as unknown as StatusSessao;
        entity.faseAtual = raw.faseAtual as unknown as FaseSessao;
        entity.dataAbertura = raw.dataAbertura;
        entity.dataSuspensao = raw.dataSuspensao;
        entity.dataEncerramento = raw.dataEncerramento;
        entity.quorumMinimo = raw.quorumMinimo;
        entity.quorumPresente = raw.quorumPresente;
        entity.responsavelAberturaId = raw.responsavelAberturaId;
        entity.observacoes = raw.observacoes;
        entity.isRemoved = raw.isRemoved;
        entity.createdAt = raw.createdAt;
        entity.updatedAt = raw.updatedAt;
        return entity;
    }

    async transicionarStatus(
        id: string,
        tenantId: string,
        dados: TransicionarStatusDados,
    ): Promise<void> {
        const agora = new Date();
        const dataFields: Partial<{
            dataAbertura: Date;
            dataSuspensao: Date;
            dataEncerramento: Date;
            responsavelAberturaId: string;
            quorumPresente: number;
            observacoes: string;
        }> = {};

        if (dados.novoStatus === StatusSessao.ABERTA) {
            dataFields.dataAbertura = agora;
            if (dados.responsavelId) {
                dataFields.responsavelAberturaId = dados.responsavelId;
            }
            if (dados.quorumPresente !== undefined) {
                dataFields.quorumPresente = dados.quorumPresente;
            }
        } else if (dados.novoStatus === StatusSessao.SUSPENSA) {
            dataFields.dataSuspensao = agora;
        } else if (dados.novoStatus === StatusSessao.ENCERRADA) {
            dataFields.dataEncerramento = agora;
        }

        if (dados.observacao) {
            dataFields.observacoes = dados.observacao;
        }

        const codigoSituacao = statusSessaoToCodigoSituacao(
            dados.novoStatus,
        ) as CodigoSituacaoSessao;
        const situacaoId = await this.resolveSituacaoIdByCodigo(codigoSituacao);

        await this.prisma.sessaoPlenaria.update({
            where: { id, tenantId, isRemoved: false },
            data: {
                statusSessao: dados.novoStatus as unknown as PrismaStatusSessao,
                situacaoId,
                ...dataFields,
            },
        });
    }

    async calcularQuorum(sessaoId: string, tenantId: string): Promise<QuorumInfo> {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, tenantId, isRemoved: false },
            include: {
                sessaoLegislativa: { include: { legislatura: true } },
                presencas: { where: { situacao: 'PRESENTE' } },
            },
        });
        if (!sessao) throw new Error('Sessão não encontrada');

        const legislaturaId = sessao.sessaoLegislativa?.legislaturaId;
        const totalParlamentares = await this.prisma.parlamentarMandato.count({
            where: {
                ativo: true,
                parlamentar: { tenantId },
                ...(legislaturaId ? { legislaturaId } : {}),
            },
        });

        const quorumMinimo = Math.ceil(totalParlamentares / 2) + 1;
        const quorumPresente = sessao.presencas.length;

        return {
            quorumMinimo,
            quorumPresente,
            temQuorum: quorumPresente >= quorumMinimo,
        };
    }

    async publicarPauta(sessaoId: string, tenantId: string): Promise<void> {
        await this.prisma.sessaoPlenaria.findFirstOrThrow({
            where: { id: sessaoId, tenantId, isRemoved: false },
        });

        await this.prisma.pautaItem.updateMany({
            where: {
                sessaoId,
                isRemoved: false,
                statusPauta: PrismaStatusPautaItem.RASCUNHO,
            },
            data: {
                statusPauta: PrismaStatusPautaItem.PUBLICADA,
                publicadaEm: new Date(),
            },
        });
    }

    // M11 — setar fase da sessão
    async setFase(id: string, tenantId: string, fase: FaseSessao): Promise<void> {
        await this.prisma.sessaoPlenaria.update({
            where: { id, tenantId, isRemoved: false },
            data: { faseAtual: fase as unknown as PrismaFaseSessao },
        });
    }

    // M13 — buscar sessão ativa (ABERTA ou SUSPENSA) para o parlamentar
    async findAtiva(tenantId: string): Promise<SessaoPlenariaEntity | null> {
        const raw = await this.prisma.sessaoPlenaria.findFirst({
            where: {
                tenantId,
                isRemoved: false,
                statusSessao: {
                    in: ['ABERTA', 'SUSPENSA'] as PrismaStatusSessao[],
                },
            },
            orderBy: { dataAbertura: 'desc' },
        });
        if (!raw) return null;

        const entity = new SessaoPlenariaEntity();
        entity.id = raw.id;
        entity.tenantId = raw.tenantId;
        entity.tipoSessaoId = raw.tipoSessaoId;
        entity.sessaoLegislativaId = raw.sessaoLegislativaId;
        entity.dataInicio = raw.dataInicio;
        entity.dataFim = raw.dataFim;
        entity.statusSessao = raw.statusSessao as unknown as StatusSessao;
        entity.faseAtual = raw.faseAtual as unknown as FaseSessao;
        entity.dataAbertura = raw.dataAbertura;
        entity.dataSuspensao = raw.dataSuspensao;
        entity.dataEncerramento = raw.dataEncerramento;
        entity.quorumMinimo = raw.quorumMinimo;
        entity.quorumPresente = raw.quorumPresente;
        entity.responsavelAberturaId = raw.responsavelAberturaId;
        entity.observacoes = raw.observacoes;
        entity.isRemoved = raw.isRemoved;
        entity.createdAt = raw.createdAt;
        entity.updatedAt = raw.updatedAt;
        return entity;
    }
}
