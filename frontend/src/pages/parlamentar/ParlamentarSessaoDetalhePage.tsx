import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { ROUTES } from '../../app/navigation';
import { MinhaPresencaPanel } from '../../components/parlamentar/sessoes/MinhaPresencaPanel';
import { ParlamentarJitsiPanel } from '../../components/parlamentar/sessoes/ParlamentarJitsiPanel';
import { ParlamentarPautaPanel } from '../../components/parlamentar/sessoes/ParlamentarPautaPanel';
import { ParlamentarVotacaoPanel } from '../../components/parlamentar/sessoes/ParlamentarVotacaoPanel';
import { RegistrarVotoDialog } from '../../components/sessoes/RegistrarVotoDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useAppToast } from '../../hooks/useAppToast';
import { useMinhaPresenca } from '../../hooks/useMinhaPresenca';
import { usePermissions } from '../../hooks/usePermissions';
import { useSessaoRealtime } from '../../hooks/useSessaoRealtime';
import {
    sessaoDetalheLabel,
    sessaoDetalheSubtitulo,
    type SessaoPlenariaDetalhe,
    type StatusSessao,
} from '../../types/sessoes';

const STATUS_BADGE: Record<
    StatusSessao,
    { className: string; icon: string; label: string }
> = {
    AGENDADA: { className: 'badge--info', icon: 'pi pi-calendar', label: 'Agendada' },
    ABERTA: { className: 'badge--success', icon: 'pi pi-circle-fill', label: 'Aberta' },
    SUSPENSA: { className: 'badge--warning', icon: 'pi pi-pause', label: 'Suspensa' },
    ENCERRADA: { className: 'badge--neutral', icon: 'pi pi-check-circle', label: 'Encerrada' },
    CANCELADA: { className: 'badge--danger', icon: 'pi pi-times-circle', label: 'Cancelada' },
};

export function ParlamentarSessaoDetalhePage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useAppToast();
    const { parliamentarianId } = usePermissions();
    const [sessao, setSessao] = useState<SessaoPlenariaDetalhe | null>(null);
    const [loading, setLoading] = useState(true);
    const [dialogVoto, setDialogVoto] = useState(false);
    const ultimaVotacaoNotificada = useRef<string | null>(null);

    const {
        hasConfirmed,
        loading: loadingPresenca,
        confirming,
        confirmPresence,
    } = useMinhaPresenca(id);

    const { votacaoAberta, wsConectado, syncVotacaoFromPauta } = useSessaoRealtime(id);

    const buscar = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await sessoesApi.getDetalhe(id);
            setSessao(data);
        } catch {
            setSessao(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    useEffect(() => {
        if (!id) return;
        const interval = window.setInterval(() => {
            void syncVotacaoFromPauta();
        }, 4000);
        return () => window.clearInterval(interval);
    }, [id, syncVotacaoFromPauta]);

    useEffect(() => {
        if (!votacaoAberta || !hasConfirmed) return;
        if (ultimaVotacaoNotificada.current === votacaoAberta.votacaoId) return;
        ultimaVotacaoNotificada.current = votacaoAberta.votacaoId;

        showToast('info', 'Votação aberta', votacaoAberta.titulo);
        if (votacaoAberta.aceitaVotoIndividual) {
            setDialogVoto(true);
        }
    }, [votacaoAberta, hasConfirmed, showToast]);

    useEffect(() => {
        if (!votacaoAberta) {
            ultimaVotacaoNotificada.current = null;
            setDialogVoto(false);
        }
    }, [votacaoAberta]);

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
                <Button
                    label="Voltar"
                    text
                    onClick={() => navigate(ROUTES.parlamentar.sessoes)}
                />
            </div>
        );
    }

    const statusCfg = STATUS_BADGE[sessao.statusSessao];
    const mostrarTransmissao = ['ABERTA', 'SUSPENSA', 'AGENDADA'].includes(sessao.statusSessao);
    const userName = user
        ? ('displayName' in user
              ? String(user.displayName)
              : (user as { nome?: string; parliamentaryName?: string }).parliamentaryName ??
                (user as { nome?: string }).nome ??
                'Parlamentar')
        : 'Parlamentar';

    return (
        <div className="parl-sessao-detalhe-page">
            <div className="parl-sessao-detalhe-topbar">
                <Button
                    label="Sessões"
                    icon="pi pi-arrow-left"
                    size="small"
                    outlined
                    severity="secondary"
                    onClick={() => navigate(ROUTES.parlamentar.sessoes)}
                />

                <div className="parl-sessao-detalhe-topbar__info">
                    <h2 className="m-0">{sessaoDetalheLabel(sessao)}</h2>
                    <p className="m-0 text-color-secondary">{sessaoDetalheSubtitulo(sessao)}</p>
                </div>

                <div className="parl-sessao-detalhe-topbar__badges">
                    {statusCfg ? (
                        <span className={`badge ${statusCfg.className}`}>
                            <i className={statusCfg.icon} aria-hidden />
                            {statusCfg.label}
                        </span>
                    ) : null}
                    {wsConectado ? (
                        <span className="ws-pill">
                            <i className="pi pi-wifi" aria-hidden />
                            Ao vivo
                        </span>
                    ) : null}
                </div>
            </div>

            {votacaoAberta ? (
                <div className="sessao-votacao-banner">
                    <strong>Votação em andamento:</strong> {votacaoAberta.titulo}
                </div>
            ) : null}

            {mostrarTransmissao ? (
                <ParlamentarJitsiPanel sessao={sessao} userName={userName} />
            ) : null}

            <div className="parl-sessao-detalhe-grid">
                <ParlamentarPautaPanel sessaoId={id} />
                <MinhaPresencaPanel
                    hasConfirmed={hasConfirmed}
                    loading={loadingPresenca}
                    confirming={confirming}
                    onConfirm={() => void confirmPresence()}
                />
                <ParlamentarVotacaoPanel
                    sessaoId={id}
                    hasConfirmed={hasConfirmed}
                    votacaoAberta={votacaoAberta}
                    statusSessao={sessao.statusSessao}
                />
            </div>

            {dialogVoto &&
            votacaoAberta &&
            parliamentarianId &&
            hasConfirmed ? (
                <RegistrarVotoDialog
                    sessaoId={id}
                    pautaItemId={votacaoAberta.pautaItemId}
                    parlamentarId={parliamentarianId}
                    titulo={votacaoAberta.titulo}
                    onClose={() => setDialogVoto(false)}
                    onSaved={() => void syncVotacaoFromPauta()}
                />
            ) : null}
        </div>
    );
}
