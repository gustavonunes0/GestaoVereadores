import { useCallback, useEffect, useRef, useState } from 'react';
import type { JitsiTokenData, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { sessaoPermiteTransmissao } from '../../../types/sessoes';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { MotivoEncerrarTransmissao } from '../../../hooks/useSessaoRealtime';
import { ConvidarParticipantesJitsi } from './ConvidarParticipantesJitsi';
import { JitsiMeetingEmbed } from './JitsiMeetingEmbed';
import { ObsVirtualDevicesGuide } from './ObsVirtualDevicesGuide';
import { StatusConexaoJitsi } from './StatusConexaoJitsi';

interface Props {
    sessao: SessaoPlenariaDetalhe;
    userName: string;
    /** WS: sessão cancelada ou suspensa — fecha a sala na hora. */
    encerrarTransmissao?: MotivoEncerrarTransmissao | null;
    onEncerrarTransmissaoConsumido?: () => void;
    onTransmitindoChange?: (aoVivo: boolean) => void;
}

function formatarDuracao(s: number): string {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
}

/**
 * Transmissão OBS → Jitsi.
 * Pode iniciar com sessão AGENDADA ou ABERTA.
 * Cancelamento ou suspensão encerra a sala automaticamente.
 */
export function TransmissaoPanel({
    sessao,
    userName,
    encerrarTransmissao = null,
    onEncerrarTransmissaoConsumido,
    onTransmitindoChange,
}: Props) {
    const { showToast } = useAppToast();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const avisouEncerrarRef = useRef(false);

    const [transmitindo, setTransmitindo] = useState(false);
    const [iniciandoJitsi, setIniciandoJitsi] = useState(false);
    const [jitsiConectado, setJitsiConectado] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [jitsiData, setJitsiData] = useState<JitsiTokenData | null>(null);
    const [duracao, setDuracao] = useState(0);

    const roomName = jitsiData?.roomName ?? `sessao-${sessao.id.slice(0, 8)}`;
    const podeIniciar = sessaoPermiteTransmissao(sessao.statusSessao);

    useEffect(
        () => () => {
            if (timerRef.current) clearInterval(timerRef.current);
        },
        [],
    );

    useEffect(() => {
        onTransmitindoChange?.(transmitindo);
    }, [transmitindo, onTransmitindoChange]);

    const handleApiReady = useCallback((api: unknown) => {
        setJitsiConectado(true);

        const jitsiApi = api as {
            addListener?: (event: string, cb: (...args: unknown[]) => void) => void;
            getParticipantsInfo?: () => { participantId: string; displayName?: string }[];
        };

        const syncParticipants = () => {
            const participants = jitsiApi.getParticipantsInfo?.() ?? [];
            setParticipantCount(participants.length + 1);
        };

        jitsiApi.addListener?.('participantJoined', syncParticipants);
        jitsiApi.addListener?.('participantLeft', syncParticipants);
        jitsiApi.addListener?.('displayNameChange', syncParticipants);
        syncParticipants();
    }, []);

    const pararTransmissao = useCallback(() => {
        setTransmitindo(false);
        setJitsiData(null);
        setJitsiConectado(false);
        setParticipantCount(0);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        const motivoStatus =
            sessao.statusSessao === 'CANCELADA'
                ? ('cancelada' as const)
                : sessao.statusSessao === 'SUSPENSA'
                  ? ('suspensa' as const)
                  : null;
        const motivo = encerrarTransmissao ?? motivoStatus;
        if (!motivo) {
            avisouEncerrarRef.current = false;
            return;
        }
        if (!transmitindo && !jitsiData) {
            onEncerrarTransmissaoConsumido?.();
            return;
        }
        pararTransmissao();
        if (!avisouEncerrarRef.current) {
            avisouEncerrarRef.current = true;
            showToast(
                'warn',
                'Transmissão encerrada',
                motivo === 'cancelada'
                    ? 'A sessão foi cancelada — a sala Jitsi foi fechada.'
                    : 'A sessão foi suspensa — a sala Jitsi foi fechada.',
            );
        }
        onEncerrarTransmissaoConsumido?.();
    }, [
        encerrarTransmissao,
        jitsiData,
        onEncerrarTransmissaoConsumido,
        pararTransmissao,
        sessao.statusSessao,
        showToast,
        transmitindo,
    ]);

    const handleToggleStream = useCallback(async () => {
        if (transmitindo) {
            pararTransmissao();
            return;
        }

        if (!podeIniciar) {
            showToast(
                'warn',
                'Transmissão indisponível',
                'Só é possível transmitir com a sessão agendada ou aberta.',
            );
            return;
        }

        setIniciandoJitsi(true);
        try {
            const tokenData = await sessoesApi.getJitsiToken(sessao.id);
            setJitsiData(tokenData);
            setTransmitindo(true);
            setDuracao(0);
            timerRef.current = setInterval(() => setDuracao((d) => d + 1), 1000);
            showToast(
                'success',
                'Sala Jitsi aberta',
                sessao.statusSessao === 'AGENDADA'
                    ? 'Sessão ainda agendada — configure o OBS e selecione a Câmera Virtual no Jitsi.'
                    : 'Selecione OBS Virtual Camera e o cabo de áudio nos dispositivos do Jitsi.',
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Não foi possível iniciar a transmissão';
            showToast('error', 'Erro ao iniciar', msg);
        } finally {
            setIniciandoJitsi(false);
        }
    }, [pararTransmissao, podeIniciar, sessao.id, sessao.statusSessao, showToast, transmitindo]);

    return (
        <div className="transmissao-panel-wrap transmissao-panel-wrap--obs">
            <div className="transmissao-card transmissao-card--status">
                <StatusConexaoJitsi
                    conectado={jitsiConectado}
                    transmitindo={transmitindo}
                    roomName={roomName}
                    participantCount={participantCount}
                />
            </div>

            <div className="transmissao-layout transmissao-layout--obs">
                <div className="transmissao-card transmissao-layout__video">
                    <div className="transmissao-section">
                        <div className="transmissao-sec-title">
                            <i className="pi pi-desktop" aria-hidden />
                            Programa via OBS → Jitsi
                        </div>
                        <p className="transmissao-obs-lead m-0 text-color-secondary">
                            Pode abrir a sala com a sessão ainda <strong>agendada</strong>. Se a sessão
                            for <strong>suspensa</strong> ou <strong>cancelada</strong>, a transmissão
                            encerra automaticamente.
                        </p>

                        {jitsiData ? (
                            <>
                                <JitsiMeetingEmbed
                                    jitsiData={jitsiData}
                                    userName={userName}
                                    jitsiContainerRef={jitsiContainerRef}
                                    onApiReady={handleApiReady}
                                />
                                <ConvidarParticipantesJitsi jitsiData={jitsiData} />
                            </>
                        ) : (
                            <div className="transmissao-jitsi-mock transmissao-jitsi-mock--obs">
                                <div className="transmissao-jitsi-hint">
                                    <i className="pi pi-video" aria-hidden />
                                    <div>
                                        <strong>
                                            {sessao.statusSessao === 'SUSPENSA'
                                                ? 'Sessão suspensa — sala fechada'
                                                : 'Pronto para receber o OBS'}
                                        </strong>
                                        <p className="m-0 mt-1 text-sm text-color-secondary">
                                            {sessao.statusSessao === 'SUSPENSA'
                                                ? 'Retome a sessão para poder abrir a transmissão novamente.'
                                                : 'Inicie a Câmera Virtual no OBS, abra a sala e selecione OBS Virtual Camera + cabo virtual no Jitsi (Chrome, Edge ou Firefox).'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="transmissao-layout__side">
                    <div className="transmissao-card">
                        <div className="transmissao-section">
                            <div className="transmissao-sec-title">
                                <i className="pi pi-wifi" aria-hidden />
                                Sala Jitsi
                            </div>
                            <div className="flex align-items-center gap-2 flex-wrap mb-2">
                                <button
                                    type="button"
                                    className={`transmissao-btn ${transmitindo ? 'transmissao-btn-stop' : 'transmissao-btn-danger'}`}
                                    onClick={() => void handleToggleStream()}
                                    disabled={iniciandoJitsi || (!transmitindo && !podeIniciar)}
                                >
                                    <i
                                        className={
                                            iniciandoJitsi
                                                ? 'pi pi-spin pi-spinner'
                                                : transmitindo
                                                  ? 'pi pi-stop'
                                                  : 'pi pi-play'
                                        }
                                        aria-hidden
                                    />
                                    {iniciandoJitsi
                                        ? 'Conectando…'
                                        : transmitindo
                                          ? 'Encerrar sala'
                                          : 'Abrir sala Jitsi'}
                                </button>
                                {transmitindo && (
                                    <>
                                        <span className="transmissao-badge transmissao-badge-live">
                                            <span className="transmissao-dot transmissao-dot-red" />
                                            AO VIVO
                                        </span>
                                        <span className="text-xs text-color-secondary">
                                            {formatarDuracao(duracao)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="m-0 text-xs text-color-secondary">
                                {sessao.statusSessao === 'AGENDADA'
                                    ? 'Sessão agendada — transmissão liberada antes da abertura.'
                                    : sessao.statusSessao === 'SUSPENSA'
                                      ? 'Sessão suspensa — transmissão encerrada até a retomada.'
                                      : 'A transmissão pública (YouTube, etc.) sai do OBS — não deste painel.'}
                            </p>
                        </div>
                    </div>

                    <div className="transmissao-card">
                        <ObsVirtualDevicesGuide defaultExpanded={!transmitindo} />
                    </div>
                </div>
            </div>
        </div>
    );
}
