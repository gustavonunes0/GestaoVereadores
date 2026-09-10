import { materiaTextoOriginalTemplate } from './materia-texto-original.template';
import {
    MODELO_MATERIA_PDF_CHECKLIST,
    buildProcessoNumero,
    buildProtocoloLabel,
    tituloProposicao,
    verboPorSigla,
} from './materia-texto-original.helpers';
import type { MateriaTextoOriginalPdfInput } from './materia-texto-original.template';

/**
 * Fixture espelhando o modelo REQ Nº 107/2026 (todas as proposições).
 * Fonte: GestaoVereadores/.cursor/modelos
 */
function fixtureReq107(): MateriaTextoOriginalPdfInput {
    const ementa =
        'Que seja direcionado Ofício ao Exmo. Sr. Joerly Rodrigues Victor — Prefeito Municipal de Aratuba/CE, solicitando deste que determine a quem de direito a adoção das providências necessárias para que os pacientes, após realizarem suas consultas na Policlínica Dr. Clóvis Amora Vasconcelos, em Baturité/CE, já saiam da unidade com as datas dos retornos e dos exames solicitados devidamente agendadas.';

    return {
        tenantNome: 'Câmara Municipal de Baturité',
        municipio: 'Baturité',
        uf: 'CE',
        bienio: '2025/2026',
        numeroProcesso: '0000000.00002415/2026-13',
        dataProtocoloLabel: 'I - 08091153/2026',
        dataProtocoloExtenso: '8 de setembro de 2026',
        dataProtocoloCurta: '08/09/2026',
        horaProtocolo: '11:44:13',
        autorNome: 'SONIRA GOMES',
        autorCargoPartido: 'Vereadora do PODE - PODEMOS',
        ementa,
        justificativa:
            'A medida tem por objetivo proporcionar maior comodidade aos usuários, promover melhor organização dos serviços de saúde e, sobretudo, assegurar maior continuidade, agilidade e eficiência no atendimento à população.',
        observacoes: 'REQUERIMENTO LEGISLATIVO Nº 107/2026',
        tipoNome: 'Requerimento Legislativo',
        tipoNomeUpper: 'REQUERIMENTO LEGISLATIVO',
        sigla: 'REQ',
        numeroLabel: '107/2026',
        tituloProposicao: tituloProposicao(
            'Requerimento Legislativo',
            'REQ',
            '107/2026',
        ),
        verboAcao: verboPorSigla('REQ'),
        presidenteNome: 'JOAO PAULO FARIAS LOPES',
        secretariaNome: 'ANTONIO LEANDRO DE BARROS RAMOS',
        secretariaCargo: 'Secretária Legislativa',
    };
}

function fixtureMocao32(): MateriaTextoOriginalPdfInput {
    const ementa =
        'A Câmara Municipal de Baturité, por meio de seus representantes, manifesta profundo pesar pelo falecimento do jovem David Almeida Mendonça, ocorrido em 26 de agosto de 2026, aos 21 anos de idade, sendo posteriormente sepultado no Cemitério Público São Miguel, em nossa cidade.';

    return {
        ...fixtureReq107(),
        numeroProcesso: '0000000.00002414/2026-40',
        dataProtocoloLabel: 'I - 08091152/2026',
        autorNome: 'JAILSON DOS SANTOS PEREIRA',
        autorCargoPartido:
            'Vereador do PSD - PARTIDO SOCIAL DEMOCRÁTICO',
        ementa,
        justificativa:
            'Filho amoroso de Iranildo Mendonça e Miriam Almeida, neto de Zeneida Mendonça.',
        observacoes: 'MOÇÃO Nº 32/2026',
        tipoNome: 'Moção',
        tipoNomeUpper: 'MOÇÃO',
        sigla: 'MOÇ',
        numeroLabel: '32/2026',
        tituloProposicao: tituloProposicao('Moção', 'MOÇ', '32/2026'),
        verboAcao: verboPorSigla('MOÇ'),
    };
}

