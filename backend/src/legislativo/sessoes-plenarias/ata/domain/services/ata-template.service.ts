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

const UNIDADES = [
    'zero',
    'um',
    'dois',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
];
const DEZENAS = [
    '',
    '',
    'vinte',
    'trinta',
    'quarenta',
    'cinquenta',
    'sessenta',
    'setenta',
    'oitenta',
    'noventa',
];
const CENTENAS = [
    '',
    'cento',
    'duzentos',
    'trezentos',
    'quatrocentos',
    'quinhentos',
    'seiscentos',
    'setecentos',
    'oitocentos',
    'novecentos',
];
const HORAS_EXTENSO = [
    'zero',
    'uma',
    'duas',
    'três',
    'quatro',
    'cinco',
    'seis',
    'sete',
    'oito',
    'nove',
    'dez',
    'onze',
    'doze',
    'treze',
    'quatorze',
    'quinze',
    'dezesseis',
    'dezessete',
    'dezoito',
    'dezenove',
    'vinte',
    'vinte e uma',
    'vinte e duas',
    'vinte e três',
];

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function numeroAte999(n: number): string {
    if (n < 20) return UNIDADES[n];
    if (n < 100) {
        const d = Math.floor(n / 10);
        const u = n % 10;
        return u === 0 ? DEZENAS[d] : `${DEZENAS[d]} e ${UNIDADES[u]}`;
    }
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100);
    const r = n % 100;
    return r === 0 ? CENTENAS[c] : `${CENTENAS[c]} e ${numeroAte999(r)}`;
}

