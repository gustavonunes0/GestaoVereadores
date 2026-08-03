import GetAppOutlined from '@mui/icons-material/GetAppOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { useEffect, useState } from 'react';

const DISMISS_KEY = 'sigl.pwa.install.dismissed';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari
        ('standalone' in navigator &&
            Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    );
}

function isTabletViewport(): boolean {
    if (typeof window === 'undefined') return false;
    const w = Math.min(window.innerWidth, window.innerHeight);
    const h = Math.max(window.innerWidth, window.innerHeight);
    // iPad / tablet Android típicos; exclui monitores com mouse largo.
    const coarse =
        window.matchMedia('(pointer: coarse)').matches ||
        (navigator.maxTouchPoints > 0 && window.matchMedia('(hover: none)').matches);
    return coarse && w >= 600 && h >= 700;
}

/**
 * Sugere instalar o app no celular e tablet (Chrome/Edge/Android/Samsung).
 * No iOS/iPadOS Safari o beforeinstallprompt não existe — mostra dica manual.
 */
export function PwaInstallBanner() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        if (isStandalone()) return;
        if (localStorage.getItem(DISMISS_KEY) === '1') return;

        setIsTablet(isTabletViewport());

        // iPadOS 13+ reporta como Macintosh + multi-touch
        const isIos =
            /iphone|ipad|ipod/i.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        if (isIos && isSafari) {
            setShowIosHint(true);
            setVisible(true);
            return;
        }

        const onBeforeInstall = (event: Event) => {
            event.preventDefault();
            setDeferred(event as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstall);
        return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    }, []);

    function dismiss() {
        localStorage.setItem(DISMISS_KEY, '1');
        setVisible(false);
        setDeferred(null);
        setShowIosHint(false);
    }

    async function install() {
        if (!deferred) return;
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === 'accepted') {
            dismiss();
        } else {
            setVisible(false);
        }
    }

    if (!visible) return null;

    const androidHint = isTablet
        ? 'Acesso rápido no tablet, como um app.'
        : 'Acesso rápido no celular ou tablet, como um app.';
    const iosHint = isTablet
        ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início" (iPad).'
        : 'Toque em Compartilhar e depois em "Adicionar à Tela de Início".';

    return (
        <div className="pwa-banner pwa-banner--install" role="dialog" aria-label="Instalar aplicativo">
            <div className="pwa-banner__body">
                <GetAppOutlined sx={{ fontSize: 20 }} aria-hidden />
                <div className="pwa-banner__text">
                    {showIosHint ? (
                        <>
                            <strong>Instale o SIGL</strong>
                            <span>{iosHint}</span>
                        </>
                    ) : (
                        <>
                            <strong>Instale o SIGL</strong>
                            <span>{androidHint}</span>
                        </>
                    )}
                </div>
            </div>
            <div className="pwa-banner__actions">
                {!showIosHint && deferred ? (
                    <button type="button" className="pwa-banner__action" onClick={() => void install()}>
                        Instalar
                    </button>
                ) : null}
                <button
                    type="button"
                    className="pwa-banner__dismiss"
                    aria-label="Fechar"
                    onClick={dismiss}
                >
                    <CloseOutlined sx={{ fontSize: 18 }} aria-hidden />
                </button>
            </div>
        </div>
    );
}
