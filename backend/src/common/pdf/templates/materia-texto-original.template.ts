import { pageWrapper } from './page-wrapper';
import {
    ementaResumoParaCapa,
    escHtml,
    textToParagraphsHtml,
} from './materia-texto-original.helpers';
import {
    buildMateriaPdfCabecalhoHtml,
    buildMateriaPdfChromeStyles,
    buildMateriaPdfRodapeHtml,
    type MateriaPdfBranding,
} from './materia-texto-original.branding';

export type MateriaTextoOriginalPdfInput = {
    tenantNome: string;
    municipio: string;
    uf: string;
    bienio: string;
    numeroProcesso: string;
    dataProtocoloLabel: string;
    dataProtocoloExtenso: string;
    dataProtocoloCurta: string;
    horaProtocolo: string;
    autorNome: string;
    autorCargoPartido: string | null;
    ementa: string;
    justificativa: string | null;
    observacoes: string;
    tipoNome: string;
    tipoNomeUpper: string;
    sigla: string;
    numeroLabel: string;
    tituloProposicao: string;
    verboAcao: string;
    presidenteNome: string;
    secretariaNome: string;
    secretariaCargo: string;
};

/**
 * PDF de texto original da matéria — espelha os modelos da câmara em `.cursor/modelos`
 * (capa de processo + termo de abertura + proposição).
 * Cabeçalho/rodapé colados às bordas (barra no topo e ornamentos na base).
 */
