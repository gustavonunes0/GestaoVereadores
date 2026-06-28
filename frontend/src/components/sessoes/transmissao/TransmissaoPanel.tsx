import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioChannel, JitsiTokenData, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import { AudioMixer } from './AudioMixer';
import { CameraSelector } from './CameraSelector';
import { StatusConexaoJitsi } from './StatusConexaoJitsi';
import { TransmissaoVideoTab } from './TransmissaoVideoTab';
import { TransmissaoStreamTab } from './TransmissaoStreamTab';
import { TransmissaoFullscreenOverlay } from './TransmissaoFullscreenOverlay';

type TransmissaoTab = 'video' | 'audio' | 'stream';

const CANAIS_PADRAO: AudioChannel[] = [
    { id: 'mic', label: 'Microfone', volume: 85, muted: false },
    { id: 'camera1', label: 'Câmera 1', volume: 70, muted: false },
    { id: 'camera2', label: 'Câmera 2', volume: 60, muted: false },
    { id: 'libras', label: 'Libras', volume: 80, muted: true, isOptional: true },
    { id: 'master', label: 'Volume geral', volume: 100, muted: false },
];

const TABS: { id: TransmissaoTab; label: string; icon: string }[] = [
    { id: 'video', label: 'Câmeras', icon: 'pi pi-desktop' },
    { id: 'audio', label: 'Áudio', icon: 'pi pi-chart-line' },
    { id: 'stream', label: 'Transmissão', icon: 'pi pi-youtube' },
];

interface Props {
    sessao: SessaoPlenariaDetalhe;
    userName: string;
}

