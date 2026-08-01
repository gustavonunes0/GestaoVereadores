/** Layout HTML compartilhado por todos os templates de PDF do projeto. */
export function pageWrapper(titulo: string, corpo: string): string {
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${titulo}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 18px; margin-bottom: 4px; }
  h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  p { margin: 2px 0; }
  ul { margin: 4px 0; padding-left: 18px; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
  th { background: #f2f2f2; }
  .footer { margin-top: 24px; font-size: 9px; color: #888; }
</style>
</head>
<body>
${corpo}
<p class="footer">Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}.</p>
</body>
</html>`;
}
