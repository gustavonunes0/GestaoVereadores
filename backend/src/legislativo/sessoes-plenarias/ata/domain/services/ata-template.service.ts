export type AtaTemplateDados = {
    tipoSessaoNome: string;
    dataInicio: Date;
    dataAbertura: Date | null;
    dataEncerramento: Date | null;
    presidenteNome?: string | null;
    presencas: { nome: string; partido?: string | null; situacao: string }[];
    materias: { identificacao: string; ementa: string; resultado?: string | null }[];
};

function formatarData(data: Date | null): string {
    if (!data) return '—';
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * Monta o HTML inicial da ata — só o ponto de partida. O conteúdo fica editável
 * (UpdateAtaUseCase) até a aprovação; depois disso é imutável (regra da SPEC-006).
 */
export class AtaTemplateService {
    montar(dados: AtaTemplateDados): string {
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

        return `
<h1>Ata da ${dados.tipoSessaoNome}</h1>
<p><strong>Abertura:</strong> ${formatarData(dados.dataAbertura)}</p>
<p><strong>Encerramento:</strong> ${formatarData(dados.dataEncerramento)}</p>
${dados.presidenteNome ? `<p><strong>Presidente:</strong> ${dados.presidenteNome}</p>` : ''}

<h2>Lista de Presença</h2>
<ul>
${presencasHtml || '<li>Nenhum registro de presença.</li>'}
</ul>

<h2>Matérias da Pauta</h2>
<ul>
${materiasHtml || '<li>Nenhuma matéria registrada na pauta.</li>'}
</ul>
`.trim();
    }
}
