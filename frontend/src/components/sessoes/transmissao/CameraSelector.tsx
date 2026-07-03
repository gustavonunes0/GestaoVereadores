import { JitsiMeeting } from '@jitsi/react-sdk';
import { useCallback, useEffect, useState } from 'react';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useAppToast } from '../../../hooks/useAppToast';
import type { JitsiTokenData } from '../../../types/sessoes';
import {
    buildJitsiOrigin,
    ensureJitsiExternalApi,
    isJitsiScriptLoadError,
} from '../../../utils/jitsiExternalApi';
import { ConvidarParticipantesJitsi } from './ConvidarParticipantesJitsi';

interface Participante {
    id: string;
    nome: string;
}

interface Props {
    jitsiData: JitsiTokenData;
    userName: string;
    externalApiRef: React.MutableRefObject<unknown>;
    jitsiContainerRef: React.RefObject<HTMLDivElement | null>;
    cameraAtiva: string;
    setCameraAtiva: (id: string) => void;
    participantes: Participante[];
    librasParticipantId: string | null;
    handleApiReady: (api: unknown) => void;
}

function isLibras(p: Participante): boolean {
    return /libras|intérprete|interprete/i.test(p.nome);
}

export function CameraSelector({
    jitsiData,
    userName,
    externalApiRef,
    jitsiContainerRef,
    cameraAtiva,
    setCameraAtiva,
    participantes,
    librasParticipantId,
    handleApiReady,
}: Props) {
    const { showToast } = useAppToast();
    const [telaCheia, setTelaCheia] = useState(false);
    const [scriptReady, setScriptReady] = useState(!!window.JitsiMeetExternalAPI);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const jitsiOrigin = buildJitsiOrigin(jitsiData.domain);

    useEffect(() => {
        let cancelled = false;
        setScriptError(null);

        ensureJitsiExternalApi(jitsiData.domain)
            .then(() => {
                if (!cancelled) setScriptReady(true);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : 'Falha ao carregar o Jitsi';
                setScriptError(message);
                if (isJitsiScriptLoadError(message)) {
                    showToast(
                        'warn',
                        'Certificado do Jitsi',
                        'Abra https://localhost:8444, aceite o certificado e tente novamente.',
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [jitsiData.domain, showToast]);

    useEffect(() => {
        const onChange = () => setTelaCheia(document.fullscreenElement === jitsiContainerRef.current);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, [jitsiContainerRef]);

    const handleFullscreen = useCallback(() => {
        const el = jitsiContainerRef.current;
        if (!el) return;
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void el.requestFullscreen?.().catch(() => {
                showToast('warn', 'Tela cheia indisponível', 'O navegador bloqueou o modo tela cheia.');
            });
        }
    }, [jitsiContainerRef, showToast]);

    function getApi() {
        return externalApiRef.current as { executeCommand?: (...args: unknown[]) => void } | null;
    }

    function handleFixarParticipante(p: Participante) {
        getApi()?.executeCommand?.('setLargeVideoParticipant', p.id);
        setCameraAtiva(p.id);
    }

    function handleCompartilharTela() {
        getApi()?.executeCommand?.('toggleShareScreen');
    }

    return (
        <div className="flex flex-column gap-4">
            <div ref={jitsiContainerRef} className="jitsi-stage" style={{ position: 'relative' }}>
                {scriptError ? (
                    <div className="transmissao-jitsi-hint jitsi-stage__cert-hint">
                        <i className="pi pi-shield" aria-hidden />
                        <div>
                            <strong>Não foi possível carregar o Jitsi</strong>
                            <p className="m-0 mt-1 text-sm text-color-secondary">
                                O navegador bloqueou o script por causa do certificado HTTPS local.
                                Abra o link abaixo, aceite o certificado (Avançado → Continuar) e
                                clique em &quot;Tentar novamente&quot;.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Button
                                    type="button"
                                    label="Abrir Jitsi (aceitar certificado)"
                                    icon="pi pi-external-link"
                                    size="small"
                                    onClick={() => window.open(jitsiOrigin, '_blank', 'noopener,noreferrer')}
                                />
                                <Button
                                    type="button"
                                    label="Tentar novamente"
                                    icon="pi pi-refresh"
                                    size="small"
                                    outlined
                                    onClick={() => {
                                        setScriptReady(false);
                                        setScriptError(null);
                                        ensureJitsiExternalApi(jitsiData.domain)
                                            .then(() => setScriptReady(true))
                                            .catch((err: unknown) => {
                                                const message =
                                                    err instanceof Error
                                                        ? err.message
                                                        : 'Falha ao carregar o Jitsi';
                                                setScriptError(message);
                                            });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : !scriptReady ? (
                    <div className="transmissao-jitsi-hint jitsi-stage__cert-hint">
                        <i className="pi pi-spin pi-spinner" aria-hidden />
                        <span>Carregando sala de vídeo…</span>
                    </div>
                ) : (
                    <JitsiMeeting
                        domain={jitsiData.domain}
                        roomName={jitsiData.roomName}
                        {...(jitsiData.token ? { jwt: jitsiData.token } : {})}
                        configOverwrite={{
                            startWithAudioMuted: false,
                            startWithVideoMuted: false,
                            prejoinPageEnabled: false,
                            enableWelcomePage: false,
                        }}
                        interfaceConfigOverwrite={{
                            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                            TOOLBAR_BUTTONS: [
                                'microphone',
                                'camera',
                                'desktop',
                                'fullscreen',
                                'tileview',
                                'hangup',
                            ],
                        }}
                        userInfo={{ displayName: userName, email: '' }}
                        onApiReady={handleApiReady}
                        getIFrameRef={(ref) => {
                            ref.style.height = '100%';
                            ref.style.width = '100%';
                            ref.style.borderRadius = '8px';
                            ref.style.border = '1px solid var(--surface-border)';
                        }}
                    />
                )}
                <button
                    className="jitsi-fullscreen-btn"
                    onClick={handleFullscreen}
                    aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                    <i className={telaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
                    {telaCheia ? 'Sair' : 'Tela cheia'}
                </button>
            </div>

            <ConvidarParticipantesJitsi jitsiData={jitsiData} />

            <div>
                <div className="flex align-items-center justify-content-between mb-2 gap-2 flex-wrap">
                    <p className="text-sm font-semibold m-0">
                        Câmeras na sala{' '}
                        <span className="text-color-secondary">({participantes.length})</span>
                    </p>
                    <Button
                        label="Compartilhar tela"
                        icon="pi pi-window-maximize"
                        size="small"
                        outlined
                        style={{ fontSize: '11px' }}
                        onClick={handleCompartilharTela}
                    />
                </div>

                {participantes.length === 0 ? (
                    <div className="transmissao-cam-empty">
                        <i className="pi pi-video" aria-hidden />
                        <span>Nenhuma câmera conectada à sala ainda.</span>
                        <small className="text-color-secondary">
                            Clique em <strong>Convidar</strong> acima e envie o link da sala para cada
                            dispositivo (câmera do plenário, celular, intérprete de Libras). Ao entrar,
                            eles aparecerão aqui para você escolher qual fica em destaque.
                        </small>
                    </div>
                ) : (
                    <div className="cam-selector-grid">
                        {participantes.map((p) => {
                            const libras = isLibras(p);
                            const ativa = cameraAtiva === p.id || (libras && cameraAtiva === librasParticipantId);
                            let cardClass = 'cam-card';
                            if (ativa && !libras) cardClass += ' ativa';
                            if (ativa && libras) cardClass += ' ativa-libras';

                            return (
                                <div key={p.id} className={cardClass}>
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
                                        <i
                                            className={`${libras ? 'pi pi-sign-language' : 'pi pi-video'} text-white`}
                                            style={{ fontSize: '1.5rem' }}
                                        />
                                        {ativa && (
                                            <Tag
                                                value={libras ? 'LIBRAS' : 'DESTAQUE'}
                                                severity={libras ? 'success' : 'info'}
                                                style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}
                                            />
                                        )}
                                        {libras && !ativa && (
                                            <Tag
                                                value="Libras"
                                                severity="success"
                                                style={{ position: 'absolute', top: 4, left: 4, fontSize: '12px' }}
                                            />
                                        )}
                                    </div>
                                    <div className="p-2 flex align-items-center justify-content-between gap-1">
                                        <span
                                            style={{ fontSize: '11px', color: 'var(--text-color-secondary)' }}
                                            title={p.nome}
                                        >
                                            {p.nome}
                                        </span>
                                        <Button
                                            label="Destacar"
                                            size="small"
                                            text
                                            style={{ fontSize: '11px', padding: '2px 6px' }}
                                            onClick={() => handleFixarParticipante(p)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex align-items-center gap-2 mt-2">
                    <Tag value="Libras" severity="success" style={{ fontSize: '10px' }} />
                    <small className="text-color-secondary">
                        Participantes cujo nome contém “Libras/Intérprete” são marcados automaticamente.
                    </small>
                </div>
            </div>
        </div>
    );
}
