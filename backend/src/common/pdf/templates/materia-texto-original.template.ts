import { pageWrapper } from './page-wrapper';

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

function esc(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function nl2br(value: string): string {
    return esc(value).replace(/\r\n|\n|\r/g, '<br/>');
}

/**
 * PDF de texto original da matéria — espelha os modelos da câmara em `.cursor/modelos`
 * (capa de processo + termo de abertura + proposição).
 * A ementa é sempre o objeto/solicitação requerida no corpo.
 */
export function materiaTextoOriginalTemplate(
    dados: MateriaTextoOriginalPdfInput,
): string {
    const municipioUf = `${dados.municipio}/${dados.uf}`;
    const camaraCurta = dados.tenantNome.replace(/^Câmara Municipal de\s+/i, 'CÂMARA DE ').toUpperCase();
    const camaraFull = dados.tenantNome.toUpperCase();

    const justificativaHtml = dados.justificativa?.trim()
        ? `<h3 class="sec">JUSTIFICATIVA</h3>
<p class="corpo">${nl2br(dados.justificativa.trim())}</p>`
        : '';

    const corpo = `
<style>
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .capa { text-align: center; }
  .capa .bienio { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 18px; }
  .capa .titulo { font-size: 16px; font-weight: 700; letter-spacing: 0.12em; margin: 0 0 22px; }
  .campo { margin: 14px 0; text-align: left; }
  .campo .rotulo { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; color: #444; }
  .campo .valor { font-size: 13px; margin-top: 2px; }
  .ementa { text-align: justify; }
  .autuacao { text-align: justify; margin-top: 28px; }
  .assinatura { margin-top: 36px; text-align: center; }
  .assinatura .nome { font-weight: 700; margin-top: 28px; }
  .assinatura .cargo { font-size: 11px; }
  .termo h1 { text-align: center; font-size: 15px; letter-spacing: 0.08em; margin-bottom: 18px; }
  .termo p { text-align: justify; margin: 10px 0; }
  .prop-cab { text-align: center; margin-bottom: 18px; }
  .prop-cab .orgao { font-size: 14px; font-weight: 700; letter-spacing: 0.06em; }
  .prop-cab .meta { font-size: 11px; margin: 4px 0; }
  .prop-titulo { text-align: center; font-size: 14px; font-weight: 700; margin: 18px 0 14px; letter-spacing: 0.04em; }
  .destinatario { text-align: center; font-weight: 700; margin: 16px 0; text-transform: uppercase; font-size: 12px; }
  .corpo { text-align: justify; margin: 10px 0; }
  .sec { font-size: 12px; margin: 18px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  .fecho { margin-top: 22px; }
  .local-data { margin-top: 18px; text-align: justify; }
</style>

<div class="page capa">
  <div class="bienio">BIÊNIO ${esc(dados.bienio)}</div>
  <div class="titulo">PROCESSO LEGISLATIVO</div>

  <div class="campo">
    <div class="rotulo">Nº DO PROCESSO</div>
    <div class="valor">${esc(dados.numeroProcesso)}</div>
  </div>
  <div class="campo">
    <div class="rotulo">DATA DO PROTOCOLO</div>
    <div class="valor">${esc(dados.dataProtocoloLabel)}</div>
  </div>
  <div class="campo">
    <div class="rotulo">AUTORIA</div>
    <div class="valor">${esc(dados.autorNome)}</div>
    <div class="valor" style="font-size:11px;color:#555">Autor</div>
  </div>
  <div class="campo">
    <div class="rotulo">EMENTA</div>
    <div class="valor ementa">${nl2br(dados.ementa)}</div>
  </div>
  <div class="campo">
    <div class="rotulo">OBSERVAÇÕES</div>
    <div class="valor">${esc(dados.observacoes)}</div>
  </div>

  <div class="autuacao">
    <div class="rotulo">AUTUAÇÃO</div>
    <p>Hoje, nesta cidade, AUTUO o processo legislativo nº ${esc(dados.numeroProcesso)},
    que adiante se vê, do que para constar lavrei este termo.</p>
    <p style="margin-top:16px">${esc(municipioUf)}, ${esc(dados.dataProtocoloExtenso)}.</p>
  </div>
  <div class="assinatura">
    <div class="nome">${esc(dados.secretariaNome)}</div>
    <div class="cargo">${esc(dados.secretariaCargo.replace(/a$/i, 'o').replace(/ária/i, 'ário'))}</div>
  </div>
</div>

<div class="page termo">
  <h1>TERMO DE ABERTURA</h1>
  <p>Em cumprimento ao Art. 31 da LOM, combinado com o Art. 59 da CF, aos
  ${esc(dados.dataProtocoloExtenso)}, procedemos a abertura do Processo Legislativo
  nº ${esc(dados.numeroProcesso)}.</p>
  <p>O presente processo é aberto com a juntada do(a) ${esc(dados.tipoNome)} ${esc(dados.numeroLabel)},
  protocolado(a) sob o nº ${esc(dados.dataProtocoloLabel)} datado do dia
  ${esc(dados.dataProtocoloExtenso)}.</p>
  <p>Com este fim e para constar, eu, ${esc(dados.secretariaNome)},
  lavrei o presente termo que vai por mim assinado e que tem
  como primeira folha a de número 01, que corresponde a este termo,
  tendo por objetivo a(o) ${esc(dados.tipoNome)} ${esc(dados.numeroLabel)}.</p>
  <div class="assinatura">
    <div class="nome">${esc(dados.secretariaNome)}</div>
    <div class="cargo">${esc(dados.secretariaCargo)}</div>
  </div>
</div>

<div class="page">
  <div class="prop-cab">
    <div class="orgao">${esc(camaraCurta)}</div>
    <div class="meta">PROTOCOLO Nº ${esc(dados.dataProtocoloLabel)} — ${esc(dados.sigla)} Nº ${esc(dados.numeroLabel)}</div>
    <div class="meta">Data: ${esc(dados.dataProtocoloCurta)} — Hora: ${esc(dados.horaProtocolo)}</div>
  </div>

  <div class="prop-titulo">${esc(dados.tituloProposicao)}</div>

  <div class="destinatario">
    EXCELENTÍSSIMO SENHOR, ${esc(dados.presidenteNome)}, PRESIDENTE
    DA ${esc(camaraFull)}
  </div>

  <p class="corpo">
    O(A) Vereador(a) abaixo signatário, no uso de suas atribuições legais e na
    forma regimental, vem respeitosamente, à presença de Vossa Excelência,
    após ouvido o Plenário desta Casa, ${esc(dados.verboAcao)}
    ${nl2br(dados.ementa)}
  </p>

  ${justificativaHtml}

  <div class="fecho">
    <p>Nestes Termos.</p>
    <p>Pede e Aguarda Deferimento.</p>
  </div>

  <p class="local-data">
    Salas das Sessões da Câmara Municipal de ${esc(dados.municipio)}, Estado do ${esc(dados.uf === 'CE' ? 'Ceará' : dados.uf)},
    aos ${esc(dados.dataProtocoloExtenso)}.
  </p>

  <div class="assinatura">
    <div class="nome">${esc(dados.autorNome)}</div>
    <div class="cargo">${esc(dados.autorCargoPartido ?? 'Autor')}</div>
    <div class="cargo">Autor</div>
  </div>
</div>
`;

    return pageWrapper(`Texto original — ${dados.tituloProposicao}`, corpo);
}