function numeroPorExtenso(n: number): string {
    if (n < 1000) return numeroAte999(n);
    if (n < 2000) {
        const r = n % 1000;
        return r === 0 ? 'mil' : `mil e ${numeroAte999(r)}`;
    }
    if (n < 1_000_000) {
        const milhares = Math.floor(n / 1000);
        const r = n % 1000;
        const milTxt = `${numeroAte999(milhares)} mil`;
        return r === 0 ? milTxt : `${milTxt} e ${numeroAte999(r)}`;
    }
    return String(n);
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

function formatarHoraExtenso(data: Date | null | undefined): string {
    if (!data) return 'horário não informado';
    const d = new Date(data);
    const h = d.getHours();
    const m = d.getMinutes();
    const horaTxt = HORAS_EXTENSO[h] ?? String(h);
    const unidade = h === 1 ? 'hora' : 'horas';
    if (m === 0) return `${horaTxt} ${unidade}`;
    return `${horaTxt} ${unidade} e ${numeroPorExtenso(m)} minuto${m === 1 ? '' : 's'}`;
}

/** Ex.: "27 (vinte e sete) do mês de outubro do ano de 2017 (dois mil e dezessete)" */
function formatarDataNarrativa(data: Date): string {
    const d = new Date(data);
    const dia = d.getDate();
    const mes = d.toLocaleDateString('pt-BR', { month: 'long' });
    const ano = d.getFullYear();
    return `${dia} (${numeroPorExtenso(dia)}) do mês de ${mes} do ano de ${ano} (${numeroPorExtenso(ano)})`;
}

function formatarDataTitulo(data: Date): string {
    const d = new Date(data);
    const dia = d.getDate();
    const mes = d.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
    const ano = d.getFullYear();
    return `${dia} DE ${mes} DE ${ano}`;
}

function nomeSessao(tipoSessaoNome: string): string {
    const nome = tipoSessaoNome.trim();
    if (/^sessão\b/i.test(nome)) return nome;
    return `sessão ${nome}`;
}

function nomeCamara(dados: AtaTemplateDados): string {
    const fantasia = dados.tenant.nomeFantasia?.trim();
    const nome = dados.tenant.nome?.trim();
    const raw = fantasia || nome || 'Câmara Municipal';
    if (/câmara municipal/i.test(raw)) {
        const cidade = dados.tenant.cidade?.trim();
        if (cidade && !new RegExp(cidade, 'i').test(raw)) {
            return `Câmara Municipal de ${cidade}`;
        }
        return raw.replace(/^município de [^–-]+[–-]\s*/i, '').trim();
    }
    const cidade = dados.tenant.cidade?.trim();
    return cidade ? `Câmara Municipal de ${cidade}` : 'Câmara Municipal';
}

function estadoPorExtenso(uf?: string | null): string | null {
    if (!uf) return null;
    const map: Record<string, string> = {
        AC: 'Acre',
        AL: 'Alagoas',
        AP: 'Amapá',
        AM: 'Amazonas',
        BA: 'Bahia',
        CE: 'Ceará',
        DF: 'Distrito Federal',
        ES: 'Espírito Santo',
        GO: 'Goiás',
        MA: 'Maranhão',
        MT: 'Mato Grosso',
        MS: 'Mato Grosso do Sul',
        MG: 'Minas Gerais',
        PA: 'Pará',
        PB: 'Paraíba',
        PR: 'Paraná',
        PE: 'Pernambuco',
        PI: 'Piauí',
        RJ: 'Rio de Janeiro',
        RN: 'Rio Grande do Norte',
        RS: 'Rio Grande do Sul',
        RO: 'Rondônia',
        RR: 'Roraima',
        SC: 'Santa Catarina',
        SP: 'São Paulo',
        SE: 'Sergipe',
        TO: 'Tocantins',
    };
    return map[uf.toUpperCase()] ?? uf;
}

function pluralizar(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
}

function labelResultado(valor?: string | null): string {
    if (!valor) return 'sem deliberação registrada';
    const map: Record<string, string> = {
        APROVADO: 'aprovado',
        REJEITADO: 'rejeitado',
        RETIRADO: 'retirado',
        ADIADO: 'adiado',
        EMPATADO: 'empatado',
    };
    return map[valor] ?? valor.toLowerCase();
}

function labelTipoVotacao(tipo: string): string {
    const map: Record<string, string> = {
        NOMINAL: 'nominal',
        SIMBOLICA: 'simbólica',
        SECRETA: 'secreta',
    };
    return map[tipo] ?? tipo.toLowerCase();
}

function listarVereadoresChamada(
    itens: { nome: string; partido?: string | null }[],
): string {
    if (itens.length === 0) return 'nenhum vereador registrado';
    return itens
        .map((p) => {
            const nome = escapeHtml(p.nome.toUpperCase());
            return p.partido ? `${nome} – ${escapeHtml(p.partido)}` : nome;
        })
        .join(', ');
}

function encontrarCargo(
    mesa: AtaTemplateMesa[],
    ...padroes: RegExp[]
): AtaTemplateMesa | null {
    for (const padrao of padroes) {
        const hit = mesa.find((m) => padrao.test(m.cargo));
        if (hit) return hit;
    }
    return null;
}

function ehExpediente(fase: string): boolean {
    return (
        fase === 'EXPEDIENTE' ||
        fase === 'PEQUENO_EXPEDIENTE' ||
        fase === 'GRANDE_EXPEDIENTE'
    );
}

function narrarItemPauta(item: AtaTemplatePautaItem, index: number): string {
    const numero = item.ordem > 0 ? item.ordem : index + 1;
    const id = escapeHtml(item.identificacao);
    const ementa = item.ementa?.trim()
        ? escapeHtml(item.ementa.trim())
        : null;

    let texto = `<p>Item ${numero} da pauta — <strong>${id}</strong>`;
    if (ementa) texto += `, ${ementa}`;
    texto += '.</p>';

    if (item.votacao) {
        const v = item.votacao;
        texto += `<p>Submetida à votação ${escapeHtml(labelTipoVotacao(v.tipoVotacao))}, obteve ${pluralizar(
            v.votosSim,
            'voto favorável',
            'votos favoráveis',
        )}, ${pluralizar(v.votosNao, 'voto contrário', 'votos contrários')} e ${pluralizar(
            v.abstencoes,
            'abstenção',
            'abstenções',
        )}${
            v.votoQualidade ? ', com voto de qualidade da Presidência' : ''
        }. Resultado da votação: <strong>${escapeHtml(labelResultado(v.resultado))}</strong>.</p>`;

        if (
            v.tipoVotacao === 'NOMINAL' &&
            v.votos &&
            v.votos.length > 0
        ) {
            const lista = v.votos
                .map(
                    (voto) =>
                        `${escapeHtml(voto.nome)} (${escapeHtml(
                            voto.voto === 'SIM'
                                ? 'Sim'
                                : voto.voto === 'NAO'
                                  ? 'Não'
                                  : voto.voto === 'ABSTENCAO'
                                    ? 'Abstenção'
                                    : voto.voto,
                        )})`,
                )
                .join('; ');
            texto += `<p>Registraram voto: ${lista}.</p>`;
        }
    } else if (item.resultadoPauta) {
        texto += `<p>Resultado na pauta: <strong>${escapeHtml(
            labelResultado(item.resultadoPauta),
        )}</strong>.</p>`;
    } else {
        texto += '<p>Sem deliberação registrada neste item.</p>';
    }

    return texto;
}

/**
 * Monta o HTML da ata no padrão narrativo clássico de câmaras municipais
 * (título formal, prosa contínua, chamada, expediente, ordem do dia,
 * tribuna e encerramento), inspirado no modelo tradicional de atas.
 */
export class AtaTemplateService {
    montar(dados: AtaTemplateDados): string {
        const camara = nomeCamara(dados);
        const cidade = dados.tenant.cidade?.trim() || null;
        const uf = dados.tenant.uf?.trim() || null;
        const estado = estadoPorExtenso(uf);
        const tipoSessao = nomeSessao(dados.tipoSessaoNome);
        const dataRef = dados.dataAbertura ?? dados.dataInicio;
        const data = new Date(dataRef);

        const local =
            dados.local?.trim() ||
            (cidade
                ? `Plenário da ${camara}`
                : `prédio do Legislativo Municipal`);

        const presentes = dados.presencas.filter((p) => p.situacao === 'PRESENTE');
        const ausentes = dados.presencas.filter((p) => p.situacao === 'AUSENTE');
        const justificados = dados.presencas.filter(
            (p) => p.situacao === 'JUSTIFICADO',
        );

        const presidente =
            encontrarCargo(dados.mesaDiretora, /^presidente$/i, /presid/i) ??
            dados.mesaDiretora[0] ??
            null;
        const vice = encontrarCargo(
            dados.mesaDiretora,
            /vice[-\s]?presid/i,
        );
        const secretario = encontrarCargo(
            dados.mesaDiretora,
            /1[ºo.]?\s*secret/i,
            /primeiro\s+secret/i,
            /^secret/i,
        );

        const expediente = dados.pautaItens.filter((i) => ehExpediente(i.fase));
        const ordemDia = dados.pautaItens.filter((i) => !ehExpediente(i.fase));

        const legislaturaTxt =
            dados.legislaturaNumero != null
                ? `${dados.legislaturaNumero}ª LEGISLATURA`
                : null;

        const tituloPartes = [
            `ATA DA ${tipoSessao.toUpperCase()} DA ${camara.toUpperCase()}`,
            estado ? `ESTADO DO ${estado.toUpperCase()}` : null,
            legislaturaTxt,
            `REALIZADA NO DIA ${formatarDataTitulo(data)}, ÀS ${formatarHora(
                dados.dataAbertura ?? dataRef,
            )} HORAS.`,
        ].filter(Boolean);

        const aberturaPresidencia = presidente
            ? `sob a Presidência do seu Presidente Titular Vereador <strong>${escapeHtml(
                  presidente.nome.toUpperCase(),
              )}</strong>`
            : 'sob a presidência dos trabalhos';

        const chamadaAuxilio = vice
            ? ` que, obedecendo às formalidades legais e regimentais em vigor, solicitou ao Senhor Vice-Presidente Vereador <strong>${escapeHtml(
                  vice.nome.toUpperCase(),
              )}</strong> a fazer a chamada para verificação de quórum`
            : secretario
              ? ` que, obedecendo às formalidades legais e regimentais em vigor, determinou ao Senhor Secretário Vereador <strong>${escapeHtml(
                    secretario.nome.toUpperCase(),
                )}</strong> a fazer a chamada para verificação de quórum`
              : ` que, obedecendo às formalidades legais e regimentais em vigor, determinou a chamada para verificação de quórum`;

        const paragrafoAbertura = `<p>Às ${escapeHtml(
            formatarHoraExtenso(dados.dataAbertura ?? dataRef),
        )} do dia ${escapeHtml(formatarDataNarrativa(data))}, no ${escapeHtml(
            local,
        )}, reuniu-se${/ordinár/i.test(tipoSessao) ? ' ordinariamente' : ''} a ${escapeHtml(
            camara,
        )} ${aberturaPresidencia}${chamadaAuxilio}. Feita a chamada, foi constatada a presença dos Vereadores: ${listarVereadoresChamada(
            presentes,
        )}. Havendo número legal, foi aberta a presente Sessão.</p>`;

        let paragrafoJustificativas = '';
        if (justificados.length > 0) {
            paragrafoJustificativas = `<p>Foram justificadas as ausências de: ${listarVereadoresChamada(
                justificados,
            )}, o que foi acatado pela Mesa Diretora.</p>`;
        } else if (ausentes.length > 0) {
            paragrafoJustificativas = `<p>Registraram-se ainda as seguintes ausências: ${listarVereadoresChamada(
                ausentes,
            )}.</p>`;
        }

        let paragrafoExpediente = '';
        if (expediente.length === 0) {
            paragrafoExpediente =
                '<p>Em seguida, verificou-se que não havia expediente escrito constante da pauta.</p>';
        } else {
            const discriminado = expediente
                .map((item, i) => {
                    const n = item.ordem > 0 ? item.ordem : i + 1;
                    const ementa = item.ementa?.trim()
                        ? `, ${escapeHtml(item.ementa.trim())}`
                        : '';
                    return `${n}) ${escapeHtml(item.identificacao)}${ementa}`;
                })
                .join('; ');
            paragrafoExpediente = `<p>Em seguida foi feita a leitura do expediente escrito constante da pauta, assim discriminado: ${discriminado}.</p>`;
            paragrafoExpediente += expediente
                .map((item, i) => narrarItemPauta(item, i))
                .join('\n');
        }

        let paragrafoOrdem = '';
        if (ordemDia.length === 0) {
            paragrafoOrdem =
                '<p>Passando para a Ordem do Dia, não havia proposições pendentes de deliberação.</p>';
        } else {
            paragrafoOrdem = `<p>Passando para a Ordem do Dia, foi novamente verificada a presença dos Senhores Vereadores: ${listarVereadoresChamada(
                presentes,
            )}. Prosseguindo, apreciaram-se as proposições da pauta.</p>`;
            paragrafoOrdem += ordemDia
                .map((item, i) => narrarItemPauta(item, i))
                .join('\n');
        }

        let paragrafoTribuna = '';
        const falas = dados.pedidosPalavra.filter(
            (p) => p.status === 'CONCEDIDO' || p.status === 'ENCERRADO',
        );
        if (falas.length === 0) {
            paragrafoTribuna =
                '<p>No expediente oral, não houve registro de uso da tribuna nesta sessão.</p>';
        } else {
            const narradas = falas
                .map((p) => {
                    const tema = p.tema?.trim()
                        ? `, tratando de ${escapeHtml(p.tema.trim())}`
                        : '';
                    return `o Senhor Presidente facultou a palavra ao(à) Vereador(a) <strong>${escapeHtml(
                        p.nome,
                    )}</strong>${tema}`;
                })
                .join('; em seguida, ');
            paragrafoTribuna = `<p>Passando para o expediente oral, ${narradas}.</p>`;
        }

        const observacoes = dados.observacoes?.trim()
            ? `<p><strong>Observações:</strong> ${escapeHtml(dados.observacoes.trim())}</p>`
            : '';

        const paragrafoEncerramento = `<p>Naquele momento, nada mais havendo a tratar, o senhor Presidente${
            presidente
                ? ` <strong>${escapeHtml(presidente.nome)}</strong>`
                : ''
        } deu por encerrada a presente Sessão às ${escapeHtml(
            formatarHora(dados.dataEncerramento),
        )} do dia ${escapeHtml(
            formatarDataCurta(dados.dataEncerramento ?? dataRef),
        )} e, para constar, mandou lavrar a presente ata, que vai assinada pelo Presidente${
            vice ? ', Vice-Presidente' : ''
        }${secretario ? ', Secretário' : ''} e demais Vereadores presentes na referida Sessão, depois de lida, achada devidamente conforme e aprovada.</p>`;

        const rodapeLocal = [
            local.toUpperCase(),
            cidade && uf ? `${cidade.toUpperCase()}/${uf.toUpperCase()}` : cidade?.toUpperCase(),
            formatarDataCurta(dados.dataEncerramento ?? dataRef),
        ]
            .filter(Boolean)
            .join(' — ');

        const assinaturasMesa = [
            presidente
                ? `<div class="ata-assinatura"><p class="ata-assinatura-nome">${escapeHtml(
                      presidente.nome.toUpperCase(),
                  )}</p><p class="ata-assinatura-cargo"><strong>Presidente</strong></p></div>`
                : '',
            vice
                ? `<div class="ata-assinatura"><p class="ata-assinatura-nome">${escapeHtml(
                      vice.nome.toUpperCase(),
                  )}</p><p class="ata-assinatura-cargo"><strong>Vice-Presidente</strong></p></div>`
                : '',
            secretario
                ? `<div class="ata-assinatura"><p class="ata-assinatura-nome">${escapeHtml(
                      secretario.nome.toUpperCase(),
                  )}</p><p class="ata-assinatura-cargo"><strong>Secretário</strong></p></div>`
                : '',
        ]
            .filter(Boolean)
            .join('\n');

        const listaAssinaturaVereadores =
            presentes.length > 0
                ? `<ol class="ata-lista-vereadores">${presentes
                      .map(
                          (p, i) =>
                              `<li>${String(i + 1).padStart(2, '0')} — ${escapeHtml(
                                  p.nome,
                              )}${p.partido ? ` (${escapeHtml(p.partido)})` : ''}</li>`,
                      )
                      .join('\n')}</ol>`
                : '';

        return `
<header class="ata-cabecalho">
<p class="ata-orgao"><strong>${escapeHtml(camara.toUpperCase())}</strong></p>
${cidade || uf ? `<p class="ata-localidade">${escapeHtml([cidade, uf].filter(Boolean).join('/'))}</p>` : ''}
${dados.tenant.cnpj ? `<p class="ata-meta">CNPJ: ${escapeHtml(dados.tenant.cnpj)}</p>` : ''}
</header>

<h1 class="ata-titulo">${tituloPartes.map((p) => escapeHtml(String(p))).join(', ')}</h1>

<section class="ata-corpo">
${paragrafoAbertura}
${paragrafoJustificativas}
${paragrafoExpediente}
${paragrafoOrdem}
${paragrafoTribuna}
${observacoes}
${paragrafoEncerramento}
</section>

<p class="ata-rodape-local"><strong>${escapeHtml(rodapeLocal)}</strong></p>

<section class="ata-assinaturas">
${assinaturasMesa}
</section>

${
    listaAssinaturaVereadores
        ? `<section class="ata-secao"><h2>VEREADORES PRESENTES:</h2>${listaAssinaturaVereadores}</section>`
        : ''
}
`.trim();
    }
}
