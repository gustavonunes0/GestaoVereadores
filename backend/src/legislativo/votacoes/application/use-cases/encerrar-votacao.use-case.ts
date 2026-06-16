import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VOTACAO_REPOSITORY } from '../../votacoes.tokens';
import { VotacaoRepository } from '../../domain/repositories/votacao.repository';
import { ResultadoVotacaoService } from '../../domain/services/resultado-votacao.service';
import { ContagemVotosService } from '../../domain/services/contagem-votos.service';
import { EncerrarVotacaoDto } from '../dto/encerrar-votacao.dto';
import { PrismaService } from '../../../../prisma/prisma.service';

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
        votacaoId: string,
        dto: EncerrarVotacaoDto,
        responsavelId: string,
    ): Promise<{ votacaoId: string; resultado: string; votosSim: number; votosNao: number; abstencoes: number }> {
        const votacao = await this.repository.findVotacaoById(votacaoId);
        if (!votacao) throw new NotFoundException('Votação não encontrada');

        if (votacao.estaEncerrada()) {
            throw new BadRequestException('Votação já foi encerrada');
        }

        // Verifica ownership via pautaItem → sessão → tenant
        const pautaItem = await this.prisma.pautaItem.findFirst({
            where: { id: votacao.pautaItemId, isRemoved: false },
            include: {
                sessao: { select: { tenantId: true } },
                materia: { select: { id: true, tenantId: true } },
            },
        });
        if (!pautaItem || pautaItem.sessao.tenantId !== tenantId) {
            throw new NotFoundException('Votação não encontrada');
        }

        // Calcular contagem via groupBy — nunca inserir manualmente
        const contagem = await this.repository.calcularContagem(votacaoId);
        const resultado = this.resultadoService.determinar(contagem.votosSim, contagem.votosNao);

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
                responsavelId,
                quorumVotacao: dto.quorumVotacao,
                motivoEmpate: resultado === 'EMPATADO' ? dto.motivoEmpate : undefined,
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
