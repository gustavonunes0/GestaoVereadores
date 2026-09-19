import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSessaoRealtime } from '../../../hooks/useSessaoRealtime';
import type { FaseSessao, PautaItemDetalhe, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import {
    PAUTA_CATEGORIA_LABELS,
    categoriaDeliberavel,
    pautaItemRotulo,
    resolveFaseSessao,
    resolvePautaCategoria,
    sessaoDetalheLabel,
} from '../../../types/sessoes';
import { criarPainelChannel, type PainelMensagem } from '../../../utils/sessaoPainelChannel';
import { resolveTenantLogoUrl } from '../../../utils/tenantLogo';
import fallbackLogoSrc from '../../../../assets/logo.png';
import {
    VotingPanel,
    resolvePanelVotes,
    usePainelElenco,
    type Councilor,
} from './voting';
import { ROLE_LABEL_APRESENTACAO } from './voting/types';
import {
    PautaVotacaoMiniDashboard,
    resolvePautaVotacaoPlacar,
} from '../pauta/PautaVotacaoMiniDashboard';
import { resolveMateriaTextoOriginalUrl } from '../../../utils/materiaDisplay';

const FASE_LABEL: Partial<Record<FaseSessao, string>> = {
    EXPEDIENTE: 'Expediente',
    ORDEM_DO_DIA: 'Ordem do Dia',
    EXPLICACOES_PESSOAIS: 'Explicações Pessoais',
};

const RESULTADO_EXIBICAO_MS = 25_000;

type ModoPainel = 'votacao' | 'resultado' | 'inicio';

function cargoMesaLabel(m: Councilor): string {
    if (m.role) return ROLE_LABEL_APRESENTACAO[m.role];
    if (m.cargoLabel?.trim()) return m.cargoLabel.trim();
    return 'Mesa';
}

function PainelMesaDiretora({
    president,
    mesa,
    loading,
}: {
    president: Councilor | null;
    mesa: Councilor[];
    loading?: boolean;
}) {
    const membrosBrutos =
        mesa.length > 0
            ? mesa
            : president
              ? [president]
              : [];
    // Um card por cargo; em caso de duplicata, permanece o último da lista.
    const byCargo = new Map<string, Councilor>();
    for (const m of membrosBrutos) {
        const key = m.role ?? m.cargoLabel?.trim().toLowerCase() ?? m.id;
        byCargo.set(key, m);
    }
    const membros = [...byCargo.values()].sort((a, b) => {
        const aPres = a.role === 'PRESIDENTE' ? 0 : 1;
        const bPres = b.role === 'PRESIDENTE' ? 0 : 1;
        return aPres - bPres;
    });

    return (
        <section className="sessao-painel-inicio__mesa" aria-label="Mesa diretora">
            <div className="sessao-painel-etiqueta">Mesa diretora</div>
            {loading && membros.length === 0 ? (
                <div className="sessao-painel-inicio__mesa-loading">
                    <ProgressSpinner style={{ width: '2.5rem', height: '2.5rem' }} />
                </div>
            ) : membros.length === 0 ? (
                <p className="sessao-painel-sub-idle">Mesa diretora não cadastrada.</p>
            ) : (
                <ul className="sessao-painel-inicio__mesa-lista">
                    {membros.map((m) => {
                        const isPresidente = m.role === 'PRESIDENTE';
                        const photo = m.photoUrl?.trim()
                            ? resolveMateriaTextoOriginalUrl(m.photoUrl.trim())
                            : null;
                        const initials = m.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase() ?? '')
                            .join('');
                        return (
                            <li
                                key={m.id}
                                className={[
                                    'sessao-painel-inicio__mesa-card',
                                    isPresidente
                                        ? 'sessao-painel-inicio__mesa-card--presidente'
                                        : '',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                            >
                                <div
                                    className={[
                                        'sessao-painel-inicio__mesa-avatar',
                                        isPresidente
                                            ? 'sessao-painel-inicio__mesa-avatar--presidente'
                                            : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    aria-hidden
                                >
                                    {photo ? (
                                        <img src={photo} alt="" />
                                    ) : (
                                        <span>{initials || '—'}</span>
                                    )}
                                </div>
                                <div className="sessao-painel-inicio__mesa-texto">
                                    <span className="sessao-painel-inicio__mesa-cargo">
                                        {cargoMesaLabel(m)}
                                    </span>
                                    <strong className="sessao-painel-inicio__mesa-nome">
                                        {m.name}
                                    </strong>
                                    {m.party ? (
                                        <span className="sessao-painel-inicio__mesa-partido">
                                            {m.party}
                                        </span>
                                    ) : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function PainelPautaDoDia({
    sessaoLabel,
    itens,
    itemDestacadoId,
    votacaoLive,
}: {
    sessaoLabel: string;
    itens: PautaItemDetalhe[];
    itemDestacadoId?: string | null;
    votacaoLive?: {
        pautaItemId: string;
        votosSim: number;
        votosNao: number;
        abstencoes: number;
    } | null;
}) {
    const deliberaveis = itens.filter((i) =>
        categoriaDeliberavel(resolvePautaCategoria(i)),
    ).length;

    return (
        <div className="sessao-painel-pauta sessao-painel-pauta--compact">
            <div className="sessao-painel-pauta__cabecalho">
                <div className="sessao-painel-etiqueta">Pauta da sessão</div>
                <h1 className="sessao-painel-pauta__titulo">{sessaoLabel}</h1>
                <p className="sessao-painel-pauta__resumo">
                    {itens.length} {itens.length === 1 ? 'item' : 'itens'} ·{' '}
                    {deliberaveis} em deliberação
                </p>
            </div>

            {itens.length === 0 ? (
                <p className="sessao-painel-sub-idle">Nenhum item publicado na pauta.</p>
            ) : (
                <ol className="sessao-painel-pauta__lista">
                    {itens.map((item, idx) => {
                        const categoria = resolvePautaCategoria(item);
                        const destacado = item.id === itemDestacadoId;
                        const live =
                            votacaoLive && votacaoLive.pautaItemId === item.id
                                ? votacaoLive
                                : null;
                        const placar = resolvePautaVotacaoPlacar(
                            live
                                ? {
                                      ...(item.votacao ?? { id: live.pautaItemId }),
                                      finalizada: false,
                                      votosSim: live.votosSim,
                                      votosNao: live.votosNao,
                                      abstencoes: live.abstencoes,
                                  }
                                : item.votacao,
                        ) ??
                            (categoriaDeliberavel(categoria)
                                ? {
                                      status: 'em_andamento' as const,
                                      statusLabel: 'Aguardando',
                                      votosSim: 0,
                                      votosNao: 0,
                                      abstencoes: 0,
                                      resultado: null,
                                  }
                                : null);

                        return (
                            <li
                                key={item.id}
                                className={`sessao-painel-pauta__item${
                                    destacado ? ' sessao-painel-pauta__item--destaque' : ''
                                }`}
                            >
                                <span className="sessao-painel-pauta__ordem">{idx + 1}</span>
                                <div className="sessao-painel-pauta__info">
                                    <span className="sessao-painel-pauta__item-titulo">
                                        {pautaItemRotulo(item)}
                                    </span>
                                </div>
                                {placar ? (
                                    <div className="sessao-painel-pauta__placar">
                                        <PautaVotacaoMiniDashboard placar={placar} />
                                    </div>
                                ) : null}
                                <span className="sessao-painel-pauta__cat">
                                    {PAUTA_CATEGORIA_LABELS[categoria]}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}

function PainelInicioSessao({
    sessaoLabel,
    itens,
    itemDestacadoId,
    president,
    mesa,
    elencoLoading,
    votacaoLive,
}: {
    sessaoLabel: string;
    itens: PautaItemDetalhe[];
    itemDestacadoId?: string | null;
    president: Councilor | null;
    mesa: Councilor[];
    elencoLoading?: boolean;
    votacaoLive?: {
        pautaItemId: string;
        votosSim: number;
        votosNao: number;
        abstencoes: number;
    } | null;
}) {
    return (
        <div className="sessao-painel-inicio">
            <PainelMesaDiretora
                president={president}
                mesa={mesa}
                loading={elencoLoading}
            />
            <PainelPautaDoDia
                sessaoLabel={sessaoLabel}
                itens={itens}
                itemDestacadoId={itemDestacadoId}
                votacaoLive={votacaoLive}
            />
        </div>
    );
}

export function SessaoPainelPage() {
    const { id: sessaoId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [sessao, setSessao] = useState<SessaoPlenariaDetalhe | null>(null);
    const [itens, setItens] = useState<PautaItemDetalhe[]>([]);
    const [itemExibido, setItemExibido] = useState<PautaItemDetalhe | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [tenantBranding, setTenantBranding] = useState<{
        name: string;
        logo: string | null;
        city?: string | null;
    } | null>(null);

    const {
        faseAtual,
        votacaoAberta,
        votacaoEncerrada,
        placar,
        wsConectado,
        limparVotacaoEncerrada,
        presencaUpdate,
    } = useSessaoRealtime(sessaoId ?? '');

    const idsQueVotaram = useMemo(() => {
        const ids =
            placar?.votacaoId === votacaoAberta?.votacaoId
                ? placar?.parliamentarianIdsQueVotaram
                : undefined;
        return new Set(ids ?? []);
    }, [placar, votacaoAberta?.votacaoId]);

    const {
        president,
        left,
        right,
        all,
        loading: elencoLoading,
    } = usePainelElenco({
        sessaoId: sessaoId ?? '',
        presencaUpdate,
        idsQueVotaram,
        revealNominalVotes: votacaoAberta?.tipoVotacao === 'NOMINAL',
    });

    const carregarSnapshot = useCallback(async () => {
        if (!sessaoId) return;
        try {
            const data = await sessoesApi.getPainelPublico(sessaoId);
            setSessao(data.sessao);
            setItens(data.itens ?? []);
            setTenantBranding({
                name: data.tenant.name,
                logo: data.tenant.logo,
                city: data.tenant.city,
            });
        } catch {
            setSessao(null);
            setItens([]);
        }
    }, [sessaoId]);

    const carregarItem = useCallback(
        async (itemId: string) => {
            if (!sessaoId) return;
            try {
                const local = itens.find((i) => i.id === itemId);
                if (local) {
                    setItemExibido(local);
                    return;
                }
                const data = await sessoesApi.getPainelPublico(sessaoId);
                setItens(data.itens ?? []);
                setItemExibido(data.itens.find((i) => i.id === itemId) ?? null);
            } catch {
                setItemExibido(null);
            }
        },
        [sessaoId, itens],
    );

    useEffect(() => {
        if (!sessaoId) return;
        setCarregando(true);
        void carregarSnapshot().finally(() => setCarregando(false));
    }, [sessaoId, carregarSnapshot]);

    useEffect(() => {
        const itemId = searchParams.get('item');
        if (itemId) void carregarItem(itemId);
    }, [searchParams, carregarItem]);

    useEffect(() => {
        if (!sessaoId) return;
        const channel = criarPainelChannel(sessaoId);
        const onMessage = (ev: MessageEvent<PainelMensagem>) => {
            if (ev.data.tipo === 'EXIBIR_ITEM') {
                void carregarItem(ev.data.itemId);
            }
            if (ev.data.tipo === 'LIMPAR') {
                setItemExibido(null);
                void carregarSnapshot();
            }
        };
        channel.addEventListener('message', onMessage);
        return () => channel.close();
    }, [sessaoId, carregarItem, carregarSnapshot]);

    useEffect(() => {
        if (votacaoEncerrada) void carregarSnapshot();
    }, [votacaoEncerrada, carregarSnapshot]);

    useEffect(() => {
        if (!votacaoEncerrada) return;
        const timer = window.setTimeout(() => {
            limparVotacaoEncerrada();
        }, RESULTADO_EXIBICAO_MS);
        return () => window.clearTimeout(timer);
    }, [votacaoEncerrada, limparVotacaoEncerrada]);

    useEffect(() => {
        document.body.classList.add('sessao-painel-body');
        return () => document.body.classList.remove('sessao-painel-body');
    }, []);

    const placarAtual =
        placar?.votacaoId === votacaoAberta?.votacaoId ? placar : null;

    /** Início (mesa + pauta) é o padrão; só sai com votação aberta ou resultado breve. */
    let modo: ModoPainel = 'inicio';
    if (votacaoAberta) modo = 'votacao';
    else if (votacaoEncerrada) modo = 'resultado';

    const modoLed = modo === 'votacao' || modo === 'resultado';

    const mesaMembros = useMemo(() => {
        const ids = new Set<string>();
        const list: typeof left = [];
        if (president) {
            ids.add(president.id);
            list.push(president);
        }
        for (const m of left) {
            if (!ids.has(m.id)) {
                ids.add(m.id);
                list.push(m);
            }
        }
        return list;
    }, [president, left]);

    const sessaoLabel = sessao ? sessaoDetalheLabel(sessao) : 'Sessão plenária';
    const faseExibida = faseAtual ?? (sessao ? resolveFaseSessao(sessao.faseAtual) : null);
    const faseLabel = faseExibida ? FASE_LABEL[faseExibida] ?? faseExibida : null;
    const userTenantName =
        user && 'tenantName' in user ? user.tenantName : undefined;
    const userTenantLogo =
        user && 'tenantLogo' in user ? user.tenantLogo : undefined;
    const tenantName =
        tenantBranding?.name?.trim() ||
        userTenantName?.trim() ||
        'Câmara Municipal';
    const institutionName =
        tenantBranding?.city?.trim() ||
        tenantName.replace(/^c[âa]mara\s+municipal\s+(de\s+)?/i, '').trim() ||
        tenantName;
    const logoSrc =
        resolveTenantLogoUrl(tenantBranding?.logo ?? userTenantLogo) ??
        fallbackLogoSrc;

    const votesLive = resolvePanelVotes({
        votosSim: placarAtual?.votosSim ?? votacaoAberta?.votosSim ?? 0,
        votosNao: placarAtual?.votosNao ?? votacaoAberta?.votosNao ?? 0,
        abstencoes: placarAtual?.abstencoes ?? votacaoAberta?.abstencoes ?? 0,
    });

    const votesResult = votacaoEncerrada
        ? resolvePanelVotes({
              votosSim: votacaoEncerrada.votosSim,
              votosNao: votacaoEncerrada.votosNao,
              abstencoes: votacaoEncerrada.abstencoes,
          })
        : votesLive;

    if (carregando) {
        return (
            <div className="sessao-painel">
                <ProgressSpinner />
            </div>
        );
    }

    if (!sessao) {
        return (
            <div className="sessao-painel">
                <div className="sessao-painel-centro">
                    <p>Sessão não encontrada.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={[
                'sessao-painel',
                modo === 'votacao' ? 'sessao-painel--votacao' : '',
                modoLed ? 'sessao-painel--led' : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {!modoLed ? (
                <header className="sessao-painel-header">
                    <div className="sessao-painel-header__marca">
                        <img src={logoSrc} alt="" className="sessao-painel-logo" />
                        <span className="sessao-painel-header__camara">{tenantName}</span>
                    </div>
                    <div className="sessao-painel-header__sessao">{sessaoLabel}</div>
                    <div className="sessao-painel-header__status">
                        {faseLabel && (
                            <span className="sessao-painel-fase">{faseLabel}</span>
                        )}
                        {wsConectado && (
                            <span className="sessao-painel-ao-vivo">
                                <span className="sessao-painel-pulse" aria-hidden />
                                Ao vivo
                            </span>
                        )}
                    </div>
                </header>
            ) : null}

            <main className="sessao-painel-main">
                {!modoLed ? (
                    <img
                        src={logoSrc}
                        alt=""
                        className="sessao-painel-marca-dagua"
                        aria-hidden
                    />
                ) : null}

                {modo === 'votacao' && votacaoAberta ? (
                    elencoLoading && all.length === 0 ? (
                        <div className="sessao-painel-centro">
                            <ProgressSpinner />
                        </div>
                    ) : (
                        <VotingPanel
                            mode="live"
                            institutionName={institutionName}
                            logoSrc={logoSrc}
                            president={president}
                            left={left}
                            right={right}
                            all={all}
                            votes={votesLive}
                            materiaTitulo={votacaoAberta.titulo}
                        />
                    )
                ) : modo === 'resultado' && votacaoEncerrada ? (
                    <VotingPanel
                        mode="result"
                        institutionName={institutionName}
                        logoSrc={logoSrc}
                        president={president}
                        left={left}
                        right={right}
                        all={all}
                        votes={votesResult}
                        materiaTitulo={votacaoEncerrada.titulo}
                        resultado={votacaoEncerrada.resultado}
                    />
                ) : (
                    <PainelInicioSessao
                        sessaoLabel={sessaoLabel}
                        itens={itens}
                        itemDestacadoId={itemExibido?.id}
                        president={president}
                        mesa={mesaMembros}
                        elencoLoading={elencoLoading}
                        votacaoLive={null}
                    />
                )}
            </main>

            <footer className="sessao-painel-footer">
                <button
                    type="button"
                    className="sessao-painel-fs-btn"
                    onClick={() => void document.documentElement.requestFullscreen?.()}
                >
                    <i className="pi pi-expand" aria-hidden />
                    Tela cheia
                </button>
            </footer>
        </div>
    );
}
