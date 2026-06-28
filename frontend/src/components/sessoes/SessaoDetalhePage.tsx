import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAuth } from '../../contexts/AuthContext';
import { useAppToast } from '../../hooks/useAppToast';
import { usePermissions } from '../../hooks/usePermissions';
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
import { RegistrarVotoDialog } from './RegistrarVotoDialog';
import { FecharVotacaoDialog } from './pauta/FecharVotacaoDialog';

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
    const { showApiError, showToast } = useAppToast();
    const { canVotar, canManageSessao, parliamentarianId } = usePermissions();

    const [sessao, setSessao] = useState<SessaoPlenariaDetalhe | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogVoto, setDialogVoto] = useState(false);
    const [dialogFecharVotacao, setDialogFecharVotacao] = useState(false);
    const ultimaVotacaoNotificada = useRef<string | null>(null);

    const {
        faseAtual,
        votacaoAberta,
        placar,
        wsConectado,
        syncVotacaoFromPauta,
    } = useSessaoRealtime(id ?? '');

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

    useEffect(() => {
        if (!votacaoAberta || !canVotar) return;
        if (ultimaVotacaoNotificada.current === votacaoAberta.votacaoId) return;
        ultimaVotacaoNotificada.current = votacaoAberta.votacaoId;

        showToast('info', 'Votação aberta', votacaoAberta.titulo);
        if (votacaoAberta.aceitaVotoIndividual) {
            setDialogVoto(true);
        }
    }, [votacaoAberta, canVotar, showToast]);

    useEffect(() => {
        if (!votacaoAberta) {
            ultimaVotacaoNotificada.current = null;
            setDialogVoto(false);
        }
    }, [votacaoAberta]);

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
    const placarAtual =
        placar?.votacaoId === votacaoAberta?.votacaoId ? placar : null;
    const podeRegistrarVoto =
        canVotar &&
        !!parliamentarianId &&
        !!votacaoAberta?.aceitaVotoIndividual &&
        sessao.statusSessao === 'ABERTA';
    const podeFecharVotacao =
        canManageSessao && !!votacaoAberta && sessao.statusSessao === 'ABERTA';

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
                    <div className="sessao-votacao-banner__info">
                        <span>
                            <strong>Votação em andamento:</strong> {votacaoAberta.titulo}
                        </span>
                        {votacaoAberta.ementa && (
                            <span className="sessao-votacao-banner__ementa">
                                {votacaoAberta.ementa}
                            </span>
                        )}
                        <span>
                            SIM:{' '}
                            <strong className="text-green-600">
                                {placarAtual?.votosSim ?? votacaoAberta.votosSim}
                            </strong>
                            {' | '}
                            NÃO:{' '}
                            <strong className="text-red-600">
                                {placarAtual?.votosNao ?? votacaoAberta.votosNao}
                            </strong>
                            {' | '}
                            ABSTENÇÃO:{' '}
                            <strong>
                                {placarAtual?.abstencoes ?? votacaoAberta.abstencoes}
                            </strong>
                        </span>
                    </div>
                    <div className="sessao-votacao-banner__acoes flex gap-2">
                        {podeFecharVotacao && (
                            <Button
                                label="Fechar votação"
                                icon="pi pi-stop-circle"
                                size="small"
                                severity="danger"
                                outlined
                                onClick={() => setDialogFecharVotacao(true)}
                            />
                        )}
                        {podeRegistrarVoto && (
                            <Button
                                label="Registrar meu voto"
                                icon="pi pi-check-circle"
                                size="small"
                                onClick={() => setDialogVoto(true)}
                            />
                        )}
                    </div>
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
                    <PautaManager
                        sessao={sessao}
                        votacaoSyncKey={votacaoAberta?.votacaoId ?? null}
                        onVotacaoFechada={() => void syncVotacaoFromPauta()}
                    />
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

            {dialogVoto && votacaoAberta && parliamentarianId && (
                <RegistrarVotoDialog
                    sessaoId={sessao.id}
                    pautaItemId={votacaoAberta.pautaItemId}
                    parlamentarId={parliamentarianId}
                    titulo={votacaoAberta.titulo}
                    onClose={() => setDialogVoto(false)}
                    onSaved={() => void syncVotacaoFromPauta()}
                />
            )}

            {dialogFecharVotacao && votacaoAberta && (
                <FecharVotacaoDialog
                    sessaoId={sessao.id}
                    item={{ id: votacaoAberta.pautaItemId }}
                    placar={placarAtual}
                    titulo={votacaoAberta.titulo}
                    onClose={() => setDialogFecharVotacao(false)}
                    onFechada={() => void syncVotacaoFromPauta()}
                />
            )}
        </div>
    );
}
