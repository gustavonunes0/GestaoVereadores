import { api, apiList } from '../client';
import { API_PATHS } from '../paths';
import type { SessaoStatus } from '../../types/legislative';
import type { JitsiTokenData, PautaItemDetalhe, SessaoPlenariaDetalhe } from '../../types/sessoes';

export interface SessaoPlenaria {
    id: string;
    numero: string;
    ano: number;
    tipo: { id: string; nome: string };
    statusSessao: SessaoStatus;
    dataAbertura?: string;
    dataEncerramento?: string;
    dataSuspensao?: string;
    quorumPresente?: number;
    pautaItens?: PautaItem[];
}

export interface PautaItem {
    id: string;
    ordem: number;
    materia: { id: string; identificacao: string; ementa: string };
    statusPauta?: string;
    publicadaEm?: string;
    votacao?: VotacaoResumo;
}

export interface VotacaoResumo {
    id: string;
    tipo: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    encerrada: boolean;
    encerradaAt?: string;
    quorumPresente?: number;
}

export interface QuorumInfo {
    minimo: number;
    presente: number;
    temQuorum: boolean;
}

export type LegislaturaSessaoRef = {
    id: string;
    numero: number;
    sessoesLegislativas: { id: string; numero: number }[];
};

export type LegislaturaContextoSessoes = {
    legislaturas: LegislaturaSessaoRef[];
    vigente: {
        legislaturaId: string;
        legislaturaNumero: number;
        sessaoLegislativaId: string | null;
        sessaoLegislativaNumero: number | null;
    } | null;
};

type QuorumApiResponse = {
    quorumMinimo: number;
    quorumPresente: number;
    temQuorum: boolean;
};

function mapQuorum(raw: QuorumApiResponse): QuorumInfo {
    return {
        minimo: raw.quorumMinimo,
        presente: raw.quorumPresente,
        temQuorum: raw.temQuorum,
    };
}

const base = API_PATHS.sessoes;

export const sessoesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<SessaoPlenaria>(base, params),

    getContextoLegislatura: () =>
        api<LegislaturaContextoSessoes>(API_PATHS.sessoesContextoLegislatura),

    getById: (id: string) => api<SessaoPlenaria>(`${base}/${id}`),

    create: (body: Record<string, unknown>) =>
        api<SessaoPlenaria>(base, { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: Record<string, unknown>) =>
        api<SessaoPlenaria>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    remove: (id: string) => api<void>(`${base}/${id}`, { method: 'DELETE' }),

    abrir: (id: string, body?: { observacao?: string; quorumPresente?: number }) =>
        api<SessaoPlenaria>(API_PATHS.sessoesAbrir(id), {
            method: 'POST',
            body: JSON.stringify(body ?? {}),
        }),

    suspender: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesSuspender(id), { method: 'POST' }),

    encerrar: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesEncerrar(id), { method: 'POST' }),

    cancelar: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesCancelar(id), { method: 'POST' }),

    getQuorum: async (id: string) =>
        mapQuorum(await api<QuorumApiResponse>(API_PATHS.sessoesQuorum(id))),

    getJitsiToken: (id: string) =>
        api<JitsiTokenData>(API_PATHS.sessaoJitsiToken(id)),

    addPautaItem: (sessaoId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/pauta`, { method: 'POST', body: JSON.stringify(body) }),

    registrarPresenca: (sessaoId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/presencas`, { method: 'POST', body: JSON.stringify(body) }),

    abrirVotacao: (sessaoId: string, pautaItemId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    registrarVoto: (sessaoId: string, pautaItemId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao/votos`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    finalizarVotacao: (sessaoId: string, pautaItemId: string, body: Record<string, unknown>) =>
        api(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao/finalizar`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    encerrarVotacao: (sessaoId: string, pautaItemId: string, body?: Record<string, unknown>) =>
        api<{
            votacaoId: string;
            resultado: string;
            votosSim: number;
            votosNao: number;
            abstencoes: number;
        }>(`${base}/${sessaoId}/pauta/${pautaItemId}/votacao/encerrar`, {
            method: 'PATCH',
            body: JSON.stringify(body ?? {}),
        }),

    getDetalhe: (id: string) =>
        api<SessaoPlenariaDetalhe>(API_PATHS.sessaoById(id)),

    updateLinkYoutube: (id: string, linkYoutube: string) =>
        api<SessaoPlenariaDetalhe>(API_PATHS.sessaoById(id), {
            method: 'PATCH',
            body: JSON.stringify({ linkYoutube }),
        }),

    getPauta: (sessaoId: string) =>
        api<PautaItemDetalhe[]>(API_PATHS.sessoesPauta(sessaoId)),

    getPautaItem: (sessaoId: string, itemId: string) =>
        api<PautaItemDetalhe>(API_PATHS.sessoesPautaItem(sessaoId, itemId)),

    addPautaItemDetalhe: (sessaoId: string, body: Record<string, unknown>) =>
        api<PautaItemDetalhe>(API_PATHS.sessoesPauta(sessaoId), {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    removePautaItem: (sessaoId: string, itemId: string) =>
        api<void>(API_PATHS.sessoesPautaItem(sessaoId, itemId), { method: 'DELETE' }),

    reordenarPautaItem: (sessaoId: string, itemId: string, ordem: number) =>
        api<PautaItemDetalhe>(API_PATHS.sessoesPautaItem(sessaoId, itemId), {
            method: 'PATCH',
            body: JSON.stringify({ ordem }),
        }),

    publicarPauta: (sessaoId: string) =>
        api<void>(API_PATHS.sessoesPautaPublicar(sessaoId), { method: 'PATCH' }),
};
