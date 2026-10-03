/** Helpers de texto do PDF de matéria — compartilhados entre use-case e testes. */

type NomeParlamentarDocumentoInput = {
    parliamentaryName?: string | null;
    user?: { firstName?: string | null; lastName?: string | null } | null;
    autorNome?: string | null;
    pessoaNome?: string | null;
};

/** Detecta sobrenome truncado (ex.: "ANDRADE DE A."). */
export function nomePareceAbreviado(nome: string): boolean {
    const tokens = nome.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return false;

    const last = tokens[tokens.length - 1];
    if (/^[A-Za-zÀ-ÿ]\.$/.test(last)) return true;

    if (tokens.length >= 2) {
        const penult = tokens[tokens.length - 2].toLowerCase();
        if (['de', 'da', 'dos', 'das', 'do'].includes(penult)) {
            const stem = last.replace(/\.$/, '');
            return stem.length <= 2;
        }
    }

    return false;
}

/** Nome completo para documentos oficiais — evita usar nome abreviado do plenário. */
export function resolveNomeParlamentarDocumento(
    input: NomeParlamentarDocumentoInput,
): string {
    const parl = input.parliamentaryName?.trim();
    // Mesma fonte exibida no cadastro da matéria (Autoria → parliamentaryName).
    if (parl && !nomePareceAbreviado(parl)) {
        return parl;
    }

    const candidates = [
        input.user
            ? `${input.user.firstName ?? ''} ${input.user.lastName ?? ''}`.trim()
            : '',
        input.autorNome?.trim(),
        input.pessoaNome?.trim(),
        parl ?? '',
    ].filter((nome): nome is string => Boolean(nome));

    if (candidates.length === 0) return '';

    const completos = candidates.filter((nome) => !nomePareceAbreviado(nome));
    const pool = completos.length > 0 ? completos : candidates;

    return pool.reduce((melhor, atual) =>
        atual.length > melhor.length ? atual : melhor,
    );
}

export function formatCargoPartidoVereador(party: {
    acronym: string;
    name: string;
}): string {
    const sigla = party.acronym.trim();
    const nome = party.name.trim();
    if (!sigla) return 'Vereador(a)';
    if (!nome || sigla.toUpperCase() === nome.toUpperCase()) {
        return `Vereador(a) do ${sigla}`;
    }
    return `Vereador(a) do ${sigla} - ${nome}`;
}

export function escHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const NOVO_PARAGRAFO =
    /^(Art\.?\s*\d|LEI\b|Cap[ií]tulo\b|T[ií]tulo\b|Se[cç][aã]o\b|Par[aá]grafo\b|§|JUSTIFICATIVA\b|OBSERVA|O Vereador\b|A C[aâ]mara\b|Pa[cç]o\b|Nestes Termos\b|Pede e Aguarda\b|Salas? das Sess)/i;

/**
 * Converte texto livre em parágrafos HTML justificados.
 * - Blocos separados por linha em branco viram `<p>`.
 * - Quebras simples no meio da frase são unidas (soft wrap).
 * - Linhas que iniciam artigo/seção abrem novo parágrafo.
 */
export function textToParagraphsHtml(
    value: string,
    className = 'par',
): string {
    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!normalized) return '';

    const blankSplit = normalized.split(/\n\s*\n+/);
    let blocks: string[];

    if (blankSplit.length > 1) {
        blocks = blankSplit.map((block) =>
            block
                .split('\n')
                .map((l) => l.trim())
                .filter(Boolean)
                .join(' '),
        );
    } else {
        const lines = normalized
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
        blocks = [];
        let current = '';
        for (const line of lines) {
            if (NOVO_PARAGRAFO.test(line) && current) {
                blocks.push(current);
                current = line;
            } else if (current) {
                current = `${current} ${line}`;
            } else {
                current = line;
            }
        }
        if (current) blocks.push(current);
    }

    return blocks
        .filter((b) => b.trim())
        .map((b) => `<p class="${className}">${escHtml(b.trim())}</p>`)
        .join('\n');
}

/**
 * Ementa curta da capa (modelo da câmara): só o objeto/resumo,
 * sem corpo de lei/artigos que vão na proposição.
 */
export function ementaResumoParaCapa(ementa: string): string {
    const normalized = ementa.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    if (!normalized) return '';

    const blankSplit = normalized.split(/\n\s*\n+/);
    if (blankSplit.length > 1) {
        return blankSplit[0]
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .join(' ');
    }

    const lines = normalized
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
    const parts: string[] = [];
    for (const line of lines) {
        if (NOVO_PARAGRAFO.test(line) && parts.length > 0) break;
        parts.push(line);
    }
    return parts.join(' ');
}

export function verboPorSigla(sigla: string | null | undefined): string {
    const s = (sigla ?? '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
    if (s.startsWith('IND') || s === 'PIL') return 'INDICAR';
    if (s.startsWith('MOC')) return 'REQUERER';
    if (s.startsWith('PAR')) return 'apresentar o seguinte parecer:';
    if (s.startsWith('PL') || s.startsWith('PDL') || s.startsWith('PR')) {
        return 'apresentar a seguinte proposição:';
    }
    return 'REQUERER';
}

export function tituloProposicao(
    tipoNome: string,
    sigla: string,
    numeroLabel: string,
): string {
    const upper = tipoNome.toUpperCase();
    const sig = sigla.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '');
    if (sig.startsWith('MOC') || /MOÇÃO/i.test(tipoNome)) {
        return `MOÇÃO Nº ${numeroLabel}`;
    }
    return `${upper} Nº ${numeroLabel}`;
}

export function buildProcessoNumero(seq: number, ano: number): string {
    const corpo = String(seq).padStart(8, '0');
    const dv = String((seq * 7 + ano) % 100).padStart(2, '0');
    return `0000000.${corpo}/${ano}-${dv}`;
}

export function buildProtocoloLabel(params: {
    ddmm: string;
    ano: number;
    numeroProtocolo: number | null;
}): string {
    const seq = String(params.numeroProtocolo ?? 0).padStart(4, '0');
    return `I - ${params.ddmm}${seq}/${params.ano}`;
}

/**
 * Checklist de conformidade com os modelos em `.cursor/modelos`
 * (REQ/MOÇ completos + capa/termo PAR/PLOE/PIL).
 */
export const MODELO_MATERIA_PDF_CHECKLIST = {
    capa: [
        'BIÊNIO',
        'PROCESSO LEGISLATIVO',
        'Nº DO PROCESSO',
        'DATA DO PROTOCOLO',
        'AUTORIA',
        'EMENTA',
        'OBSERVAÇÕES',
        'AUTUAÇÃO',
        'AUTUO o processo legislativo',
        'que adiante se vê',
    ],
    termo: [
        'TERMO DE ABERTURA',
        'Art. 31 da LOM',
        'Art. 59 da CF',
        'procedemos a abertura do Processo Legislativo',
        'juntada do(a)',
        'protocolado(a) sob o nº',
        'primeira folha a de número 01',
        'tendo por objetivo a(o)',
    ],
    proposicao: [
        'PROTOCOLO Nº',
        'EXCELENTÍSSIMO SENHOR',
        'PRESIDENTE',
        'O(A) Vereador(a) abaixo signatário',
        'forma regimental',
        'Nestes Termos',
        'Pede e Aguarda Deferimento',
        'Salas das Sessões da Câmara Municipal',
        'Autor',
    ],
} as const;