export function TransmissaoPanel({ sessao, userName }: Props) {
    const { showToast } = useAppToast();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fsOverlayRef = useRef<HTMLDivElement>(null);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const externalApiRef = useRef<unknown>(null);

    const [tab, setTab] = useState<TransmissaoTab>('video');
    const [cameraAtiva, setCameraAtiva] = useState('camera1');
    const [librasConectado, setLibrasConectado] = useState(false);
    const [librasParticipantId, setLibrasParticipantId] = useState<string | null>(null);
    const [modoTelaCheia, setModoTelaCheia] = useState(false);
    const [transmitindo, setTransmitindo] = useState(false);
    const [iniciandoJitsi, setIniciandoJitsi] = useState(false);
    const [jitsiConectado, setJitsiConectado] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [participantes, setParticipantes] = useState<{ id: string; nome: string }[]>([]);
    const [jitsiData, setJitsiData] = useState<JitsiTokenData | null>(null);
    const [duracao, setDuracao] = useState(0);
    const [linkYoutube, setLinkYoutube] = useState(sessao.linkYoutube ?? '');
    const [canais, setCanais] = useState<AudioChannel[]>(CANAIS_PADRAO);
    const [audioLevels] = useState<Record<string, number>>({});

    const roomName = jitsiData?.roomName ?? `sessao-${sessao.id.slice(0, 8)}`;

    useEffect(() => () => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (!modoTelaCheia) return;
        document.body.classList.add('transmissao-fs-active');
        return () => document.body.classList.remove('transmissao-fs-active');
    }, [modoTelaCheia]);

    useEffect(() => {
        if (!modoTelaCheia) return;

        const frame = requestAnimationFrame(() => {
            const el = fsOverlayRef.current;
            if (el && !document.fullscreenElement) {
                void el.requestFullscreen?.().catch(() => {
                    /* fallback: overlay fixo via CSS */
                });
            }
        });

        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setModoTelaCheia(false);
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [modoTelaCheia]);

    useEffect(() => {
        if (!modoTelaCheia) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !document.fullscreenElement) {
                setModoTelaCheia(false);
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [modoTelaCheia]);

    const handleApiReady = useCallback((api: unknown) => {
        externalApiRef.current = api;
        setJitsiConectado(true);

        const jitsiApi = api as {
            addListener?: (event: string, cb: (...args: unknown[]) => void) => void;
            getParticipantsInfo?: () => { participantId: string; displayName?: string }[];
        };

        const syncParticipants = () => {
            const participants = jitsiApi.getParticipantsInfo?.() ?? [];
            setParticipantCount(participants.length + 1);
            setParticipantes(
                participants.map((p) => ({
                    id: p.participantId,
                    nome: p.displayName?.trim() || 'Participante',
                })),
            );
            const libras = participants.find((p) =>
                /libras|intérprete|interprete/i.test(p.displayName ?? ''),
            );
            if (libras) {
                setLibrasConectado(true);
                setLibrasParticipantId(libras.participantId);
            } else {
                setLibrasConectado(false);
                setLibrasParticipantId(null);
            }
        };

        jitsiApi.addListener?.('participantJoined', syncParticipants);
        jitsiApi.addListener?.('participantLeft', syncParticipants);
        jitsiApi.addListener?.('displayNameChange', syncParticipants);
        syncParticipants();
    }, []);

    const handleSelectCamera = useCallback((id: string) => {
        if (id === 'libras' && !librasConectado) {
            showToast('warn', 'Intérprete não disponível', 'Intérprete de Libras não está na sala');
            return;
        }
        setCameraAtiva(id);
    }, [librasConectado, showToast]);

    const handleToggleFullscreen = useCallback(() => {
        if (modoTelaCheia) {
            if (document.fullscreenElement) {
                void document.exitFullscreen();
            } else {
                setModoTelaCheia(false);
            }
            return;
        }
        setModoTelaCheia(true);
    }, [modoTelaCheia]);

    const handleExitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            setModoTelaCheia(false);
        }
    }, []);

    const pararTransmissao = useCallback(() => {
        setTransmitindo(false);
        setJitsiData(null);
        setJitsiConectado(false);
        setParticipantCount(0);
        setParticipantes([]);
        setLibrasConectado(false);
        setLibrasParticipantId(null);
        externalApiRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const handleToggleStream = useCallback(async () => {
        if (transmitindo) {
            pararTransmissao();
            return;
        }

        setIniciandoJitsi(true);
        try {
            const tokenData = await sessoesApi.getJitsiToken(sessao.id);
            setJitsiData(tokenData);
            setTransmitindo(true);
            setDuracao(0);
            timerRef.current = setInterval(() => setDuracao((d) => d + 1), 1000);
            setTab('video');
            showToast('success', 'Sala iniciada', 'Conectando ao Jitsi…');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Não foi possível iniciar a transmissão';
            showToast('error', 'Erro ao iniciar', msg);
        } finally {
            setIniciandoJitsi(false);
        }
    }, [pararTransmissao, sessao.id, showToast, transmitindo]);

    function handleVolumeChange(id: string, valor: number) {
        setCanais((prev) => prev.map((c) => (c.id === id ? { ...c, volume: valor } : c)));
    }

    function handleMute(id: string) {
        if (id === 'libras' && !librasConectado) return;
        setCanais((prev) => prev.map((c) => (c.id === id ? { ...c, muted: !c.muted } : c)));
    }

    return (
        <div className="transmissao-panel-wrap">
            <div className="transmissao-panel">
                <StatusConexaoJitsi
                    conectado={jitsiConectado}
                    transmitindo={transmitindo}
                    roomName={roomName}
                    participantCount={participantCount}
                />

                <div className="transmissao-tab-row" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === t.id}
                            className={`transmissao-stab${tab === t.id ? ' active' : ''}`}
                            onClick={() => setTab(t.id)}
                        >
                            <i className={t.icon} aria-hidden />
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'video' && (
                    jitsiData ? (
                        <div className="transmissao-section">
                            <div className="transmissao-sec-title">
                                <i className="pi pi-th-large" aria-hidden />
                                Visualização ao vivo
                            </div>
                            <CameraSelector
                                jitsiData={jitsiData}
                                userName={userName}
                                externalApiRef={externalApiRef}
                                jitsiContainerRef={jitsiContainerRef}
                                cameraAtiva={cameraAtiva}
                                setCameraAtiva={setCameraAtiva}
                                participantes={participantes}
                                librasParticipantId={librasParticipantId}
                                handleApiReady={handleApiReady}
                            />
                        </div>
                    ) : (
                        <TransmissaoVideoTab
                            cameraAtiva={cameraAtiva}
                            librasConectado={librasConectado}
                            modoTelaCheia={modoTelaCheia}
                            previewOpaco={modoTelaCheia}
                            aguardandoJitsi
                            onSelectCamera={handleSelectCamera}
                            onToggleFullscreen={handleToggleFullscreen}
                        />
                    )
                )}

                {tab === 'audio' && (
                    <div className="transmissao-section">
                        <div className="transmissao-sec-title">
                            <i className="pi pi-sliders-h" aria-hidden />
                            Mixer de áudio
                        </div>
                        <AudioMixer
                            canais={canais}
                            librasConectado={librasConectado}
                            audioLevels={audioLevels}
                            onVolumeChange={handleVolumeChange}
                            onMute={handleMute}
                        />
                    </div>
                )}

                {tab === 'stream' && (
                    <TransmissaoStreamTab
                        sessaoId={sessao.id}
                        linkYoutube={linkYoutube}
                        transmitindo={transmitindo}
                        iniciando={iniciandoJitsi}
                        duracao={duracao}
                        modoTelaCheia={modoTelaCheia}
                        onLinkChange={setLinkYoutube}
                        onToggleStream={handleToggleStream}
                        onToggleFullscreen={handleToggleFullscreen}
                    />
                )}
            </div>

            {modoTelaCheia && !jitsiData && (
                <TransmissaoFullscreenOverlay
                    ref={fsOverlayRef}
                    roomName={roomName}
                    cameraAtiva={cameraAtiva}
                    librasConectado={librasConectado}
                    transmitindo={transmitindo}
                    onExit={handleExitFullscreen}
                />
            )}
        </div>
    );
}
