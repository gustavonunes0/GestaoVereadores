import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    ResultadoPauta,
    ResultadoVotacao,
    TipoVotacao,
    Prisma,
    Voto,
} from '@prisma/client';
import { votacaoInclude } from '../../../../common/prisma/prisma-includes';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MatterTramitationAction } from '../../../materias/domain/enums/matter-tramitation-action.enum';
import { MateriaRepository } from '../../../materias/domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../../materias/materias.tokens';
import { ActiveParliamentarianMandateChecker } from '../../../parlamentares/mandatos/domain/contracts/active-parliamentarian-mandate-checker';
import { assertParliamentarianHasActiveMandate } from '../../../parlamentares/mandatos/domain/services/mandate-workflow';
import { ACTIVE_PARLIAMENTARIAN_MANDATE_CHECKER } from '../../../parlamentares/mandatos/mandatos.tokens';
import { assertMateriaNaPautaParaVotacao } from '../../../sessoes-plenarias/domain/services/pauta-workflow';
import { contaPresencaParaQuorum } from '../../../sessoes-plenarias/domain/services/presenca-workflow';
import { assertSessaoAceitaPauta } from '../../../sessoes-plenarias/domain/services/sessao-workflow';
import {
    AbrirVotacaoDto,
    FinalizarVotacaoDto,
} from '../../application/dto/votacao.dto';
import {
    FilterVotoDto,
    RegistrarVotoDto,
    UpdateVotoDto,
} from '../../application/dto/voto.dto';
import {
    VotacaoRepository,
    EncerrarVotacaoDados,
} from '../../domain/repositories/votacao.repository';
import { VotacaoEntity, TipoVotacaoEnum, ResultadoVotacaoEnum } from '../../domain/entities/votacao.entity';
import { ContagemVotos, ContagemVotosService } from '../../domain/services/contagem-votos.service';
import {
    assertPresencaQuandoExigida,
    assertVotoNaoDuplicado,
    parlamentarPresenteParaVotar,
} from '../../domain/services/voto-workflow';
import {
    assertQuorumAtingido,
    assertTipoAceitaVotoIndividual,
    assertVotacaoAberta,
    assertVotacaoNaoExisteParaPauta,
    contarVotos,
    montarResultadoVotacao,
    resolverTotaisFinalizacao,
} from '../../domain/services/votacao-workflow';

type MandateProfileRefs = {
    parliamentarianProfileId?: string;
    legislatureProfileId?: string;
};

const votoParlamentarInclude = {
    parlamentar: { include: { pessoa: true } },
} as const;

@Injectable()
export class PrismaVotacaoRepository implements VotacaoRepository {
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

    private async assertQuorumSessao(
        tenantId: string,
        sessaoId: string,
        requerQuorum: boolean,
    ) {
        const [presencas, totalParlamentares] = await Promise.all([
            this.prisma.presencaSessao.findMany({
                where: { sessaoId },
                select: { presente: true, situacao: true },
            }),
            this.prisma.parlamentar.count({
                where: { ...tenantWhere(tenantId), ativo: true },
            }),
        ]);
        const presentes = presencas.filter((presenca) =>
            contaPresencaParaQuorum(presenca.situacao, presenca.presente),
        ).length;
        assertQuorumAtingido(presentes, totalParlamentares, requerQuorum);
    }