export function materiaTextoOriginalTemplate(
    dados: MateriaTextoOriginalPdfInput,
    branding?: MateriaPdfBranding | null,
): string {
    const municipioUf = `${dados.municipio}/${dados.uf}`;
    const camaraCurta = `CÂMARA DE ${dados.municipio}`.toUpperCase();
    const camaraFull = `CÂMARA MUNICIPAL DE ${dados.municipio}`.toUpperCase();

    const ementaCapa = textToParagraphsHtml(
        ementaResumoParaCapa(dados.ementa),
        'par',
    );
    const ementaCorpo = textToParagraphsHtml(dados.ementa, 'par');
    const justificativaHtml = dados.justificativa?.trim()
        ? `<h3 class="sec">JUSTIFICATIVA</h3>
${textToParagraphsHtml(dados.justificativa.trim(), 'par')}`
        : '';

    const chromeStyles = branding ? buildMateriaPdfChromeStyles() : '';
    const cabecalho = branding ? buildMateriaPdfCabecalhoHtml(branding) : '';
    const rodape = branding ? buildMateriaPdfRodapeHtml(branding) : '';

    const wrapPage = (inner: string, extraClass = '') => `
<div class="page ${extraClass}">
  ${cabecalho}
  <div class="page-body">${inner}</div>
  ${rodape}
</div>`;

    const capaInner = `
  <div class="capa-titulo">
    <div class="bienio">BIÊNIO ${escHtml(dados.bienio)}</div>
    <div class="titulo">PROCESSO LEGISLATIVO</div>
  </div>

  <div class="grid-2">
    <div class="campo">
      <div class="rotulo">Nº DO PROCESSO</div>
      <div class="box"><div class="valor">${escHtml(dados.numeroProcesso)}</div></div>
    </div>
    <div class="campo">
      <div class="rotulo">DATA DO PROTOCOLO</div>
      <div class="box"><div class="valor">${escHtml(dados.dataProtocoloLabel)}</div></div>
    </div>
  </div>

  <div class="campo">
    <div class="rotulo">AUTORIA</div>
    <div class="box">
      <div class="valor">${escHtml(dados.autorNome)}</div>
      <div class="valor sub">Autor</div>
    </div>
  </div>

  <div class="campo ementa">
    <div class="rotulo">EMENTA</div>
    <div class="box">${ementaCapa}</div>
  </div>

  <div class="campo">
    <div class="rotulo">OBSERVAÇÕES</div>
    <div class="box"><div class="valor">${escHtml(dados.observacoes)}</div></div>
  </div>

  <div class="autuacao">
    <div class="rotulo">AUTUAÇÃO</div>
    <p class="par">Hoje, nesta cidade, AUTUO o processo legislativo nº ${escHtml(dados.numeroProcesso)},
    que adiante se vê, do que para constar lavrei este termo.</p>
    <p class="local-centro">${escHtml(municipioUf)}, ${escHtml(dados.dataProtocoloExtenso)}.</p>
  </div>
  <div class="assinatura">
    <div class="nome">${escHtml(dados.secretariaNome)}</div>
    <div class="cargo">${escHtml(dados.secretariaCargo.replace(/a$/i, 'o').replace(/ária/i, 'ário'))}</div>
  </div>`;

    const termoInner = `
  <h1>TERMO DE ABERTURA</h1>
  <p class="par">Em cumprimento ao Art. 31 da LOM, combinado com o Art. 59 da CF, aos
  ${escHtml(dados.dataProtocoloExtenso)}, procedemos a abertura do Processo Legislativo
  nº ${escHtml(dados.numeroProcesso)}.</p>
  <p class="par">O presente processo é aberto com a juntada do(a) ${escHtml(dados.tipoNome)} ${escHtml(dados.numeroLabel)},
  protocolado(a) sob o nº ${escHtml(dados.dataProtocoloLabel)} datado do dia
  ${escHtml(dados.dataProtocoloExtenso)}.</p>
  <p class="par">Com este fim e para constar, eu, ${escHtml(dados.secretariaNome)},
  lavrei o presente termo que vai por mim assinado e que tem
  como primeira folha a de número 01, que corresponde a este termo,
  tendo por objetivo a(o) ${escHtml(dados.tipoNome)} ${escHtml(dados.numeroLabel)}.</p>
  <div class="assinatura">
    <div class="nome">${escHtml(dados.secretariaNome)}</div>
    <div class="cargo">${escHtml(dados.secretariaCargo)}</div>
  </div>`;

    const propInner = `
  <div class="prop-cab">
    <div class="orgao">${escHtml(camaraCurta)}</div>
    <div class="meta">PROTOCOLO Nº ${escHtml(dados.dataProtocoloLabel)} — ${escHtml(dados.sigla)} Nº ${escHtml(dados.numeroLabel)}</div>
    <div class="meta">Data: ${escHtml(dados.dataProtocoloCurta)} — Hora: ${escHtml(dados.horaProtocolo)}</div>
  </div>

  <div class="prop-titulo">${escHtml(dados.tituloProposicao)}</div>

  <div class="destinatario">
    EXCELENTÍSSIMO SENHOR, ${escHtml(dados.presidenteNome)}, PRESIDENTE
    DA ${escHtml(camaraFull)}
  </div>

  <p class="par">
    O(A) Vereador(a) abaixo signatário, no uso de suas atribuições legais e na
    forma regimental, vem respeitosamente, à presença de Vossa Excelência,
    após ouvido o Plenário desta Casa, ${escHtml(dados.verboAcao)}
  </p>
  ${ementaCorpo}

  ${justificativaHtml}

  <div class="fecho">
    <p class="par">Nestes Termos.</p>
    <p class="par">Pede e Aguarda Deferimento.</p>
  </div>

  <p class="local-data">
    Salas das Sessões da Câmara Municipal de ${escHtml(dados.municipio)}, Estado do ${escHtml(dados.uf === 'CE' ? 'Ceará' : dados.uf)},
    aos ${escHtml(dados.dataProtocoloExtenso)}.
  </p>

  <div class="assinatura">
    <div class="nome">${escHtml(dados.autorNome)}</div>
    <div class="cargo">${escHtml(dados.autorCargoPartido ?? 'Autor')}</div>
    <div class="cargo">Autor</div>
  </div>`;

    const corpo = `
<style>
${chromeStyles}
  html, body { margin: 0; padding: 0; }
  .page {
    box-sizing: border-box;
    min-height: 297mm;
    display: flex;
    flex-direction: column;
    page-break-after: always;
    break-after: page;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .page-body {
    flex: 1 1 auto;
    padding: 10px 22mm 12px;
  }

  .capa-titulo { text-align: center; margin: 2px 0 12px; }
  .capa-titulo .bienio {
    font-size: 13px; font-weight: 700; letter-spacing: 0.08em; margin: 0 0 6px;
  }
  .capa-titulo .titulo {
    font-size: 15px; font-weight: 700; letter-spacing: 0.1em; margin: 0;
  }

  .grid-2 { display: flex; gap: 12px; margin: 6px 0; }
  .grid-2 > .campo { flex: 1; }

  .campo { margin: 8px 0; }
  .campo .rotulo {
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin: 0 0 4px;
    text-transform: uppercase;
  }
  .campo .box {
    border: 1px solid #222;
    padding: 8px 10px;
    min-height: 28px;
  }
  .campo .valor {
    text-align: center;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
  }
  .campo .valor.sub {
    font-size: 10px;
    color: #444;
    margin-top: 2px;
  }
  .campo.ementa .box .par {
    text-align: justify;
    text-indent: 0;
    font-size: 11.5px;
    margin: 2px 0;
  }

  .autuacao { margin-top: 16px; }
  .autuacao .rotulo {
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }
  .autuacao .par,
  .termo .par,
  .par {
    text-align: justify;
    margin: 8px 0;
    line-height: 1.45;
    font-size: 12px;
  }
  .local-centro {
    text-align: center;
    margin-top: 14px;
    font-size: 12px;
  }

  .assinatura { margin-top: 28px; text-align: center; page-break-inside: avoid; }
  .assinatura .nome { font-weight: 700; margin-top: 22px; font-size: 12px; text-transform: uppercase; }
  .assinatura .cargo { font-size: 11px; margin-top: 2px; }

  .termo h1 {
    text-align: center;
    font-size: 15px;
    letter-spacing: 0.08em;
    margin: 8px 0 16px;
  }

  .prop-cab { text-align: center; margin-bottom: 14px; }
  .prop-cab .orgao {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    margin-bottom: 6px;
  }
  .prop-cab .meta { font-size: 11px; margin: 3px 0; }

  .prop-titulo {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    margin: 16px 0 12px;
    letter-spacing: 0.03em;
  }

  .destinatario {
    text-align: left;
    font-weight: 700;
    margin: 18px 0 14px;
    text-transform: uppercase;
    font-size: 15px;
    line-height: 1.45;
    letter-spacing: 0.01em;
  }

  .sec {
    font-size: 12px;
    margin: 16px 0 8px;
    text-align: center;
    letter-spacing: 0.06em;
    border: none;
    padding: 0;
  }

  .fecho { margin-top: 18px; }
  .fecho .par { text-align: justify; margin: 4px 0; }

  .local-data {
    margin-top: 14px;
    text-align: justify;
    font-size: 12px;
  }
</style>

${wrapPage(capaInner, 'capa')}
${wrapPage(termoInner, 'termo')}
${wrapPage(propInner)}
`;

    return pageWrapper(`Texto original — ${dados.tituloProposicao}`, corpo, {
        omitDefaultFooter: true,
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
    });
}
