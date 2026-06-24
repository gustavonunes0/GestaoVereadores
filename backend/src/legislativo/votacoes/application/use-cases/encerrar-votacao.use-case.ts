import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { ResultadoVotacaoService } from '../../domain/services/resultado-votacao.service';
import { ContagemVotosService } from '../../domain/services/contagem-votos.service';
import { EncerrarVotacaoDto } from '../dto/encerrar-votacao.dto';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TipoQuorum } from '../../domain/enums/tipo-quorum.enum';
import { ResultadoVotacaoEnum } from '../../domain/entities/votacao.entity';

@Injectable()
export class EncerrarVotacaoUseCase {
    private readonly resultadoService = new ResultadoVotacaoService();
    private readonly contagemService = new ContagemVotosService();

    constructor(
        @Inject(VOTACAO_REPOSITORY)
        private readonly repository: VotacaoRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        pautaItemId: string,
        dto: EncerrarVotacaoDto,
        responsavelId?: string,
    ): Promise<{ votacaoId: string; resultado: string; votosSim: number; votosNao: number; abstencoes: number }> {
        // Resolve votacaoId via pautaItem
        const pautaItem = await this.prisma.pautaItem.findFirst({
            where: { id: pautaItemId, sessaoId, isRemoved: false },
            include: {
                sessao: { select: { tenantId: true } },
                materia: { select: { id: true, tenantId: true } },
                votacao: { select: { id: true } },
            },
        });

        if (!pautaItem || pautaItem.sessao.tenantId !== tenantId) {
            throw new NotFoundException('Item de pauta não encontrado');
        }

        if (!pautaItem.votacao) {
            throw new NotFoundException('Votação não encontrada para este item de pauta');
        }

        const votacaoId = pautaItem.votacao.id;
        const votacao = await this.repository.findVotacaoById(votacaoId);
        if (!votacao) throw new NotFoundException('Votação não encontrada');

        if (votacao.estaEncerrada()) {
            throw new BadRequestException('Votação já foi encerrada');
        }

        const tipoQuorum = (votacao.tipoQuorum ?? TipoQuorum.MAIORIA_SIMPLES) as TipoQuorum;
        const totalMembros = votacao.totalMembros ?? 0;

        // Calcular contagem via groupBy — nunca inserir manualmente
        const contagem = await this.repository.calcularContagem(votacaoId);

        let resultado = this.resultadoService.determinar({
            sim: contagem.votosSim,
            nao: contagem.votosNao,
            totalMembros,
            tipoQuorum,
        });

        let votoQualidade = false;
        if (
            resultado === ResultadoVotacaoEnum.EMPATADO &&
            tipoQuorum === TipoQuorum.MAIORIA_SIMPLES
        ) {
            if (dto.votoQualidade !== undefined) {
                votoQualidade = dto.votoQualidade;
                resultado = dto.votoQualidade
                    ? ResultadoVotacaoEnum.APROVADO
                    : ResultadoVotacaoEnum.REJEITADO;
            }
        }

        await this.repository.encerrar(
            votacaoId,
            pautaItem.id,
            tenantId,
            pautaItem.materia.id,
            {
                votosSim: contagem.votosSim,
                votosNao: contagem.votosNao,
                abstencoes: contagem.abstencoes,
                resultado,
                ...(responsavelId ? { responsavelId, presidenteId: responsavelId } : {}),
                tipoQuorum,
                totalMembros,
                votoQualidade,
                quorumVotacao: dto.quorumVotacao,
                motivoEmpate: resultado === ResultadoVotacaoEnum.EMPATADO ? dto.motivoEmpate : undefined,
                observacoes: dto.observacoes,
            },
        );

        return {
            votacaoId,
            resultado,
            votosSim: contagem.votosSim,
            votosNao: contagem.votosNao,
            abstencoes: contagem.abstencoes,
        };
    }
}
