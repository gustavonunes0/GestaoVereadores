interface CameraSource {
    id: string;
    label: string;
    icon: string;
    libras?: boolean;
}

const CAMERAS: CameraSource[] = [
    { id: 'cam1', label: 'Câmera 1 — Leitor', icon: 'pi pi-desktop' },
    { id: 'cam2', label: 'Câmera 2 — Plenário', icon: 'pi pi-desktop' },
    { id: 'lib', label: 'Intérprete Libras', icon: 'pi pi-sign-language', libras: true },
    { id: 'screen', label: 'Compartilhar tela', icon: 'pi pi-window-maximize' },
];

function sideCameras(ativa: string): CameraSource[] {
    if (ativa === 'cam1') return [CAMERAS[1], CAMERAS[2]];
    if (ativa === 'cam2') return [CAMERAS[0], CAMERAS[2]];
    if (ativa === 'lib') return [CAMERAS[0], CAMERAS[1]];
    return [CAMERAS[0], CAMERAS[1]];
}

interface Props {
    cameraAtiva: string;
    librasConectado: boolean;
    modoTelaCheia: boolean;
    previewOpaco?: boolean;
    onSelectCamera: (id: string) => void;
    onToggleFullscreen: () => void;
}

function CamCell({
    cam,
    highlight,
    librasConectado,
    compact,
}: {
    cam: CameraSource;
    highlight?: boolean;
    librasConectado?: boolean;
    compact?: boolean;
}) {
    const isLib = cam.libras;
    const highlightClass = highlight
        ? isLib
            ? 'transmissao-cam-highlight-lib'
            : 'transmissao-cam-highlight'
        : isLib && librasConectado
          ? 'transmissao-cam-highlight-lib'
          : '';

    return (
        <div className={`transmissao-cam-cell ${compact ? 'flex-1' : 'transmissao-cam-main'} ${highlightClass}`}>
            <i
                className={`${cam.icon} ${compact ? '' : 'transmissao-cam-icon'}`}
                style={compact ? { fontSize: 22, color: 'rgba(255,255,255,.1)' } : undefined}
                aria-hidden
            />
            <span
                className={compact ? undefined : 'transmissao-cam-label'}
                style={compact ? { fontSize: 10, color: 'rgba(255,255,255,.3)' } : undefined}
            >
                {cam.label}
            </span>
            {highlight && (
                <div className={isLib ? 'transmissao-cam-optional-badge' : 'transmissao-cam-active-badge'}>
                    {isLib ? 'LIBRAS' : 'DESTAQUE'}
                </div>
            )}
            {isLib && !librasConectado && !highlight && (
                <div className="transmissao-cam-disconnected-overlay">
                    <span>Aguardando intérprete</span>
                </div>
            )}
            {isLib && librasConectado && !highlight && (
                <div className="transmissao-cam-optional-badge">LIBRAS</div>
            )}
        </div>
    );
}

export function TransmissaoVideoTab({
    cameraAtiva,
    librasConectado,
    modoTelaCheia,
    previewOpaco,
    onSelectCamera,
    onToggleFullscreen,
}: Props) {
    const mainCam = CAMERAS.find((c) => c.id === cameraAtiva) ?? CAMERAS[0];
    const side = sideCameras(cameraAtiva);

    return (
        <>
            <div className="transmissao-section">
                <div className="transmissao-sec-title">
                    <i className="pi pi-th-large" aria-hidden />
                    Visualização ao vivo
                </div>
                <div
                    className="transmissao-jitsi-mock"
                    style={previewOpaco ? { opacity: 0.35 } : undefined}
                >
                    <div className="transmissao-cam-grid transmissao-cam-grid-2" style={{ height: 200 }}>
                        <CamCell cam={mainCam} highlight librasConectado={librasConectado} />
                        <div className="flex flex-column" style={{ gap: 2 }}>
                            {side.map((cam) => (
                                <CamCell
                                    key={cam.id}
                                    cam={cam}
                                    compact
                                    librasConectado={librasConectado}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        className="transmissao-fullscreen-btn"
                        onClick={onToggleFullscreen}
                        aria-label={modoTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
                    >
                        <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} aria-hidden />
                        <span>{modoTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'}</span>
                    </button>
                    <div className="transmissao-jitsi-toolbar">
                        <button type="button" className="transmissao-jt-btn" title="Microfone" aria-label="Microfone">
                            <i className="pi pi-microphone" />
                        </button>
                        <button type="button" className="transmissao-jt-btn" title="Câmera" aria-label="Câmera">
                            <i className="pi pi-video" />
                        </button>
                        <button type="button" className="transmissao-jt-btn" title="Compartilhar tela" aria-label="Compartilhar tela">
                            <i className="pi pi-desktop" />
                        </button>
                        <button type="button" className="transmissao-jt-btn transmissao-jt-btn-red" title="Sair" aria-label="Sair da sala">
                            <i className="pi pi-phone" />
                        </button>
                        <button
                            type="button"
                            className="transmissao-jt-btn"
                            title="Tela cheia"
                            aria-label="Tela cheia Jitsi"
                            onClick={onToggleFullscreen}
                        >
                            <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="transmissao-section">
                <div className="transmissao-sec-title">
                    <i className="pi pi-sync" aria-hidden />
                    Selecionar câmera em destaque
                </div>
                <div className="cam-selector-grid">
                    {CAMERAS.map((cam) => {
                        const ativa = cameraAtiva === cam.id;
                        const isLib = cam.libras;
                        const desconectada = isLib && !librasConectado;
                        let cardClass = 'cam-card';
                        if (ativa && isLib) cardClass += ' selected-lib';
                        else if (ativa) cardClass += ' selected';
                        if (desconectada) cardClass += ' desconectada';

                        return (
                            <div
                                key={cam.id}
                                className={cardClass}
                                role="button"
                                tabIndex={0}
                                aria-pressed={ativa}
                                onClick={() => !desconectada && onSelectCamera(cam.id)}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ' ') && !desconectada) {
                                        e.preventDefault();
                                        onSelectCamera(cam.id);
                                    }
                                }}
                            >
                                <div className="transmissao-cam-preview">
                                    <i className={cam.icon} aria-hidden />
                                    {ativa && (
                                        <div
                                            className={
                                                isLib
                                                    ? 'transmissao-cam-target-badge transmissao-cam-target-lib'
                                                    : 'transmissao-cam-target-badge transmissao-cam-target-main'
                                            }
                                        >
                                            {isLib ? 'Libras' : 'Destaque'}
                                        </div>
                                    )}
                                </div>
                                <div className="transmissao-cam-card-footer">
                                    <span className="transmissao-cam-name">{cam.label}</span>
                                    <button
                                        type="button"
                                        className="transmissao-cam-set-btn"
                                        disabled={desconectada}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!desconectada) onSelectCamera(cam.id);
                                        }}
                                    >
                                        Ativar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex align-items-center gap-2 mt-2 flex-wrap">
                    <span className="transmissao-badge transmissao-badge-optional">
                        <i className="pi pi-sign-language" style={{ fontSize: 10 }} aria-hidden />
                        Libras — opcional
                    </span>
                    <span className="text-xs text-color-secondary">
                        Intérprete conectado automaticamente quando disponível na sala.
                    </span>
                </div>
            </div>
        </>
    );
}
