export type StatusSessao =
    | 'AGENDADA'
    | 'ABERTA'
    | 'SUSPENSA'
    | 'ENCERRADA'
    | 'CANCELADA';

export type FaseSessao =
    | 'NAO_INICIADA'
    | 'EXPEDIENTE'
    | 'ORDEM_DO_DIA'
    | 'EXPLICACOES_PESSOAIS'
    | 'ENCERRADA';

export type FasePauta =
    | 'PEQUENO_EXPEDIENTE'
    | 'GRANDE_EXPEDIENTE'
    | 'ORDEM_DO_DIA'
    | 'EXPLICACOES_PESSOAIS';

export type TipoPautaItem = 'LEITURA' | 'DELIBERACAO' | 'COMUNICACAO';
export type StatusPautaItem = 'RASCUNHO' | 'PUBLICADA' | 'ENCERRADA';

export interface SessaoPlenariaDetalhe {
    id: string;
    dataInicio: string;
    dataFim?: string | null;
    mensagem?: string | null;
    statusSessao: StatusSessao;
    statusSessaoLabel?: string | null;
    dataAbertura?: string | null;
    dataEncerramento?: string | null;
    dataSuspensao?: string | null;
    quorumMinimo?: number | null;
    quorumPresente?: number | null;
    sessaoLegislativaId?: string | null;
    /** Resposta da API (`SessaoPlenariaViewModel`) */
    tipo: {
        id: string;
        nome: string;
        codigo?: string | null;
        label?: string;
        requerQuorum?: boolean;
    };
    situacao?: {
        id: string;
        nome: string;
        codigo?: string | null;
        label?: string;
    };
    faseAtual?: {
        value: FaseSessao;
        label: string;
    } | null;
    linkJitsi?: string | null;
    linkYoutube?: string | null;
    sessaoLegislativa?: {
        id: string;
        numero: number;
        legislatura?: { id: string; numero: number } | null;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export function resolveFaseSessao(
    fase?: FaseSessao | { value: FaseSessao; label?: string } | null,
): FaseSessao {
    if (!fase) return 'NAO_INICIADA';
    if (typeof fase === 'string') return fase;
    return fase.value ?? 'NAO_INICIADA';
}

export function sessaoDetalheLabel(
    sessao: Pick<SessaoPlenariaDetalhe, 'tipo' | 'dataInicio'>,
): string {
    const tipo = sessao.tipo?.label ?? sessao.tipo?.nome ?? 'Sessão plenária';
    const data = new Date(sessao.dataInicio).toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    return `${tipo} — ${data}`;
}

export function sessaoDetalheSubtitulo(
    sessao: Pick<SessaoPlenariaDetalhe, 'dataInicio' | 'mensagem'>,
): string {
    const hora = new Date(sessao.dataInicio).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const partes = [hora];
    const msg = sessao.mensagem?.trim();
    if (msg) partes.push(msg);
    return partes.join(' · ');
}

export interface PautaItemDetalhe {
    id: string;
    sessaoId: string;
    materia: {
        id: string;
        numero?: string | number | null;
        ano?: number | { id: string; valor: number } | null;
        ementa?: string;
        status?: string;
        tipo?: { id: string; nome: string; sigla?: string | null };
        /** Legado — preferir `tipo` */
        tipoMateria?: { id: string; nome: string; sigla?: string | null };
    };
    fase: FasePauta | { value: FasePauta; label?: string };
    tipoPautaItem: TipoPautaItem | { value: TipoPautaItem; label?: string };
    ordem: number;
    status?: StatusPautaItem;
    resultado?: string | null;
    podeVotar?: boolean;
}

export function resolvePautaFase(
    fase: PautaItemDetalhe['fase'],
): FasePauta {
    if (typeof fase === 'string') return fase;
    return fase.value;
}

export function resolvePautaTipo(
    tipo: PautaItemDetalhe['tipoPautaItem'],
): TipoPautaItem {
    if (typeof tipo === 'string') return tipo;
    return tipo.value;
}

export function pautaMateriaRotulo(materia: PautaItemDetalhe['materia']): string {
    const tipo = materia.tipo ?? materia.tipoMateria;
    const sigla = tipo?.sigla ?? tipo?.nome ?? 'Matéria';
    const anoVal =
        typeof materia.ano === 'number' ? materia.ano : materia.ano?.valor;
    const numero = materia.numero;
    if (numero != null && numero !== '') {
        return `${sigla} nº ${numero}/${anoVal ?? '?'}`;
    }
    return sigla;
}

export interface JitsiTokenData {
    token: string;
    roomName: string;
    domain: string;
}

export interface JitsiParticipant {
    id: string;
    displayName: string;
    role: 'moderator' | 'participant';
}

export interface AudioChannel {
    id: string;
    label: string;
    volume: number;
    muted: boolean;
    isOptional?: boolean;
}

export interface CreateSessaoDto {
    tipoSessaoId: string;
    dataInicio: string;
    sessaoLegislativaId?: string;
    linkYoutube?: string;
}

export interface AddPautaItemDto {
    materiaId: string;
    fase: FasePauta;
    tipoPautaItem: TipoPautaItem;
    ordem?: number;
}
