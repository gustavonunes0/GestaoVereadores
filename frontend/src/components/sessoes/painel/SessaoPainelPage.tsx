import { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { tenantsApi } from '../../../api/tenants.api';
import { useAuth } from '../../../contexts/AuthContext';
import { useSessaoRealtime } from '../../../hooks/useSessaoRealtime';
import type { VotacaoEncerradaEvent } from '../../../types/legislative';
import type { FaseSessao, PautaItemDetalhe, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import {
    PAUTA_CATEGORIA_LABELS,
    categoriaDeliberavel,
    pautaItemDescricao,
    pautaItemRotulo,
    resolveFaseSessao,
    resolvePautaCategoria,
    resolvePautaFase,
    resolvePautaTipo,
    sessaoDetalheLabel,
} from '../../../types/sessoes';
import { criarPainelChannel, acionarEmergenciaPainel, type PainelMensagem } from '../../../utils/sessaoPainelChannel';
import { resolveTenantLogoUrl } from '../../../utils/tenantLogo';
import fallbackLogoSrc from '../../../../assets/logo.png';

const RESULTADO_LABEL: Record<string, string> = {
    APROVADO: 'Aprovado',
    REJEITADO: 'Rejeitado',
    EMPATE: 'Empate',
    ADIADO: 'Adiado',
};

const FASE_LABEL: Partial<Record<FaseSessao, string>> = {
    EXPEDIENTE: 'Expediente',
    ORDEM_DO_DIA: 'Ordem do Dia',
    EXPLICACOES_PESSOAIS: 'Explicações Pessoais',
};

const RESULTADO_EXIBICAO_MS = 25_000;

type ModoPainel = 'votacao' | 'resultado' | 'item' | 'pauta' | 'aguardando';

function PlacarGrande({
    sim,
    nao,
    abst,
    destaque,
}: {
    sim: number;
    nao: number;
    abst: number;
    destaque?: boolean;
}) {
    return (
        <div className={`sessao-painel-placar${destaque ? ' sessao-painel-placar--destaque' : ''}`}>
            <div className="sessao-painel-placar__item sessao-painel-placar__item--sim">
                <span className="sessao-painel-placar__valor">{sim}</span>
                <span className="sessao-painel-placar__label">Sim</span>
            </div>
            <div className="sessao-painel-placar__item sessao-painel-placar__item--nao">
                <span className="sessao-painel-placar__valor">{nao}</span>
                <span className="sessao-painel-placar__label">Não</span>
            </div>
            <div className="sessao-painel-placar__item sessao-painel-placar__item--abst">
                <span className="sessao-painel-placar__valor">{abst}</span>
                <span className="sessao-painel-placar__label">Abstenção</span>
            </div>
        </div>
    );
}

function PainelAguardando({
    sessaoLabel,
    logoSrc,
}: {
    sessaoLabel: string;
    logoSrc: string;
}) {
    return (
        <div className="sessao-painel-centro">
            <img src={logoSrc} alt="" className="sessao-painel-logo-grande" />
            <h2 className="sessao-painel-titulo-idle">{sessaoLabel}</h2>
            <p className="sessao-painel-sub-idle">Sessão a iniciar</p>
        </div>
    );
}

function PainelPautaDoDia({
    sessaoLabel,
    itens,
    itemDestacadoId,
}: {
    sessaoLabel: string;
    itens: PautaItemDetalhe[];
    itemDestacadoId?: string | null;
}) {
    const deliberaveis = itens.filter((i) =>
        categoriaDeliberavel(resolvePautaCategoria(i)),
    ).length;

    return (
        <div
            className={`sessao-painel-pauta${
                itens.length > 6 ? ' sessao-painel-pauta--compact' : ''
            }`}
        >
            <div className="sessao-painel-pauta__cabecalho">
                <div className="sessao-painel-etiqueta">Pauta do dia</div>
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
                                    <span className="sessao-painel-pauta__item-ementa">
                                        {pautaItemDescricao(item)}
                                    </span>
                                </div>
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

function PainelPauta({ item }: { item: PautaItemDetalhe }) {
    const categoria = resolvePautaCategoria(item);
    const rotulo = pautaItemRotulo(item);
    const descricao = pautaItemDescricao(item);
    const fase = resolvePautaFase(item.fase);
    const tipo = resolvePautaTipo(item.tipoPautaItem);

    return (
        <div className="sessao-painel-conteudo">
            <div className="sessao-painel-etiqueta">Leitura da pauta</div>
            <div className="sessao-painel-meta">
                <span>{PAUTA_CATEGORIA_LABELS[categoria]}</span>
                <span>·</span>
                <span>{fase.replace(/_/g, ' ')}</span>
                <span>·</span>
                <span>{tipo}</span>
            </div>
            <h1 className="sessao-painel-item-titulo">{rotulo}</h1>
            <p className="sessao-painel-item-texto">{descricao || 'Sem texto disponível para exibição.'}</p>
        </div>
    );
}

function PainelVotacao({
    titulo,
    ementa,
    sim,
    nao,
    abst,
}: {
    titulo: string;
    ementa?: string;
    sim: number;
    nao: number;
    abst: number;
}) {
    return (
        <div className="sessao-painel-conteudo">
            <div className={`sessao-painel-etiqueta sessao-painel-etiqueta--votacao`}>
                <span className="sessao-painel-pulse" aria-hidden />
                Votação Aberta
            </div>
            <h1 className="sessao-painel-item-titulo">{titulo}</h1>
            {ementa && <p className="sessao-painel-item-texto">{ementa}</p>}
            <PlacarGrande sim={sim} nao={nao} abst={abst} destaque />
        </div>
    );
}

function PainelResultado({ dados }: { dados: VotacaoEncerradaEvent }) {
    const resultado = RESULTADO_LABEL[dados.resultado] ?? dados.resultado;
    const aprovado = dados.resultado === 'APROVADO';

    return (
        <div className="sessao-painel-conteudo">
            <div
                className={`sessao-painel-resultado-badge${
                    aprovado ? ' sessao-painel-resultado-badge--aprovado' : ''
                }`}
            >
                {resultado}
            </div>
            {dados.titulo && <h1 className="sessao-painel-item-titulo">{dados.titulo}</h1>}
            <PlacarGrande sim={dados.votosSim} nao={dados.votosNao} abst={dados.abstencoes} />
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
    const [itemCarregando, setItemCarregando] = useState(false);
    const [emergenciaAtiva, setEmergenciaAtiva] = useState(false);
    const [tenantBranding, setTenantBranding] = useState<{
        name: string;
        logo: string | null;
    } | null>(null);

    const {
        faseAtual,
        votacaoAberta,
        votacaoEncerrada,
        placar,
        wsConectado,
        limparVotacaoEncerrada,
    } = useSessaoRealtime(sessaoId ?? '');

    const carregarItem = useCallback(async (itemId: string) => {
        if (!sessaoId) return;
        setItemCarregando(true);
        try {
            const item = await sessoesApi.getPautaItem(sessaoId, itemId);
            setItemExibido(item);
        } catch {
            setItemExibido(null);
        } finally {
            setItemCarregando(false);
        }
    }, [sessaoId]);

    const carregarPauta = useCallback(async () => {
        if (!sessaoId) return;
        try {
            const lista = await sessoesApi.getPauta(sessaoId);
            setItens(lista ?? []);
        } catch {
            setItens([]);
        }
    }, [sessaoId]);

    useEffect(() => {
        if (!sessaoId) return;
        setCarregando(true);
        Promise.all([
            sessoesApi.getDetalhe(sessaoId).then(setSessao).catch(() => setSessao(null)),
            carregarPauta(),
        ]).finally(() => setCarregando(false));
    }, [sessaoId, carregarPauta]);

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
                void carregarPauta();
            }
            if (ev.data.tipo === 'EMERGENCIA') {
                setEmergenciaAtiva(true);
                window.setTimeout(() => setEmergenciaAtiva(false), 8000);
            }
        };
        channel.addEventListener('message', onMessage);
        return () => channel.close();
    }, [sessaoId, carregarItem, carregarPauta]);

    useEffect(() => {
        if (votacaoEncerrada) void carregarPauta();
    }, [votacaoEncerrada, carregarPauta]);

    useEffect(() => {
        if (!votacaoEncerrada) return;
        const timer = window.setTimeout(() => {
            limparVotacaoEncerrada();
        }, RESULTADO_EXIBICAO_MS);
        return () => window.clearTimeout(timer);
    }, [votacaoEncerrada, limparVotacaoEncerrada]);

    const dispararEmergencia = useCallback(() => {
        if (!sessaoId) return;
        setEmergenciaAtiva(true);
        acionarEmergenciaPainel(sessaoId);
        try {
            const Ctx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext;
            const ctx = new Ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = 880;
            gain.gain.value = 0.08;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            window.setTimeout(() => {
                osc.stop();
                void ctx.close();
            }, 600);
        } catch {
            /* áudio opcional */
        }
        window.setTimeout(() => setEmergenciaAtiva(false), 8000);
    }, [sessaoId]);

    useEffect(() => {
        document.body.classList.add('sessao-painel-body');
        return () => document.body.classList.remove('sessao-painel-body');
    }, []);

    useEffect(() => {
        let cancelled = false;
        void tenantsApi
            .current()
            .then((res) => {
                if (cancelled || res.kind !== 'tenant') return;
                setTenantBranding({
                    name: res.name,
                    logo: res.logo ?? null,
                });
            })
            .catch(() => {
                /* mantém fallback do usuário autenticado */
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const placarAtual =
        placar?.votacaoId === votacaoAberta?.votacaoId ? placar : null;

    let modo: ModoPainel = 'aguardando';
    if (votacaoAberta) modo = 'votacao';
    else if (votacaoEncerrada) modo = 'resultado';
    else if (itemExibido) modo = 'item';
    else if (itens.length > 0) modo = 'pauta';

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
    const logoSrc =
        resolveTenantLogoUrl(tenantBranding?.logo ?? userTenantLogo) ??
        fallbackLogoSrc;

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
        <div className={`sessao-painel${modo === 'votacao' ? ' sessao-painel--votacao' : ''}`}>
            {emergenciaAtiva ? (
                <div className="sessao-painel-emergencia" role="alert">
                    <i className="pi pi-exclamation-triangle" aria-hidden />
                    <strong>ALERTA DE EMERGÊNCIA</strong>
                    <span>Atenção da mesa e do plenário</span>
                </div>
            ) : null}
            <header className="sessao-painel-header">
                <div className="sessao-painel-header__marca">
                    <img src={logoSrc} alt="" className="sessao-painel-logo" />
                    <span className="sessao-painel-header__camara">
                        {tenantName}
                    </span>
                </div>
                <div className="sessao-painel-header__sessao">{sessaoLabel}</div>
                <div className="sessao-painel-header__status">
                    {faseLabel && <span className="sessao-painel-fase">{faseLabel}</span>}
                    {wsConectado && (
                        <span className="sessao-painel-ao-vivo">
                            <span className="sessao-painel-pulse" aria-hidden />
                            Ao vivo
                        </span>
                    )}
                </div>
            </header>

            <main className="sessao-painel-main">
                <img
                    src={logoSrc}
                    alt=""
                    className="sessao-painel-marca-dagua"
                    aria-hidden
                />
                {itemCarregando && modo === 'item' ? (
                    <div className="sessao-painel-centro">
                        <ProgressSpinner />
                    </div>
                ) : modo === 'votacao' && votacaoAberta ? (
                    <PainelVotacao
                        titulo={votacaoAberta.titulo}
                        ementa={votacaoAberta.ementa}
                        sim={placarAtual?.votosSim ?? votacaoAberta.votosSim}
                        nao={placarAtual?.votosNao ?? votacaoAberta.votosNao}
                        abst={placarAtual?.abstencoes ?? votacaoAberta.abstencoes}
                    />
                ) : modo === 'resultado' && votacaoEncerrada ? (
                    <PainelResultado dados={votacaoEncerrada} />
                ) : modo === 'item' && itemExibido ? (
                    <PainelPauta item={itemExibido} />
                ) : modo === 'pauta' ? (
                    <PainelPautaDoDia
                        sessaoLabel={sessaoLabel}
                        itens={itens}
                        itemDestacadoId={itemExibido?.id}
                    />
                ) : (
                    <PainelAguardando sessaoLabel={sessaoLabel} logoSrc={logoSrc} />
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
                <button
                    type="button"
                    className="sessao-painel-emergencia-btn"
                    onClick={dispararEmergencia}
                    title="Alerta visual e sonoro no telão"
                >
                    <i className="pi pi-exclamation-triangle" aria-hidden />
                    Emergência
                </button>
            </footer>
        </div>
    );
}
