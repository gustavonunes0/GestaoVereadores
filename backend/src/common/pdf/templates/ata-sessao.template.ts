import { pageWrapper } from './page-wrapper';

export function ataSessaoTemplate(conteudoHtml: string, statusLabel: string): string {
    const corpo = `
<p><strong>Status:</strong> ${statusLabel}</p>
${conteudoHtml}`;

    return pageWrapper('Ata da Sessão', corpo);
}
