import { api, apiList } from '../client';
import { API_PATHS } from '../paths';
import type { SessaoStatus } from '../../types/legislative';

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

const base = API_PATHS.sessoes;

export const sessoesApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        apiList<SessaoPlenaria>(base, params),

    getById: (id: string) => api<SessaoPlenaria>(`${base}/${id}`),

    create: (body: Record<string, unknown>) =>
        api<SessaoPlenaria>(base, { method: 'POST', body: JSON.stringify(body) }),

    update: (id: string, body: Record<string, unknown>) =>
        api<SessaoPlenaria>(`${base}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    abrir: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesAbrir(id), { method: 'POST' }),

    suspender: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesSuspender(id), { method: 'POST' }),

    encerrar: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesEncerrar(id), { method: 'POST' }),

    cancelar: (id: string) =>
        api<SessaoPlenaria>(API_PATHS.sessoesCancelar(id), { method: 'POST' }),

    getQuorum: (id: string) =>
        api<QuorumInfo>(API_PATHS.sessoesQuorum(id)),

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
};
