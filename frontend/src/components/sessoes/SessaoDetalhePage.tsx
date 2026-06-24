import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAuth } from '../../contexts/AuthContext';
import { useAppToast } from '../../hooks/useAppToast';
import { useSessaoRealtime } from '../../hooks/useSessaoRealtime';
import {
    type SessaoPlenariaDetalhe,
    type StatusSessao,
    type FaseSessao,
    resolveFaseSessao,
    sessaoDetalheLabel,
    sessaoDetalheSubtitulo,
} from '../../types/sessoes';
import { SessaoAcoesMenu } from './SessaoAcoesMenu';
import { PautaManager } from './pauta/PautaManager';
import { PresencaPanel } from './presencas/PresencaPanel';
import { TransmissaoPanel } from './transmissao/TransmissaoPanel';

const STATUS_BADGE: Record<StatusSessao, { className: string; icon: string; label: string }> = {
    AGENDADA:  { className: 'badge--info',    icon: 'pi pi-calendar',    label: 'Agendada'  },
    ABERTA:    { className: 'badge--success', icon: 'pi pi-circle-fill', label: 'Aberta'    },
    SUSPENSA:  { className: 'badge--warning', icon: 'pi pi-pause',       label: 'Suspensa'  },
    ENCERRADA: { className: 'badge--neutral', icon: 'pi pi-check-circle', label: 'Encerrada' },
    CANCELADA: { className: 'badge--danger',  icon: 'pi pi-times-circle', label: 'Cancelada' },
};

const FASE_BADGE: Partial<Record<FaseSessao, { className: string; icon: string; label: string }>> = {
    EXPEDIENTE:           { className: 'badge--info',    icon: 'pi pi-clock', label: 'Expediente'           },
    ORDEM_DO_DIA:         { className: 'badge--warning', icon: 'pi pi-clock', label: 'Ordem do Dia'         },
    EXPLICACOES_PESSOAIS: { className: 'badge--neutral', icon: 'pi pi-clock', label: 'Explicações Pessoais' },
};

export function SessaoDetalhePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showApiError } = useAppToast();

    const [sessao, setSessao] = useState<SessaoPlenariaDetalhe | null>(null);
    const [loading, setLoading] = useState(true);

    const { faseAtual, votacaoAberta, placar, wsConectado } = useSessaoRealtime(id ?? '');

    const faseExibida = faseAtual ?? resolveFaseSessao(sessao?.faseAtual);
    const mostrarTransmissao = ['ABERTA', 'SUSPENSA', 'AGENDADA'].includes(sessao?.statusSessao ?? '');
    const [transmitindo] = useState(false);

    const buscar = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await sessoesApi.getDetalhe(id);
            setSessao(data);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [id, showApiError]);

    useEffect(() => { void buscar(); }, [buscar]);

    const userName = user
        ? ('displayName' in user ? String(user.displayName) : (user as { nome?: string }).nome ?? 'Usuário')
        : 'Usuário';

    if (loading) {
        return (
            <div className="flex justify-content-center py-6">
                <ProgressSpinner />
            </div>
        );
    }

    if (!sessao) {
        return (
            <div className="flex flex-column align-items-center py-6 gap-2">
                <i className="pi pi-exclamation-triangle text-orange-500 text-4xl" />
                <span>Sessão não encontrada.</span>
                <Button label="Voltar" text onClick={() => navigate(-1)} />
            </div>
        );
    }

    const nomeLabel = sessaoDetalheLabel(sessao);
    const subtitulo = sessaoDetalheSubtitulo(sessao);
    const statusCfg = STATUS_BADGE[sessao.statusSessao];
    const faseCfg = FASE_BADGE[faseExibida];

    return (
        <div className="sessao-detalhe-page">
            <div className="sessao-topbar">
                <Button
                    label="Sessões"
                    icon="pi pi-arrow-left"
                    size="small"
                    outlined
                    severity="secondary"
                    className="sessao-topbar-back"
                    aria-label="Voltar para sessões"
                    onClick={() => navigate('/sessoes')}
                />

                <div className="sessao-topbar-info">
                    <div className="sessao-topbar-title">{nomeLabel}</div>
                    <div className="sessao-topbar-sub">{subtitulo}</div>
                </div>

                <div className="sessao-topbar-badges">
                    {statusCfg && (
                        <span className={`badge ${statusCfg.className}`}>
                            <i className={statusCfg.icon} aria-hidden />
                            {statusCfg.label}
                        </span>
                    )}
                    {faseCfg && (
                        <span className={`badge ${faseCfg.className}`}>
                            <i className={faseCfg.icon} aria-hidden />
                            {faseCfg.label}
                        </span>
                    )}
                    {wsConectado && (
                        <span className="ws-pill">
                            <i className="pi pi-wifi" aria-hidden />
                            Ao vivo
                        </span>
                    )}
                </div>

                <div className="sessao-topbar-actions">
                    <SessaoAcoesMenu
                        sessaoId={sessao.id}
                        status={sessao.statusSessao}
                        onUpdated={() => void buscar()}
                    />
                </div>
            </div>

            {votacaoAberta && (
                <div className="sessao-votacao-banner">
                    <span>
                        <strong>Votação:</strong> {votacaoAberta.titulo}
                    </span>
                    <span>
                        SIM: <strong className="text-green-600">{placar?.votosSim ?? votacaoAberta.votosSim}</strong>
                        {' | '}
                        NÃO: <strong className="text-red-600">{placar?.votosNao ?? votacaoAberta.votosNao}</strong>
                        {' | '}
                        ABSTENÇÃO: <strong>{placar?.abstencoes ?? votacaoAberta.abstencoes}</strong>
                    </span>
                </div>
            )}

            <TabView className="sessao-detalhe-tabview sigl-tabview-menu">
                <TabPanel
                    header={
                        <span className="sigl-tabview-menu-header">
                            <i className="pi pi-list" aria-hidden />
                            Pauta
                        </span>
                    }
                >
                    <PautaManager sessao={sessao} />
                </TabPanel>

                <TabPanel
                    header={
                        <span className="sigl-tabview-menu-header">
                            <i className="pi pi-users" aria-hidden />
                            Presenças
                        </span>
                    }
                >
                    <PresencaPanel
                        sessaoId={sessao.id}
                        legislatureId={sessao.sessaoLegislativa?.legislatura?.id}
                        legislaturaNumero={sessao.sessaoLegislativa?.legislatura?.numero}
                    />
                </TabPanel>

                {mostrarTransmissao && (
                    <TabPanel
                        header={
                            <span className="sigl-tabview-menu-header">
                                <i className="pi pi-video" aria-hidden />
                                Transmissão
                                {transmitindo && (
                                    <span className="tab-ao-vivo-dot" aria-label="ao vivo" />
                                )}
                            </span>
                        }
                    >
                        <TransmissaoPanel sessao={sessao} userName={userName} />
                    </TabPanel>
                )}
            </TabView>
        </div>
    );
}
