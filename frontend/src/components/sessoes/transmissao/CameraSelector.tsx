import { JitsiMeeting } from '@jitsi/react-sdk';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useAppToast } from '../../../hooks/useAppToast';
import type { JitsiTokenData } from '../../../types/sessoes';

interface CameraSource {
    id: string;
    label: string;
    icon: string;
    opcional?: boolean;
}

const CAMERAS_FIXAS: CameraSource[] = [
    { id: 'camera1', label: 'Câmera 1 — Leitor',   icon: 'pi pi-desktop' },
    { id: 'camera2', label: 'Câmera 2 — Plenário', icon: 'pi pi-desktop' },
    { id: 'screen',  label: 'Compartilhar tela',   icon: 'pi pi-window'  },
];

const CAMERA_LIBRAS: CameraSource = {
    id: 'libras',
    label: 'Intérprete — Libras',
    icon: 'pi pi-sign-language',
    opcional: true,
};

interface Props {
    jitsiData: JitsiTokenData;
    userName: string;
    externalApiRef: React.MutableRefObject<unknown>;
    jitsiContainerRef: React.RefObject<HTMLDivElement | null>;
    cameraAtiva: string;
    setCameraAtiva: (id: string) => void;
    modoTelaCheia: boolean;
    librasConectado: boolean;
    librasParticipantId: string | null;
    handleApiReady: (api: unknown) => void;
    handleFullscreen: () => void;
}

export function CameraSelector({
    jitsiData,
    userName,
    externalApiRef,
    jitsiContainerRef,
    cameraAtiva,
    setCameraAtiva,
    modoTelaCheia,
    librasConectado,
    librasParticipantId,
    handleApiReady,
    handleFullscreen,
}: Props) {
    const { showToast } = useAppToast();

    function handleSelecionarCamera(cam: CameraSource) {
        if (!librasConectado && cam.id === 'libras') {
            showToast('warn', 'Intérprete não disponível', 'Intérprete de Libras não está na sala');
            return;
        }
        const api = externalApiRef.current as { executeCommand?: (...args: unknown[]) => void } | null;
        if (cam.id === 'screen') {
            api?.executeCommand?.('toggleShareScreen');
        } else if (cam.id === 'libras') {
            api?.executeCommand?.('setLargeVideoParticipant', librasParticipantId);
        } else {
            api?.executeCommand?.('setLargeVideoParticipant', cam.id);
        }
        setCameraAtiva(cam.id);
    }

    const allCameras = [...CAMERAS_FIXAS, CAMERA_LIBRAS];

    return (
        <div className="flex flex-column gap-4">
            <div ref={jitsiContainerRef} style={{ position: 'relative' }}>
                <JitsiMeeting
                    domain={jitsiData.domain}
                    roomName={jitsiData.roomName}
                    jwt={jitsiData.token}
                    configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        prejoinPageEnabled: false,
                        enableWelcomePage: false,
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        TOOLBAR_BUTTONS: ['microphone', 'camera', 'desktop', 'fullscreen', 'tileview', 'hangup'],
                    }}
                    userInfo={{ displayName: userName, email: '' }}
                    onApiReady={handleApiReady}
                    getIFrameRef={(ref) => {
                        ref.style.height = '420px';
                        ref.style.width = '100%';
                        ref.style.borderRadius = '8px';
                        ref.style.border = '1px solid var(--surface-border)';
                    }}
                />
                <button
                    className="jitsi-fullscreen-btn"
                    onClick={handleFullscreen}
                    aria-label={modoTelaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                    <i className={modoTelaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
                    {modoTelaCheia ? 'Sair' : 'Tela cheia'}
                </button>
            </div>

            <div>
                <p className="text-sm font-semibold mb-2 m-0">Selecionar câmera em destaque</p>
                <div className="cam-selector-grid">
                    {allCameras.map((cam) => {
                        const isLibras = cam.id === 'libras';
                        const ativa = cameraAtiva === cam.id;
                        const desconectada = isLibras && !librasConectado;
                        let cardClass = 'cam-card';
                        if (ativa && !isLibras) cardClass += ' ativa';
                        if (ativa && isLibras && librasConectado) cardClass += ' ativa-libras';
                        if (desconectada) cardClass += ' desconectada';

                        return (
                            <div key={cam.id} className={cardClass}>
                                <div
                                    style={{
                                        height: 80,
                                        background: 'var(--surface-900)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <i className={`${cam.icon} text-white`} style={{ fontSize: '1.5rem' }} />
                                    {ativa && (
                                        <Tag
                                            value={isLibras && librasConectado ? 'LIBRAS' : 'DESTAQUE'}
                                            severity={isLibras ? 'success' : 'info'}
                                            style={{ position: 'absolute', top: 4, left: 4, fontSize: '9px' }}
                                        />
                                    )}
                                    {isLibras && !librasConectado && (
                                        <Tag
                                            value="Aguardando"
                                            severity="warning"
                                            style={{ position: 'absolute', top: 4, left: 4, fontSize: '9px' }}
                                        />
                                    )}
                                    {isLibras && librasConectado && !ativa && (
                                        <Tag
                                            value="Conectado"
                                            severity="success"
                                            style={{ position: 'absolute', top: 4, left: 4, fontSize: '9px' }}
                                        />
                                    )}
                                </div>
                                <div className="p-2 flex align-items-center justify-content-between gap-1">
                                    <span style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}>
                                        {cam.label}
                                    </span>
                                    <Button
                                        label="Ativar"
                                        size="small"
                                        text
                                        style={{ fontSize: '11px', padding: '2px 6px' }}
                                        onClick={() => handleSelecionarCamera(cam)}
                                        disabled={desconectada}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex align-items-center gap-2 mt-2">
                    <Tag value="Libras — opcional" severity="warning" style={{ fontSize: '10px' }} />
                    <small className="text-color-secondary">Intérprete conectado automaticamente quando disponível na sala.</small>
                </div>
            </div>
        </div>
    );
}
