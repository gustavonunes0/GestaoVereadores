import { pageWrapper } from './page-wrapper';

export type ResumoSessaoTemplateDados = {
    sessaoTitulo: string;
    dataAbertura: Date | null;
    dataEncerramento: Date | null;
    mesaDiretora: { nome: string; cargo: string }[];
    presencas: { nome: string; partido?: string | null; situacao: string }[];
    materias: { identificacao: string; ementa: string; resultado?: string | null }[];
};

function formatarData(data: Date | null): string {
    if (!data) return '—';
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function resumoSessaoTemplate(dados: ResumoSessaoTemplateDados): string {
    const mesaHtml = dados.mesaDiretora
        .map((m) => `<li>${m.nome} — ${m.cargo}</li>`)
        .join('\n');

    const presencasHtml = dados.presencas
        .map((p) => `<li>${p.nome}${p.partido ? ` (${p.partido})` : ''} — ${p.situacao}</li>`)
        .join('\n');

    const materiasHtml = dados.materias
        .map(
            (m) =>
                `<li><strong>${m.identificacao}</strong> — ${m.ementa}${
                    m.resultado ? ` — <em>${m.resultado}</em>` : ''
                }</li>`,
        )
        .join('\n');

    const corpo = `
<h1>Resumo da Sessão</h1>
<p>${dados.sessaoTitulo}</p>
<p><strong>Abertura:</strong> ${formatarData(dados.dataAbertura)} · <strong>Encerramento:</strong> ${formatarData(dados.dataEncerramento)}</p>

<h2>Mesa Diretora</h2>
<ul>${mesaHtml || '<li>Não informada.</li>'}</ul>

<h2>Lista de Presença</h2>
<ul>${presencasHtml || '<li>Nenhum registro de presença.</li>'}</ul>

<h2>Matérias da Pauta</h2>
<ul>${materiasHtml || '<li>Nenhuma matéria registrada.</li>'}</ul>`;

    return pageWrapper('Resumo da Sessão', corpo);
}
