/** Helpers de texto do PDF de matéria — compartilhados entre use-case e testes. */

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