function stripHtml(html: string): string {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

function assertContainsAll(text: string, phrases: readonly string[], label: string) {
    const missing = phrases.filter((p) => !text.includes(p));
    expect({ label, missing }).toEqual({ label, missing: [] });
}

describe('materiaTextoOriginalTemplate — conformidade com .cursor/modelos', () => {
    it('REQ 107: HTML contém todas as seções da capa, termo e proposição do modelo', () => {
        const html = materiaTextoOriginalTemplate(fixtureReq107());
        const text = stripHtml(html);

        assertContainsAll(text, MODELO_MATERIA_PDF_CHECKLIST.capa, 'capa');
        assertContainsAll(text, MODELO_MATERIA_PDF_CHECKLIST.termo, 'termo');
        assertContainsAll(
            text,
            MODELO_MATERIA_PDF_CHECKLIST.proposicao,
            'proposicao',
        );

        // Dados concretos do modelo REQ 107
        expect(text).toContain('BIÊNIO 2025/2026');
        expect(text).toContain('0000000.00002415/2026-13');
        expect(text).toContain('I - 08091153/2026');
        expect(text).toContain('SONIRA GOMES');
        expect(text).toContain('ANTONIO LEANDRO DE BARROS RAMOS');
        expect(text).toContain('Secretário Legislativo'); // capa (gênero masculino no modelo)
        expect(text).toContain('Secretária Legislativa'); // termo
        expect(text).toContain('REQUERIMENTO LEGISLATIVO Nº 107/2026');
        expect(text).toContain('JOAO PAULO FARIAS LOPES');
        expect(text).toContain('JUSTIFICATIVA');
        expect(text).toContain('comodidade aos usuários');
        expect(text).toContain('Baturité/CE');
        expect(text).toContain('Estado do Ceará');
    });

    it('REQ 107: ementa aparece na capa E no corpo como objeto do REQUERER', () => {
        const dados = fixtureReq107();
        const html = materiaTextoOriginalTemplate(dados);
        const text = stripHtml(html);

        const trechoEmenta = 'Que seja direcionado Ofício ao Exmo. Sr. Joerly';
        const ocorrencias = text.split(trechoEmenta).length - 1;
        expect(ocorrencias).toBeGreaterThanOrEqual(2);

        expect(text).toMatch(/REQUERER\s+Que seja direcionado Ofício/i);
    });

    it('MOÇ 32: título e verbo seguem o modelo de moção', () => {
        const dados = fixtureMocao32();
        const html = materiaTextoOriginalTemplate(dados);
        const text = stripHtml(html);

        expect(dados.tituloProposicao).toBe('MOÇÃO Nº 32/2026');
        expect(dados.verboAcao).toBe('REQUERER');
        expect(text).toContain('MOÇÃO Nº 32/2026');
        expect(text).toContain('JAILSON DOS SANTOS PEREIRA');
        expect(text).toContain('JUSTIFICATIVA');
        assertContainsAll(text, MODELO_MATERIA_PDF_CHECKLIST.capa, 'capa-moc');
        assertContainsAll(text, MODELO_MATERIA_PDF_CHECKLIST.termo, 'termo-moc');
        assertContainsAll(
            text,
            MODELO_MATERIA_PDF_CHECKLIST.proposicao,
            'prop-moc',
        );
    });

    it('gera 3 páginas lógicas (capa, termo, proposição) como nos modelos REQ/MOÇ', () => {
        const html = materiaTextoOriginalTemplate(fixtureReq107());
        const pages = html.match(/class="page/g) ?? [];
        expect(pages.length).toBe(3);
    });

    it('helpers de protocolo/processo seguem o formato dos modelos', () => {
        expect(buildProcessoNumero(2415, 2026)).toMatch(
            /^0000000\.\d{8}\/2026-\d{2}$/,
        );
        expect(
            buildProtocoloLabel({
                ddmm: '0809',
                ano: 2026,
                numeroProtocolo: 1153,
            }),
        ).toBe('I - 08091153/2026');
        expect(verboPorSigla('REQ')).toBe('REQUERER');
        expect(verboPorSigla('IND')).toBe('INDICAR');
        expect(verboPorSigla('PIL')).toBe('INDICAR');
        expect(tituloProposicao('Requerimento Legislativo', 'REQ', '107/2026')).toBe(
            'REQUERIMENTO LEGISLATIVO Nº 107/2026',
        );
    });
});
