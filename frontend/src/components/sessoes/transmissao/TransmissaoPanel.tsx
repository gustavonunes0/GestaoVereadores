import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioChannel, SessaoPlenariaDetalhe } from '../../../types/sessoes';
import { useAppToast } from '../../../hooks/useAppToast';
import { AudioMixer } from './AudioMixer';
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

export function TransmissaoPanel({ sessao }: Props) {
    const { showToast } = useAppToast();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fsOverlayRef = useRef<HTMLDivElement>(null);

    const roomName = `sessao-${sessao.id.slice(0, 8)}`;

    const [tab, setTab] = useState<TransmissaoTab>('video');
    const [cameraAtiva, setCameraAtiva] = useState('cam1');
    const [librasConectado] = useState(false);
    const [modoTelaCheia, setModoTelaCheia] = useState(false);
    const [transmitindo, setTransmitindo] = useState(false);
    const [duracao, setDuracao] = useState(0);
    const [linkYoutube, setLinkYoutube] = useState(sessao.linkYoutube ?? '');
    const [canais, setCanais] = useState<AudioChannel[]>(CANAIS_PADRAO);
    const [audioLevels] = useState<Record<string, number>>({});

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

    const handleSelectCamera = useCallback((id: string) => {
        if (id === 'lib' && !librasConectado) {
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

    const handleToggleStream = useCallback(() => {
        if (transmitindo) {
            setTransmitindo(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }
        if (!linkYoutube.trim()) return;
        setTransmitindo(true);
        setDuracao(0);
        timerRef.current = setInterval(() => setDuracao((d) => d + 1), 1000);
    }, [linkYoutube, transmitindo]);

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
                    conectado
                    transmitindo={transmitindo}
                    roomName={roomName}
                    participantCount={4}
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
                    <TransmissaoVideoTab
                        cameraAtiva={cameraAtiva}
                        librasConectado={librasConectado}
                        modoTelaCheia={modoTelaCheia}
                        previewOpaco={modoTelaCheia}
                        onSelectCamera={handleSelectCamera}
                        onToggleFullscreen={handleToggleFullscreen}
                    />
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
                        duracao={duracao}
                        modoTelaCheia={modoTelaCheia}
                        onLinkChange={setLinkYoutube}
                        onToggleStream={handleToggleStream}
                        onToggleFullscreen={handleToggleFullscreen}
                    />
                )}
            </div>

            {modoTelaCheia && (
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
