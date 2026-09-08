export type AtaTemplatePresenca = {
    nome: string;
    partido?: string | null;
    situacao: string;
};

export type AtaTemplateMesa = {
    nome: string;
    cargo: string;
};

export type AtaTemplateVoto = {
    nome: string;
    voto: string;
};

export type AtaTemplatePautaItem = {
    ordem: number;
    fase: string;
    categoria: string;
    identificacao: string;
    ementa: string;
    tipoPautaItem?: string | null;
    resultadoPauta?: string | null;
    votacao?: {
        tipoVotacao: string;
        votosSim: number;
        votosNao: number;
        abstencoes: number;
        resultado?: string | null;
        votoQualidade?: boolean;
        votos?: AtaTemplateVoto[];
    } | null;
};

export type AtaTemplatePalavra = {
    nome: string;
    tema?: string | null;
    status: string;
    duracaoSegundos?: number | null;
};

export type AtaTemplateDados = {
    tenant: {
        nome: string;
        nomeFantasia?: string | null;
        cidade?: string | null;
        uf?: string | null;
        cnpj?: string | null;
    };
    tipoSessaoNome: string;
    dataInicio: Date;
    dataAbertura: Date | null;
    dataEncerramento: Date | null;
    observacoes?: string | null;
    legislaturaNumero?: number | null;
    sessaoLegislativaNumero?: number | null;
    quorumMinimo?: number | null;
    quorumPresente?: number | null;
    local?: string | null;
    mesaDiretora: AtaTemplateMesa[];
    presencas: AtaTemplatePresenca[];
    pautaItens: AtaTemplatePautaItem[];
    pedidosPalavra: AtaTemplatePalavra[];
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatarDataCurta(data: Date | null | undefined): string {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatarHora(data: Date | null | undefined): string {
    if (!data) return '—';
    return new Date(data).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatarDataExtenso(data: Date | null | undefined): string {
    if (!data) return 'data não informada';
    return new Date(data).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function labelSituacao(situacao: string): string {
    const map: Record<string, string> = {
        PRESENTE: 'Presente',
        AUSENTE: 'Ausente',
        JUSTIFICADO: 'Justificado',
    };
    return map[situacao] ?? situacao;
}

function labelResultado(valor?: string | null): string {
    if (!valor) return 'Sem deliberação registrada';
    const map: Record<string, string> = {
        APROVADO: 'Aprovado',
        REJEITADO: 'Rejeitado',
        RETIRADO: 'Retirado',
        ADIADO: 'Adiado',
        EMPATADO: 'Empatado',
    };
    return map[valor] ?? valor;
}

function labelVoto(voto: string): string {
    const map: Record<string, string> = {
        SIM: 'Sim',
        NAO: 'Não',
        ABSTENCAO: 'Abstenção',
        PRESENTE: 'Presente',
    };
    return map[voto] ?? voto;
}

function labelFase(fase: string): string {
    const map: Record<string, string> = {
        EXPEDIENTE: 'Expediente',
        ORDEM_DO_DIA: 'Ordem do Dia',
        EXPLICACOES_PESSOAIS: 'Explicações Pessoais',
    };
    return map[fase] ?? fase;
}

function labelPedidoPalavra(status: string): string {
    const map: Record<string, string> = {
        AGUARDANDO: 'Aguardando',
        CONCEDIDO: 'Concedido',
        NEGADO: 'Negado',
        ENCERRADO: 'Encerrado',
    };
    return map[status] ?? status;
}

function labelTipoVotacao(tipo: string): string {
    const map: Record<string, string> = {
        NOMINAL: 'nominal',
        SIMBOLICA: 'simbólica',
        SECRETA: 'secreta',
    };
    return map[tipo] ?? tipo.toLowerCase();
}

function formatarDuracao(segundos?: number | null): string {
    if (segundos == null || Number.isNaN(segundos)) return '';
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    if (min <= 0) return `${sec}s`;
    return `${min}min ${sec.toString().padStart(2, '0')}s`;
}

function listarNomes(itens: { nome: string; partido?: string | null }[]): string {
    if (itens.length === 0) return 'nenhum registro';
    return itens
        .map((p) => {
            const nome = escapeHtml(p.nome);
            return p.partido ? `${nome} (${escapeHtml(p.partido)})` : nome;
        })
        .join('; ');
}

/**
 * Monta o HTML inicial da ata no padrão formal de câmaras municipais
 * (cabeçalho do tenant, abertura, mesa, presença/quórum, expediente,
 * ordem do dia com deliberações/votações, tribuna e encerramento).
 * O conteúdo permanece editável até a aprovação (SPEC-006).
 */
export class AtaTemplateService {
    montar(dados: AtaTemplateDados): string {
        const cidadeUf = [dados.tenant.cidade, dados.tenant.uf].filter(Boolean).join('/');
        const orgao =
            dados.tenant.nomeFantasia?.trim() ||
            dados.tenant.nome ||
            'Câmara Municipal';
        const local =
            dados.local?.trim() ||
            (cidadeUf
                ? `Plenário da ${orgao}, município de ${cidadeUf}`
                : `Plenário da ${orgao}`);

        const dataRef = dados.dataAbertura ?? dados.dataInicio;
        const presentes = dados.presencas.filter((p) => p.situacao === 'PRESENTE');
        const ausentes = dados.presencas.filter((p) => p.situacao === 'AUSENTE');
        const justificados = dados.presencas.filter((p) => p.situacao === 'JUSTIFICADO');

        const quorumPresente = dados.quorumPresente ?? presentes.length;
        const quorumMinimo = dados.quorumMinimo;
        const quorumTxt =
            quorumMinimo != null
                ? `Verificado o quórum de ${quorumPresente} vereador(es) presente(s), sendo o mínimo exigido de ${quorumMinimo}.`
                : `Verificado o quórum de ${quorumPresente} vereador(es) presente(s).`;

        const presidente =
            dados.mesaDiretora.find((m) => /presid/i.test(m.cargo)) ??
            dados.mesaDiretora[0] ??
            null;
        const primeiroSecretario =
            dados.mesaDiretora.find((m) => /1[ºo.]?\s*secret/i.test(m.cargo)) ??
            dados.mesaDiretora.find((m) => /secret/i.test(m.cargo)) ??
            null;

        const mesaLinhas =
            dados.mesaDiretora.length > 0
                ? dados.mesaDiretora
                      .map(
                          (m) =>
                              `<li><strong>${escapeHtml(m.cargo)}:</strong> ${escapeHtml(m.nome)}</li>`,
                      )
                      .join('\n')
                : '<li>Composição da Mesa Diretora não informada no sistema.</li>';

        const expediente = dados.pautaItens.filter((i) => i.fase === 'EXPEDIENTE');
        const ordemDia = dados.pautaItens.filter((i) => i.fase !== 'EXPEDIENTE');

        const renderPauta = (itens: AtaTemplatePautaItem[]) => {
            if (itens.length === 0) {
                return '<p><em>Nenhum item registrado nesta fase.</em></p>';
            }
            return itens
                .map((item) => {
                    const votosHtml =
                        item.votacao?.tipoVotacao === 'NOMINAL' &&
                        item.votacao.votos &&
                        item.votacao.votos.length > 0
                            ? `<ul class="ata-votos">${item.votacao.votos
                                  .map(
                                      (v) =>
                                          `<li>${escapeHtml(v.nome)} — ${escapeHtml(labelVoto(v.voto))}</li>`,
                                  )
                                  .join('')}</ul>`
                            : '';

                    const votacaoBloco = item.votacao
                        ? `<p>Submetida à votação <strong>${escapeHtml(
                              labelTipoVotacao(item.votacao.tipoVotacao),
                          )}</strong>, obteve ${item.votacao.votosSim} voto(s) favorável(is), ${
                              item.votacao.votosNao
                          } contrário(s) e ${item.votacao.abstencoes} abstenção(ões)${
                              item.votacao.votoQualidade
                                  ? ', com voto de qualidade da Presidência'
                                  : ''
                          }. <strong>Resultado da votação:</strong> ${escapeHtml(
                              labelResultado(item.votacao.resultado),
                          )}.</p>${votosHtml}`
                        : '';

                    return `
<article class="ata-item">
<p><strong>Item ${item.ordem}</strong> (${escapeHtml(labelFase(item.fase))} / ${escapeHtml(
                        item.categoria,
                    )}) — <strong>${escapeHtml(item.identificacao)}</strong></p>
<p>${escapeHtml(item.ementa || 'Sem ementa/descrição.')}</p>
${votacaoBloco}
<p><strong>Resultado na pauta:</strong> ${escapeHtml(labelResultado(item.resultadoPauta))}.</p>
</article>`;
                })
                .join('\n');
        };

        const palavrasHtml =
            dados.pedidosPalavra.length > 0
                ? `<ol>${dados.pedidosPalavra
                      .map((p) => {
                          const tema = p.tema ? ` — tema: ${escapeHtml(p.tema)}` : '';
                          const dur = formatarDuracao(p.duracaoSegundos);
                          const durTxt = dur ? ` (${dur})` : '';
                          return `<li>${escapeHtml(p.nome)}${tema} — ${escapeHtml(
                              labelPedidoPalavra(p.status),
                          )}${durTxt}</li>`;
                      })
                      .join('\n')}</ol>`
                : '<p><em>Não houve registro de uso da tribuna / pedidos de palavra nesta sessão.</em></p>';

        const legislaturaTxt =
            dados.legislaturaNumero != null
                ? `${dados.legislaturaNumero}ª Legislatura`
                : 'Legislatura não informada';
        const sessaoLegTxt =
            dados.sessaoLegislativaNumero != null
                ? `${dados.sessaoLegislativaNumero}ª Sessão Legislativa`
                : 'Sessão Legislativa não informada';

        return `
<header class="ata-cabecalho">
<p class="ata-orgao"><strong>${escapeHtml(orgao.toUpperCase())}</strong></p>
${cidadeUf ? `<p class="ata-localidade">${escapeHtml(cidadeUf)}</p>` : ''}
${dados.tenant.cnpj ? `<p class="ata-meta">CNPJ: ${escapeHtml(dados.tenant.cnpj)}</p>` : ''}
<p class="ata-meta">${escapeHtml(legislaturaTxt)} · ${escapeHtml(sessaoLegTxt)}</p>
</header>

<h1 class="ata-titulo">ATA DA ${escapeHtml(dados.tipoSessaoNome.toUpperCase())}</h1>
<p class="ata-subtitulo">Realizada em ${escapeHtml(formatarDataCurta(dataRef))} · Abertura às ${escapeHtml(
            formatarHora(dados.dataAbertura),
        )} · Encerramento às ${escapeHtml(formatarHora(dados.dataEncerramento))}</p>

<section class="ata-secao">
<h2>I — Abertura</h2>
<p>Aos ${escapeHtml(formatarDataExtenso(dataRef))}, às ${escapeHtml(
            formatarHora(dados.dataAbertura ?? dataRef),
        )}, no ${escapeHtml(local)}, reuniram-se os Senhores Vereadores para a realização da <strong>${escapeHtml(
            dados.tipoSessaoNome,
        )}</strong>, sob a ${
            presidente
                ? `presidência de <strong>${escapeHtml(presidente.nome)}</strong>`
                : 'presidência dos trabalhos'
        }${
            primeiroSecretario
                ? `, secretariada por <strong>${escapeHtml(primeiroSecretario.nome)}</strong>`
                : ''
        }. Havendo número legal, foram declarados abertos os trabalhos.</p>
</section>

<section class="ata-secao">
<h2>II — Composição da Mesa Diretora</h2>
<ul>
${mesaLinhas}
</ul>
</section>

<section class="ata-secao">
<h2>III — Verificação de presença e quórum</h2>
<p>${escapeHtml(quorumTxt)}</p>
<p><strong>Presentes (${presentes.length}):</strong> ${listarNomes(presentes)}.</p>
<p><strong>Ausentes (${ausentes.length}):</strong> ${listarNomes(ausentes)}.</p>
<p><strong>Justificados (${justificados.length}):</strong> ${listarNomes(justificados)}.</p>
<table class="ata-tabela-presenca">
<thead>
<tr><th>Parlamentar</th><th>Partido</th><th>Situação</th></tr>
</thead>
<tbody>
${
    dados.presencas.length > 0
        ? dados.presencas
              .map(
                  (p) =>
                      `<tr><td>${escapeHtml(p.nome)}</td><td>${escapeHtml(
                          p.partido ?? '—',
                      )}</td><td>${escapeHtml(labelSituacao(p.situacao))}</td></tr>`,
              )
              .join('\n')
        : '<tr><td colspan="3">Nenhum registro de presença.</td></tr>'
}
</tbody>
</table>
</section>

<section class="ata-secao">
<h2>IV — Expediente</h2>
${renderPauta(expediente)}
</section>

<section class="ata-secao">
<h2>V — Ordem do Dia</h2>
<p>Passou-se à Ordem do Dia, com a apreciação das proposições constantes da pauta da sessão.</p>
${renderPauta(ordemDia)}
</section>

<section class="ata-secao">
<h2>VI — Uso da tribuna / pedidos de palavra</h2>
${palavrasHtml}
</section>

<section class="ata-secao">
<h2>VII — Encerramento</h2>
<p>Nada mais havendo a tratar, o${
            presidente ? ` Presidente <strong>${escapeHtml(presidente.nome)}</strong>` : ' Presidente'
        } declarou encerrada a presente sessão às ${escapeHtml(
            formatarHora(dados.dataEncerramento),
        )} do dia ${escapeHtml(formatarDataCurta(dados.dataEncerramento ?? dataRef))}, lavrando-se a presente ata que, após lida e aprovada, será assinada pela Mesa.</p>
${
    dados.observacoes?.trim()
        ? `<p><strong>Observações da sessão:</strong> ${escapeHtml(dados.observacoes.trim())}</p>`
        : ''
}
</section>

<section class="ata-assinaturas">
<div class="ata-assinatura">
<p class="ata-assinatura-nome">${escapeHtml(
            (presidente?.nome ?? '________________________________').toUpperCase(),
        )}</p>
<p class="ata-assinatura-cargo"><strong>Presidente</strong></p>
</div>
<div class="ata-assinatura">
<p class="ata-assinatura-nome">${escapeHtml(
            (primeiroSecretario?.nome ?? '________________________________').toUpperCase(),
        )}</p>
<p class="ata-assinatura-cargo"><strong>1º Secretário</strong></p>
</div>
</section>
`.trim();
    }
}
