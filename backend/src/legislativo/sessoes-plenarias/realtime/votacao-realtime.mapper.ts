import { TipoVotacao } from '@prisma/client';
import { VotingDomainService } from '../../votacoes/domain/services/voting-domain.service';
import type {
    VotacaoAbertaPayload,
    VotacaoPlacarPayload,
} from './sessao-realtime.gateway';

const votingService = new VotingDomainService();

type MateriaRef = {
    ementa?: string | null;
    numero?: number | string | null;
    tipo?: { sigla?: string | null; nome?: string | null } | null;
    ano?: { valor?: number } | number | null;
};

export function buildMateriaTituloVotacao(materia?: MateriaRef | null): string {
    if (!materia) return 'Matéria em votação';
    const sigla = materia.tipo?.sigla ?? materia.tipo?.nome ?? 'Matéria';
    const anoVal =
        typeof materia.ano === 'number' ? materia.ano : materia.ano?.valor;
    if (materia.numero != null && materia.numero !== '') {
        return `${sigla} nº ${materia.numero}/${anoVal ?? '?'}`;
    }
    return sigla;
}

export function buildVotacaoAbertaPayload(input: {
    sessaoId: string;
    votacaoId: string;
    pautaItemId: string;
    tipoVotacao: TipoVotacao | string;
    materia?: MateriaRef | null;
    votosSim?: number;
    votosNao?: number;
    abstencoes?: number;
}): VotacaoAbertaPayload {
    const tipo = input.tipoVotacao as TipoVotacao;
    const ementa = input.materia?.ementa?.trim() ?? '';
    return {
        sessaoId: input.sessaoId,
        votacaoId: input.votacaoId,
        pautaItemId: input.pautaItemId,
        tipoVotacao: tipo,
        titulo: buildMateriaTituloVotacao(input.materia),
        ementa: ementa || undefined,
        votosSim: input.votosSim ?? 0,
        votosNao: input.votosNao ?? 0,
        abstencoes: input.abstencoes ?? 0,
        aceitaVotoIndividual: votingService.acceptsIndividualVotes(tipo),
    };
}

/** Placar com IDs de quem votou (sem revelar a opção). */
export function buildVotacaoPlacarPayload(votacao: {
    id: string;
    totais?: {
        votosSim?: number;
        votosNao?: number;
        abstencoes?: number;
    } | null;
    parliamentarianIdsQueVotaram?: string[] | null;
    totalRegistrados?: number | null;
}): VotacaoPlacarPayload {
    const votosSim = votacao.totais?.votosSim ?? 0;
    const votosNao = votacao.totais?.votosNao ?? 0;
    const abstencoes = votacao.totais?.abstencoes ?? 0;
    const ids = votacao.parliamentarianIdsQueVotaram ?? [];
    return {
        votacaoId: votacao.id,
        votosSim,
        votosNao,
        abstencoes,
        totalRegistrados:
            votacao.totalRegistrados ?? votosSim + votosNao + abstencoes,
        parliamentarianIdsQueVotaram: ids,
    };
}
