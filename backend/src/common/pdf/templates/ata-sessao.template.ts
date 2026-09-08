import { pageWrapper } from './page-wrapper';

/** Estilos específicos da ata formal (complementam o pageWrapper). */
const ATA_STYLES = `
<style>
  .ata-cabecalho { text-align: center; margin-bottom: 16px; }
  .ata-orgao { font-size: 16px; margin: 0 0 4px; letter-spacing: 0.02em; }
  .ata-localidade, .ata-meta { margin: 0; color: #444; font-size: 11px; }
  .ata-titulo { text-align: center; font-size: 15px; margin: 18px 0 6px; text-transform: uppercase; }
  .ata-subtitulo { text-align: center; margin: 0 0 18px; color: #444; font-size: 11px; }
  .ata-secao { margin-top: 16px; }
  .ata-secao h2 { font-size: 13px; margin: 0 0 8px; border-bottom: 1px solid #bbb; padding-bottom: 3px; }
  .ata-secao p { text-align: justify; margin: 6px 0; }
  .ata-item { margin: 10px 0 14px; padding-left: 4px; border-left: 3px solid #e5e5e5; }
  .ata-votos { margin: 4px 0 8px 16px; }
  .ata-tabela-presenca { margin-top: 10px; }
  .ata-assinaturas {
    display: flex; justify-content: space-between; gap: 24px;
    margin-top: 48px; page-break-inside: avoid;
  }
  .ata-assinatura { flex: 1; text-align: center; }
  .ata-assinatura-nome { margin: 36px 0 2px; font-size: 11px; }
  .ata-assinatura-cargo { margin: 0; font-size: 11px; }
</style>
`;

export function ataSessaoTemplate(conteudoHtml: string, statusLabel: string): string {
    const corpo = `
${ATA_STYLES}
<p><strong>Status do documento:</strong> ${statusLabel}</p>
${conteudoHtml}`;

    return pageWrapper('Ata da Sessão', corpo);
}
