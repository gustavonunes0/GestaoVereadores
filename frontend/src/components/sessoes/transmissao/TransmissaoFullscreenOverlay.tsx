import { forwardRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
    roomName: string;
    cameraAtiva: string;
    librasConectado: boolean;
    transmitindo?: boolean;
    onExit: () => void;
}

const LABELS: Record<string, string> = {
    cam1: 'Câmera 1 — Leitor',
    cam2: 'Câmera 2 — Plenário',
    lib: 'Intérprete Libras',
    screen: 'Compartilhar tela',
};

function sideIds(ativa: string): string[] {
    if (ativa === 'cam1') return ['cam2', 'lib'];
    if (ativa === 'cam2') return ['cam1', 'lib'];
    if (ativa === 'lib') return ['cam1', 'cam2'];
    return ['cam1', 'cam2'];
}

const SIDE_META: Record<string, { label: string; icon: string; libras?: boolean }> = {
    cam1: { label: 'Câmera 1 — Leitor', icon: 'pi pi-desktop' },
    cam2: { label: 'Câmera 2 — Plenário', icon: 'pi pi-desktop' },
    lib: { label: 'Intérprete Libras', icon: 'pi pi-sign-language', libras: true },
};

export const TransmissaoFullscreenOverlay = forwardRef<HTMLDivElement, Props>(
    function TransmissaoFullscreenOverlay(
        { roomName, cameraAtiva, librasConectado, transmitindo, onExit },
        ref,
    ) {
        const mainLabel = LABELS[cameraAtiva] ?? LABELS.cam1;
        const isLibMain = cameraAtiva === 'lib';
        const isScreen = cameraAtiva === 'screen';

        return createPortal(
            <div
                ref={ref}
                className="transmissao-fs-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Sala de transmissão em tela cheia"
            >
                <div className="transmissao-fs-shell">
                    <div className="transmissao-fs-header">
                        <div className="flex align-items-center gap-2">
                            {transmitindo && <span className="transmissao-dot transmissao-dot-red" />}
                            <span className="transmissao-fs-room">
                                {roomName}
                                {transmitindo ? ' — AO VIVO' : ''}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="transmissao-btn transmissao-btn-ghost transmissao-fs-exit"
                            onClick={onExit}
                        >
                            <i className="pi pi-compress" aria-hidden />
                            Sair da tela cheia
                        </button>
                    </div>

                    <div className="transmissao-fs-stage">
                        <div
                            className={`transmissao-cam-cell transmissao-cam-main transmissao-fs-main ${
                                isLibMain
                                    ? 'transmissao-cam-highlight-lib'
                                    : 'transmissao-cam-highlight'
                            }`}
                        >
                            <i
                                className={isScreen ? 'pi pi-window-maximize' : 'pi pi-desktop'}
                                style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'rgba(255,255,255,.15)' }}
                                aria-hidden
                            />
                            <span className="transmissao-fs-main-label">{mainLabel}</span>
                            <div className={isLibMain ? 'transmissao-cam-optional-badge' : 'transmissao-cam-active-badge'}>
                                {isLibMain ? 'LIBRAS' : 'DESTAQUE'}
                            </div>
                        </div>

                        <div className="transmissao-fs-side">
                            {sideIds(cameraAtiva).map((id) => {
                                const meta = SIDE_META[id];
                                const isLib = meta.libras;
                                return (
                                    <div
                                        key={id}
                                        className={`transmissao-cam-cell transmissao-fs-side-cell ${
                                            isLib && librasConectado ? 'transmissao-cam-highlight-lib' : ''
                                        }`}
                                    >
                                        <i className={meta.icon} style={{ fontSize: 22, color: 'rgba(255,255,255,.12)' }} aria-hidden />
                                        <span className="transmissao-fs-side-label">{meta.label}</span>
                                        {isLib && librasConectado && (
                                            <div className="transmissao-cam-optional-badge">LIBRAS</div>
                                        )}
                                        {isLib && !librasConectado && (
                                            <div className="transmissao-cam-disconnected-overlay">
                                                <span>Aguardando intérprete</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="transmissao-jitsi-toolbar transmissao-fs-toolbar">
                        <button type="button" className="transmissao-jt-btn" aria-label="Microfone">
                            <i className="pi pi-microphone" />
                        </button>
                        <button type="button" className="transmissao-jt-btn" aria-label="Câmera">
                            <i className="pi pi-video" />
                        </button>
                        <button type="button" className="transmissao-jt-btn" aria-label="Compartilhar tela">
                            <i className="pi pi-desktop" />
                        </button>
                        <button type="button" className="transmissao-jt-btn transmissao-jt-btn-red" aria-label="Sair">
                            <i className="pi pi-phone" />
                        </button>
                        <button
                            type="button"
                            className="transmissao-jt-btn"
                            aria-label="Sair da tela cheia"
                            onClick={onExit}
                        >
                            <i className="pi pi-compress" />
                        </button>
                    </div>
                </div>
            </div>,
            document.body,
        );
    },
);