    private async getPautaItemVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ) {
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, ...tenantWhere(tenantId) },
            include: {
                situacao: true,
                tipoSessao: true,
                sessaoLegislativa: true,
            },
        });
        if (!sessao) {
            throw new NotFoundException('Sessão plenária não encontrada');
        }

        assertSessaoAceitaPauta(sessao.situacao);

        const pautaItem = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
            include: {
                materia: true,
                votacao: votacaoInclude,
            },
        });
        if (!pautaItem) {
            throw new NotFoundException('Item de pauta não encontrado');
        }
        if (pautaItem.materia.tenantId !== tenantId) {
            throw new NotFoundException('Matéria não encontrada');
        }

        assertMateriaNaPautaParaVotacao(pautaItem);

        return { sessao, pautaItem };
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

    private async recalcularTotaisVotacao(votacaoId: string) {
        const votos = await this.prisma.votoParlamentar.findMany({
            where: { votacaoId },
            select: { voto: true },
        });
        const totais = contarVotos(votos.map((item) => item.voto));
        await this.prisma.votacao.update({
            where: { id: votacaoId },
            data: totais,
        });
    }

    private async assertContextoVotoIndividual(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: MandateProfileRefs & { parlamentarId: string },
    ) {
        const { sessao, pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada');
        }

        const votacao = pautaItem.votacao;
        assertVotacaoAberta(votacao.realizadaAt);
        assertTipoAceitaVotoIndividual(votacao.tipoVotacao);

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

        const presenca = await this.prisma.presencaSessao.findUnique({
            where: {
                sessaoId_parlamentarId: {
                    sessaoId,
                    parlamentarId: dto.parlamentarId,
                },
            },
        });
        const estaPresente = parlamentarPresenteParaVotar(
            presenca,
            contaPresencaParaQuorum,
        );
        assertPresencaQuandoExigida(votacao.exigePresenca, estaPresente);

        return { votacao };
    }

    async abrirVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: AbrirVotacaoDto,
    ) {
        const { sessao, pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        assertVotacaoNaoExisteParaPauta(!!pautaItem.votacao);

        await this.assertQuorumSessao(
            tenantId,
            sessaoId,
            sessao.tipoSessao.requerQuorum,
        );

        return this.prisma.votacao.create({
            data: {
                pautaItemId,
                tipoVotacao: dto.tipoVotacao,
                exigePresenca: dto.exigePresenca ?? true,
            },
            include: votacaoInclude.include,
        });
    }

    async obterVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
    ) {
        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException(
                'Votação não encontrada para este item de pauta',
            );
        }

        return pautaItem.votacao;
    }

    async listVotos(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        filters: FilterVotoDto,
    ) {
        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada');
        }

        const where: Prisma.VotoParlamentarWhereInput = {
            votacaoId: pautaItem.votacao.id,
        };
        if (filters.parlamentarId) where.parlamentarId = filters.parlamentarId;
        if (filters.voto) where.voto = filters.voto;

        return this.prisma.votoParlamentar.findMany({
            where,
            include: votoParlamentarInclude,
            orderBy: { id: 'asc' },
        });
    }

    async getVotoById(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
    ) {
        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada');
        }

        const voto = await this.prisma.votoParlamentar.findFirst({
            where: { id: votoId, votacaoId: pautaItem.votacao.id },
            include: votoParlamentarInclude,
        });
        if (!voto) {
            throw new NotFoundException('Voto parlamentar não encontrado');
        }
        return voto;
    }

    async registrarVoto(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: RegistrarVotoDto,
    ) {
        const { votacao } = await this.assertContextoVotoIndividual(
            tenantId,
            sessaoId,
            pautaItemId,
            dto,
        );

        const existing = await this.prisma.votoParlamentar.findUnique({
            where: {
                votacaoId_parlamentarId: {
                    votacaoId: votacao.id,
                    parlamentarId: dto.parlamentarId,
                },
            },
        });
        assertVotoNaoDuplicado(!!existing);

        const voto = await this.prisma.votoParlamentar.create({
            data: {
                votacaoId: votacao.id,
                parlamentarId: dto.parlamentarId,
                voto: dto.voto,
            },
            include: votoParlamentarInclude,
        });

        await this.recalcularTotaisVotacao(votacao.id);
        return voto;
    }

    async updateVoto(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        votoId: string,
        dto: UpdateVotoDto,
    ) {
        const existing = await this.getVotoById(
            tenantId,
            sessaoId,
            pautaItemId,
            votoId,
        );

        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );
        const votacao = pautaItem.votacao!;
        assertVotacaoAberta(votacao.realizadaAt);
        assertTipoAceitaVotoIndividual(votacao.tipoVotacao);

        const voto = await this.prisma.votoParlamentar.update({
            where: { id: existing.id },
            data: { voto: dto.voto },
            include: votoParlamentarInclude,
        });

        await this.recalcularTotaisVotacao(votacao.id);
        return voto;
    }

    private async listarVotosIndividuais(votacaoId: string) {
        const votos = await this.prisma.votoParlamentar.findMany({
            where: { votacaoId },
            select: { voto: true },
        });
        return votos.map((item) => item.voto);
    }

    private computeResultPayload(
        tipoVotacao: TipoVotacao,
        dto: FinalizarVotacaoDto,
        individualVotes: Voto[],
    ) {
        const totaisRes = resolverTotaisFinalizacao(
            tipoVotacao,
            dto,
            individualVotes,
        );
        const outcome = montarResultadoVotacao(
            totaisRes.votosSim,
            totaisRes.votosNao,
            totaisRes.abstencoes,
        );

        return {
            ...outcome,
            calculadoAutomaticamente: totaisRes.calculadoAutomaticamente,
        };
    }

    private buildStoredResultPayload(votacao: {
        tipoVotacao: TipoVotacao;
        votosSim: number;
        votosNao: number;
        abstencoes: number;
        resultado: ResultadoVotacao;
    }) {
        const outcome = montarResultadoVotacao(
            votacao.votosSim,
            votacao.votosNao,
            votacao.abstencoes,
        );

        return {
            ...outcome,
            calculadoAutomaticamente:
                votacao.tipoVotacao !== TipoVotacao.SIMBOLICA,
        };
    }

    async calcularResultadoVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto,
        preview = true,
    ) {
        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada');
        }

        const votacao = pautaItem.votacao;

        if (votacao.realizadaAt && votacao.resultado) {
            return this.buildStoredResultPayload({
                tipoVotacao: votacao.tipoVotacao,
                votosSim: votacao.votosSim,
                votosNao: votacao.votosNao,
                abstencoes: votacao.abstencoes,
                resultado: votacao.resultado,
            });
        }

        if (!preview) {
            assertVotacaoAberta(votacao.realizadaAt);
        }

        const individualVotes =
            votacao.tipoVotacao === TipoVotacao.SIMBOLICA
                ? []
                : await this.listarVotosIndividuais(votacao.id);

        return this.computeResultPayload(
            votacao.tipoVotacao,
            dto,
            individualVotes,
        );
    }

    private async aplicarResultadoNaPautaEMateria(
        tenantId: string,
        pautaItemId: string,
        materiaId: string,
        payload: ReturnType<typeof montarResultadoVotacao>,
    ) {
        if (payload.atualizaPauta && payload.resultadoPauta) {
            await this.prisma.pautaItem.update({
                where: { id: pautaItemId },
                data: { resultado: payload.resultadoPauta },
            });
        }

        if (payload.atualizaMateria && payload.resultadoPauta) {
            await this.materiaRepository.tramitarMateria(tenantId, materiaId, {
                action: this.mapResultadoParaAcao(
                    payload.resultadoPauta as 'APROVADO' | 'REJEITADO',
                ),
                observacao: `Resultado da votação: ${payload.resultadoPauta}`,
            });
        }
    }

    async finalizarVotacao(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: FinalizarVotacaoDto,
    ) {
        const { pautaItem } = await this.getPautaItemVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
        );

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada');
        }

        const votacao = pautaItem.votacao;
        assertVotacaoAberta(votacao.realizadaAt);

        const payload = await this.calcularResultadoVotacao(
            tenantId,
            sessaoId,
            pautaItemId,
            dto,
            false,
        );

        await this.prisma.votacao.update({
            where: { id: votacao.id },
            data: {
                votosSim: payload.votosSim,
                votosNao: payload.votosNao,
                abstencoes: payload.abstencoes,
                resultado: payload.resultado,
                realizadaAt: new Date(),
            },
        });

        await this.aplicarResultadoNaPautaEMateria(
            tenantId,
            pautaItemId,
            pautaItem.materiaId,
            payload,
        );

        return this.prisma.votacao.findUnique({
            where: { id: votacao.id },
            include: votacaoInclude.include,
        });
    }

    // ─── Novos métodos DDD (M5) ────────────────────────────────────────────

    private readonly contagemService = new ContagemVotosService();

    async findVotacaoById(id: string): Promise<VotacaoEntity | null> {
        const raw = await this.prisma.votacao.findUnique({ where: { id } });
        if (!raw) return null;

        const entity = new VotacaoEntity();
        entity.id = raw.id;
        entity.pautaItemId = raw.pautaItemId;
        entity.tipoVotacao = raw.tipoVotacao as unknown as TipoVotacaoEnum;
        entity.exigePresenca = raw.exigePresenca;
        entity.votosSim = raw.votosSim;
        entity.votosNao = raw.votosNao;
        entity.abstencoes = raw.abstencoes;
        entity.resultado = raw.resultado as unknown as ResultadoVotacaoEnum | null;
        entity.realizadaAt = raw.realizadaAt;
        entity.encerradaAt = raw.encerradaAt;
        entity.responsavelId = raw.responsavelId;
        entity.quorumVotacao = raw.quorumVotacao;
        entity.motivoEmpate = raw.motivoEmpate;
        entity.observacoes = raw.observacoes;
        entity.createdAt = raw.createdAt;
        return entity;
    }

    async calcularContagem(votacaoId: string): Promise<ContagemVotos> {
        const groupByResult = await this.prisma.votoParlamentar.groupBy({
            by: ['voto'],
            where: { votacaoId },
            _count: { voto: true },
        });

        return this.contagemService.calcularDeGroupBy(groupByResult);
    }

    async encerrar(
        votacaoId: string,
        pautaItemId: string,
        tenantId: string,
        materiaId: string,
        dados: EncerrarVotacaoDados,
    ): Promise<void> {
        const resultadoPauta =
            dados.resultado === ResultadoVotacaoEnum.APROVADO
                ? ResultadoPauta.APROVADO
                : dados.resultado === ResultadoVotacaoEnum.REJEITADO
                  ? ResultadoPauta.REJEITADO
                  : null;

        await this.prisma.$transaction(async (tx) => {
            await tx.votacao.update({
                where: { id: votacaoId },
                data: {
                    votosSim: dados.votosSim,
                    votosNao: dados.votosNao,
                    abstencoes: dados.abstencoes,
                    resultado: dados.resultado as unknown as ResultadoVotacao,
                    encerradaAt: new Date(),
                    responsavelId: dados.responsavelId,
                    quorumVotacao: dados.quorumVotacao,
                    motivoEmpate: dados.motivoEmpate,
                    observacoes: dados.observacoes,
                    realizadaAt: new Date(),
                },
            });

            if (resultadoPauta) {
                await tx.pautaItem.update({
                    where: { id: pautaItemId },
                    data: { resultado: resultadoPauta },
                });
            }
        });

        if (
            dados.resultado === ResultadoVotacaoEnum.APROVADO ||
            dados.resultado === ResultadoVotacaoEnum.REJEITADO
        ) {
            await this.materiaRepository.tramitarMateria(tenantId, materiaId, {
                action: this.mapResultadoParaAcao(dados.resultado as 'APROVADO' | 'REJEITADO'),
                observacao: `Resultado da votação: ${dados.resultado}`,
            });
        }
    }
}
