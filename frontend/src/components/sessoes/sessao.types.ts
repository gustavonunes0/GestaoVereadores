import type { PautaItemDeliberacao } from './SessaoDeliberacaoPanel';
import type { MateriaStatus, SessaoStatus } from '../../types/legislative';

export type Sessao = {
    id: string;
    dataInicio: string;
    tipo?: { id?: string; nome: string; label?: string };
    situacao?: { nome: string; codigo?: string };
    statusSessao?: SessaoStatus;
    mensagem?: string;
    sessaoLegislativaId?: string | null;
    sessaoLegislativa?: {
        id?: string;
        numero: number;
        legislatura?: { numero: number };
    };
    pautaItens?: PautaItemDeliberacao[];
    presencas?: {
        parlamentarId?: string;
        presente: boolean;
        situacao?: string | { value?: string };
        parlamentar?: {
            id: string;
            nome?: string;
            pessoa?: { nome: string };
        };
    }[];
};

export type MateriaPauta = {
    id: string;
    ementa: string;
    tipo?: { nome: string };
    status?: MateriaStatus;
    emTramitacao?: boolean;
};

export function sessaoAceitaPauta(sessao: {
    statusSessao?: SessaoStatus;
    situacao?: { nome: string; codigo?: string };
}): boolean {
    if (
        sessao.statusSessao === 'ABERTA' ||
        sessao.statusSessao === 'AGENDADA'
    ) {
        return true;
    }
    if (sessao.situacao?.codigo === 'EM_ANDAMENTO') return true;
    const nome = sessao.situacao?.nome?.toLowerCase() ?? '';
    return nome.includes('andamento');
}

export function toDateTimeLocal(iso?: string) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function sessaoLabel(sessao: Sessao): string {
    const data = new Date(sessao.dataInicio).toLocaleString('pt-BR');
    const tipo = sessao.tipo?.nome ?? 'Sessão plenária';
    return `${data} — ${tipo}`;
}
