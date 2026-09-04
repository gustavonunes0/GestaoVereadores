import GetAppOutlined from '@mui/icons-material/GetAppOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
    getInstallPromptState,
    promptInstall,
    subscribeToInstallPrompt,
} from '../../pwa/installPrompt';
import { isIosDevice, isStandaloneDisplay } from '../../pwa/device';
import { InstallAppPopup } from './InstallAppGuide';

const DISMISS_KEY = 'sigl.pwa.install.dismissed';
const DISMISS_AT_KEY = 'sigl.pwa.install.dismissedAt';
const IOS_REDISMISS_MS = 3 * 24 * 60 * 60 * 1000;
const NATIVE_PROMPT_GRACE_MS = 2500;

type Mode = 'hidden' | 'native' | 'manual-ios' | 'manual-menu' | 'manual-generic';

function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(pointer: coarse)').matches ||
        (navigator.maxTouchPoints > 0 && window.matchMedia('(hover: none)').matches)
    );
}

function supportsNativePrompt(): boolean {
    return 'onbeforeinstallprompt' in window;
}

function wasDismissedRecently(): boolean {
    if (localStorage.getItem(DISMISS_KEY) !== '1') return false;
    if (!isIosDevice()) return true;
    const at = Number(localStorage.getItem(DISMISS_AT_KEY) || 0);
    if (!at) return true;
    return Date.now() - at < IOS_REDISMISS_MS;
}

function isLoginPath(): boolean {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path === '/login' || path.startsWith('/login');
}

/**
 * Android: botão Instalar nativo.
 * iPhone: “Ver como” abre o guia de 3 passos (única forma viável na Apple).
 */
export function PwaInstallBanner() {
    const { canPrompt, installed } = useSyncExternalStore(
        subscribeToInstallPrompt,
        getInstallPromptState,
    );

    const [dismissed, setDismissed] = useState(() => wasDismissedRecently());
    const [graceElapsed, setGraceElapsed] = useState(false);
    const [forceManual, setForceManual] = useState(false);
    const [iosSheetOpen, setIosSheetOpen] = useState(false);
    const [onLogin, setOnLogin] = useState(() => isLoginPath());

    useEffect(() => {
        const timeout = window.setTimeout(
            () => setGraceElapsed(true),
            NATIVE_PROMPT_GRACE_MS,
        );
        return () => window.clearTimeout(timeout);
    }, []);

    useEffect(() => {
        const syncPath = () => setOnLogin(isLoginPath());
        syncPath();
        window.addEventListener('popstate', syncPath);
        const origPush = history.pushState.bind(history);
        const origReplace = history.replaceState.bind(history);
        history.pushState = (...args: Parameters<History['pushState']>) => {
            origPush(...args);
            syncPath();
        };
        history.replaceState = (...args: Parameters<History['replaceState']>) => {
            origReplace(...args);
            syncPath();
        };
        return () => {
            window.removeEventListener('popstate', syncPath);
            history.pushState = origPush;
            history.replaceState = origReplace;
        };
    }, []);

    const mode: Mode = (() => {
        // Login iOS já tem o guia embutido — evita dois avisos na mesma tela.
        if (onLogin && isIosDevice()) return 'hidden';
        if (dismissed || installed || isStandaloneDisplay()) return 'hidden';
        if (canPrompt && !forceManual) return 'native';
        if (isIosDevice()) return 'manual-ios';
        if (!isTouchDevice()) {
            if (forceManual || graceElapsed) return 'manual-menu';
            return 'hidden';
        }
        if (!supportsNativePrompt()) return 'manual-generic';
        if (forceManual || graceElapsed) return 'manual-menu';
        return 'hidden';
    })();

    function dismiss() {
        localStorage.setItem(DISMISS_KEY, '1');
        localStorage.setItem(DISMISS_AT_KEY, String(Date.now()));
        setDismissed(true);
    }

    async function install() {
        const outcome = await promptInstall();
        if (outcome === 'accepted') {
            dismiss();
            return;
        }
        if (outcome === 'unavailable') setForceManual(true);
        else setDismissed(true);
    }

    if (mode === 'hidden' && !iosSheetOpen) return null;

    return (
        <>
            {mode !== 'hidden' ? (
                <div
                    className={`pwa-banner pwa-banner--install${mode === 'manual-ios' ? ' pwa-banner--ios' : ''}`}
                    role="dialog"
                    aria-label="Instalar aplicativo"
                >
                    <div className="pwa-banner__body">
                        <GetAppOutlined sx={{ fontSize: 20 }} aria-hidden />
                        <div className="pwa-banner__text">
                            <strong>
                                {mode === 'manual-ios'
                                    ? 'Ícone na tela inicial'
                                    : 'Instale o CâmaraGest'}
                            </strong>
                            <span>
                                {mode === 'native' ? 'Acesso rápido, como um app.' : null}
                                {mode === 'manual-ios'
                                    ? 'Opcional. Toque em “Ver como” — 3 passos no Safari.'
                                    : null}
                                {mode === 'manual-menu'
                                    ? isTouchDevice()
                                        ? 'Menu ⋮ → Instalar aplicativo.'
                                        : 'Chrome: ícone instalar na barra ou menu ⋮.'
                                    : null}
                                {mode === 'manual-generic'
                                    ? 'Use o menu do navegador para adicionar à tela inicial.'
                                    : null}
                            </span>
                        </div>
                    </div>
                    <div className="pwa-banner__actions">
                        {mode === 'native' ? (
                            <button
                                type="button"
                                className="pwa-banner__action"
                                onClick={() => void install()}
                            >
                                Instalar
                            </button>
                        ) : null}
                        {mode === 'manual-ios' ? (
                            <button
                                type="button"
                                className="pwa-banner__action"
                                onClick={() => setIosSheetOpen(true)}
                            >
                                Ver como
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className="pwa-banner__dismiss"
                            aria-label="Agora não"
                            onClick={dismiss}
                        >
                            <CloseOutlined sx={{ fontSize: 18 }} aria-hidden />
                        </button>
                    </div>
                </div>
            ) : null}

            <InstallAppPopup
                open={iosSheetOpen}
                onClose={() => {
                    setIosSheetOpen(false);
                    dismiss();
                }}
                initialPlatform="ios"
            />
        </>
    );
}
