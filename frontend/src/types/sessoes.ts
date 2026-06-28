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

/** Natureza do item de pauta — define o tratamento visual na tela. */
export type PautaItemCategoria = 'MATERIA' | 'ATO' | 'NORMA' | 'AVISO' | 'COMISSAO';

/** Referência genérica para itens que não são matéria (ato, norma, aviso). */
export interface PautaItemReferencia {
    id?: string;
    titulo?: string;
    numero?: string | number | null;
    ano?: number | { id: string; valor: number } | null;
    descricao?: string;
    tipo?: { id: string; nome: string; sigla?: string | null };
}

export interface PautaItemDetalhe {
    id: string;
    sessaoId: string;
    /** Categoria do item; ausente em itens legados (assume MATERIA). */
    categoria?: PautaItemCategoria;
    materia?: {
        id: string;
        numero?: string | number | null;
        ano?: number | { id: string; valor: number } | null;
        ementa?: string;
        status?: string;
        tipo?: { id: string; nome: string; sigla?: string | null };
        /** Legado — preferir `tipo` */
        tipoMateria?: { id: string; nome: string; sigla?: string | null };
    } | null;
    /** Preenchido quando categoria === 'ATO'. */
    ato?: PautaItemReferencia | null;
    /** Preenchido quando categoria === 'NORMA'. */
    norma?: PautaItemReferencia | null;
    /** Preenchido quando categoria === 'AVISO'. */
    aviso?: PautaItemReferencia | null;
    /** Preenchido quando categoria === 'COMISSAO' (parecer). */
    comissao?: PautaItemReferencia | null;
    fase: FasePauta | { value: FasePauta; label?: string };
    tipoPautaItem: TipoPautaItem | { value: TipoPautaItem; label?: string };
    ordem: number;
    status?: StatusPautaItem;
    resultado?: string | null;
    podeVotar?: boolean;
    votacao?: {
        id: string;
        tipoVotacao?: string;
        resultado?: string | null;
        finalizada?: boolean;
        votosSim?: number;
        votosNao?: number;
        abstencoes?: number;
    } | null;
    createdAt?: string;
    updatedAt?: string;
}

export const PAUTA_CATEGORIA_LABELS: Record<PautaItemCategoria, string> = {
    MATERIA: 'Matéria',
    ATO: 'Ato administrativo',
    NORMA: 'Norma jurídica',
    AVISO: 'Aviso',
    COMISSAO: 'Parecer de comissão',
};

/**
 * Resolve a categoria do item. Usa o campo explícito quando presente;
 * senão infere por dados disponíveis (COMUNICACAO → Aviso) e cai em MATERIA.
 */
export function resolvePautaCategoria(item: PautaItemDetalhe): PautaItemCategoria {
    if (item.categoria) return item.categoria;
    if (item.comissao) return 'COMISSAO';
    if (item.norma) return 'NORMA';
    if (item.ato) return 'ATO';
    if (item.aviso) return 'AVISO';
    if (resolvePautaTipo(item.tipoPautaItem) === 'COMUNICACAO') return 'AVISO';
    return 'MATERIA';
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

export function pautaMateriaRotulo(materia: NonNullable<PautaItemDetalhe['materia']>): string {
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

function referenciaRotulo(
    ref: PautaItemReferencia | null | undefined,
    fallback: string,
): string {
    if (!ref) return fallback;
    const base = ref.tipo?.sigla ?? ref.tipo?.nome ?? ref.titulo ?? fallback;
    const anoVal = typeof ref.ano === 'number' ? ref.ano : ref.ano?.valor;
    if (ref.numero != null && ref.numero !== '') {
        return `${base} nº ${ref.numero}/${anoVal ?? '?'}`;
    }
    return base;
}

/** Rótulo principal do item, qualquer que seja a categoria. */
export function pautaItemRotulo(item: PautaItemDetalhe): string {
    switch (resolvePautaCategoria(item)) {
        case 'ATO':
            return referenciaRotulo(item.ato, 'Ato administrativo');
        case 'NORMA':
            return referenciaRotulo(item.norma, 'Norma jurídica');
        case 'AVISO':
            return item.aviso?.titulo ?? referenciaRotulo(item.aviso, 'Aviso');
        case 'COMISSAO': {
            const com = item.comissao?.tipo?.nome ?? item.comissao?.titulo ?? 'Comissão';
            const mat = item.materia ? pautaMateriaRotulo(item.materia) : 'matéria';
            return `Parecer ${com} — ${mat}`;
        }
        case 'MATERIA':
        default:
            return item.materia ? pautaMateriaRotulo(item.materia) : 'Matéria';
    }
}

/** Texto descritivo secundário (ementa/descrição) do item. */
export function pautaItemDescricao(item: PautaItemDetalhe): string {
    switch (resolvePautaCategoria(item)) {
        case 'ATO':
            return item.ato?.descricao ?? item.ato?.titulo ?? '';
        case 'NORMA':
            return item.norma?.titulo ?? item.norma?.descricao ?? '';
        case 'AVISO':
            return item.aviso?.descricao ?? '';
        case 'COMISSAO':
            return item.materia?.ementa ?? item.comissao?.descricao ?? '';
        case 'MATERIA':
        default:
            return item.materia?.ementa ?? '';
    }
}

/** Matéria ou parecer de comissão deliberável — sessão deve estar ABERTA. */
export function podeAbrirVotacaoNoItem(
    item: PautaItemDetalhe,
    statusSessao: StatusSessao,
): boolean {
    if (statusSessao !== 'ABERTA') return false;
    const cat = resolvePautaCategoria(item);
    if (cat !== 'MATERIA' && cat !== 'COMISSAO') return false;
    const tipo = resolvePautaTipo(item.tipoPautaItem);
    if (tipo === 'LEITURA' || tipo === 'COMUNICACAO') return false;
    if (item.votacao) return false;
    if (item.resultado) return false;
    return true;
}

/** Votação aberta no item — apenas matéria ou parecer de comissão. */
export function podeFecharVotacaoNoItem(
    item: PautaItemDetalhe,
    statusSessao: StatusSessao,
): boolean {
    if (statusSessao !== 'ABERTA') return false;
    const cat = resolvePautaCategoria(item);
    if (cat !== 'MATERIA' && cat !== 'COMISSAO') return false;
    if (!item.votacao) return false;
    if (item.votacao.finalizada || item.votacao.resultado) return false;
    return true;
}

export interface JitsiTokenData {
    token: string | null;
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
    categoria?: PautaItemCategoria;
    materiaId?: string;
    atoId?: string;
    normaId?: string;
    comissaoId?: string;
    avisoTitulo?: string;
    avisoTexto?: string;
    fase?: FasePauta;
    tipoPautaItem?: TipoPautaItem;
    ordem?: number;
}
