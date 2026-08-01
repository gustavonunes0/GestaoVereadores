import { pageWrapper } from './page-wrapper';

export type ListaPresencaTemplateDados = {
    sessaoTitulo: string;
    dataInicio: Date;
    presencas: { nome: string; partido?: string | null; situacao: string }[];
};

export function listaPresencaTemplate(dados: ListaPresencaTemplateDados): string {
    const linhas = dados.presencas
        .map(
            (p) => `<tr><td>${p.nome}</td><td>${p.partido ?? '—'}</td><td>${p.situacao}</td></tr>`,
        )
        .join('\n');

    const corpo = `
<h1>Lista de Presença</h1>
<p>${dados.sessaoTitulo}</p>
<p>${new Date(dados.dataInicio).toLocaleDateString('pt-BR')}</p>
<table>
  <thead><tr><th>Parlamentar</th><th>Partido</th><th>Situação</th></tr></thead>
  <tbody>
    ${linhas || '<tr><td colspan="3">Nenhum registro de presença.</td></tr>'}
  </tbody>
</table>`;

    return pageWrapper('Lista de Presença', corpo);
}
