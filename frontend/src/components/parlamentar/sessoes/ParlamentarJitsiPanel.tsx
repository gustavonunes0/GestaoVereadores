import { useCallback, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { JitsiTokenData, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { JitsiMeetingEmbed } from '../../sessoes/transmissao/JitsiMeetingEmbed';
import { StatusConexaoJitsi } from '../../sessoes/transmissao/StatusConexaoJitsi';

interface Props {
    sessao: SessaoPlenariaDetalhe;
    userName: string;
}

export function ParlamentarJitsiPanel({ sessao, userName }: Props) {
    const { showToast } = useAppToast();
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const externalApiRef = useRef<unknown>(null);

    const [conectando, setConectando] = useState(false);
    const [conectado, setConectado] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [jitsiData, setJitsiData] = useState<JitsiTokenData | null>(null);

    const roomName = jitsiData?.roomName ?? `sessao-${sessao.id.slice(0, 8)}`;

    const sairDaSala = useCallback(() => {
        setJitsiData(null);
        setConectado(false);
        setParticipantCount(0);
        externalApiRef.current = null;
    }, []);

    const entrarNaSala = useCallback(async () => {
        if (jitsiData) {
            sairDaSala();
            return;
        }

        setConectando(true);
        try {
            const tokenData = await sessoesApi.getJitsiToken(sessao.id);
            setJitsiData(tokenData);
            showToast('success', 'Sala iniciada', 'Conectando ao Jitsi…');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Não foi possível entrar na videoconferência';
            showToast('error', 'Erro ao conectar', msg);
        } finally {
            setConectando(false);
        }
    }, [jitsiData, sairDaSala, sessao.id, showToast]);

    const handleApiReady = useCallback((api: unknown) => {
        externalApiRef.current = api;
        setConectado(true);

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

    return (
        <section className="parl-sessao-panel parl-sessao-jitsi">
            <div className="parl-sessao-jitsi__header">
                <div>
                    <h3 className="parl-sessao-panel__title m-0">Videoconferência</h3>
                    <p className="parl-sessao-panel__hint m-0 mt-1">
                        Participe da sessão plenária por vídeo e áudio.
                    </p>
                </div>
                <Button
                    label={jitsiData ? 'Sair da videoconferência' : 'Entrar na videoconferência'}
                    icon={jitsiData ? 'pi pi-sign-out' : 'pi pi-video'}
                    severity={jitsiData ? 'secondary' : undefined}
                    loading={conectando}
                    onClick={() => void entrarNaSala()}
                />
            </div>

            <div className="transmissao-card transmissao-card--status mt-3">
                <StatusConexaoJitsi
                    conectado={conectado}
                    transmitindo={!!jitsiData}
                    roomName={roomName}
                    participantCount={participantCount}
                />
            </div>

            {jitsiData ? (
                <div className="transmissao-section mt-3">
                    <JitsiMeetingEmbed
                        jitsiData={jitsiData}
                        userName={userName}
                        jitsiContainerRef={jitsiContainerRef}
                        onApiReady={handleApiReady}
                    />
                </div>
            ) : (
                <div className="transmissao-jitsi-mock mt-3">
                    <div className="transmissao-jitsi-hint">
                        <i className="pi pi-video" aria-hidden />
                        <div>
                            <strong>Videoconferência da sessão</strong>
                            <p className="m-0 mt-1 text-sm text-color-secondary">
                                Clique em <strong>Entrar na videoconferência</strong> para abrir a sala Jitsi
                                e participar com câmera e microfone.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
