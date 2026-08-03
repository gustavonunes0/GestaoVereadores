import { JitsiMeeting } from '@jitsi/react-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { useAppToast } from '../../../hooks/useAppToast';
import type { JitsiTokenData } from '../../../types/sessoes';
import {
    buildJitsiOrigin,
    ensureJitsiExternalApi,
    isJitsiScriptLoadError,
} from '../../../utils/jitsiExternalApi';

interface Props {
    jitsiData: JitsiTokenData;
    userName: string;
    onApiReady?: (api: unknown) => void;
    jitsiContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function JitsiMeetingEmbed({
    jitsiData,
    userName,
    onApiReady,
    jitsiContainerRef,
}: Props) {
    const { showToast } = useAppToast();
    const localRef = useRef<HTMLDivElement>(null);
    const containerRef = jitsiContainerRef ?? localRef;
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
                        `Abra ${jitsiOrigin}, aceite o certificado (se self-signed) e tente novamente.`,
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [jitsiData.domain, jitsiOrigin, showToast]);

    useEffect(() => {
        const onChange = () => setTelaCheia(document.fullscreenElement === containerRef.current);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, [containerRef]);

    const handleFullscreen = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        if (document.fullscreenElement) {
            void document.exitFullscreen();
        } else {
            void el.requestFullscreen?.().catch(() => {
                showToast('warn', 'Tela cheia indisponível', 'O navegador bloqueou o modo tela cheia.');
            });
        }
    }, [containerRef, showToast]);

    function retryScriptLoad() {
        setScriptReady(false);
        setScriptError(null);
        ensureJitsiExternalApi(jitsiData.domain)
            .then(() => setScriptReady(true))
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : 'Falha ao carregar o Jitsi';
                setScriptError(message);
            });
    }

    return (
        <div ref={containerRef} className="jitsi-stage" style={{ position: 'relative' }}>
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
                                onClick={retryScriptLoad}
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
                    onApiReady={onApiReady}
                    getIFrameRef={(ref) => {
                        ref.style.height = '100%';
                        ref.style.width = '100%';
                        ref.style.borderRadius = '8px';
                        ref.style.border = '1px solid var(--surface-border)';
                    }}
                />
            )}
            <button
                type="button"
                className="jitsi-fullscreen-btn"
                onClick={handleFullscreen}
                aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
            >
                <i className={telaCheia ? 'pi pi-compress' : 'pi pi-expand'} />
                {telaCheia ? 'Sair' : 'Tela cheia'}
            </button>
        </div>
    );
}
