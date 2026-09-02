import GetAppOutlined from '@mui/icons-material/GetAppOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
    getInstallPromptState,
    promptInstall,
    subscribeToInstallPrompt,
} from '../../pwa/installPrompt';

const DISMISS_KEY = 'sigl.pwa.install.dismissed';

/** Janela de espera pelo `beforeinstallprompt` antes de cair na dica manual. */
const NATIVE_PROMPT_GRACE_MS = 2500;

type Mode = 'hidden' | 'native' | 'manual-ios' | 'manual-menu' | 'manual-generic';

function isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari
        ('standalone' in navigator &&
            Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    );
}

/** Celular ou tablet — exclui monitores com mouse. */
function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(pointer: coarse)').matches ||
        (navigator.maxTouchPoints > 0 && window.matchMedia('(hover: none)').matches)
    );
}

function isTabletViewport(): boolean {
    if (typeof window === 'undefined') return false;
    const w = Math.min(window.innerWidth, window.innerHeight);
    const h = Math.max(window.innerWidth, window.innerHeight);
    // iPad / tablet Android típicos.
    return isTouchDevice() && w >= 600 && h >= 700;
}

/**
 * Só os navegadores baseados em Chromium expõem o prompt nativo. Checar a
 * capacidade em vez do user-agent evita escolher o ramo errado — era o que
 * fazia o Android cair na dica do iOS, que não tem botão.
 */
function supportsNativePrompt(): boolean {
    return 'onbeforeinstallprompt' in window;
}

/** iOS/iPadOS: usado só para escolher o texto, nunca para decidir o fluxo. */
function isIos(): boolean {
    return (
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        // iPadOS 13+ se apresenta como desktop macOS, mas tem multi-touch.
        (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    );
}

/**
 * Sugere instalar o app no celular e no tablet.
 *
 * O prompt nativo (`beforeinstallprompt`) é capturado no boot por
 * `installPrompt.ts`. Quando ele não está disponível — iOS Safari, ou Android em
 * que o navegador não ofereceu o prompt — o banner mostra a instrução manual em
 * vez de um botão que não faz nada.
 */
export function PwaInstallBanner() {
    const { canPrompt, installed } = useSyncExternalStore(
        subscribeToInstallPrompt,
        getInstallPromptState,
    );

    const [dismissed, setDismissed] = useState(
        () => localStorage.getItem(DISMISS_KEY) === '1',
    );
    const [graceElapsed, setGraceElapsed] = useState(false);
    const [forceManual, setForceManual] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        setIsTablet(isTabletViewport());
        const timeout = window.setTimeout(
            () => setGraceElapsed(true),
            NATIVE_PROMPT_GRACE_MS,
        );
        return () => window.clearTimeout(timeout);
    }, []);

    const mode: Mode = (() => {
        if (dismissed || installed || isStandalone()) return 'hidden';
        if (canPrompt && !forceManual) return 'native';
        // A instrução manual só ajuda em celular e tablet.
        if (!isTouchDevice()) return 'hidden';
        // Sem prompt nativo (Safari, Firefox) a instalação é sempre manual.
        if (!supportsNativePrompt()) return isIos() ? 'manual-ios' : 'manual-generic';
        // Chromium que não ofereceu o prompt: instrui pelo menu do navegador.
        if (forceManual || graceElapsed) return 'manual-menu';
        return 'hidden';
    })();

    function dismiss() {
        localStorage.setItem(DISMISS_KEY, '1');
        setDismissed(true);
    }

    async function install() {
        const outcome = await promptInstall();
        if (outcome === 'accepted') {
            dismiss();
            return;
        }
        // O navegador recusou o prompt (evento obsoleto ou já consumido): em vez
        // de não dar retorno nenhum, explica como instalar pelo menu.
        if (outcome === 'unavailable') {
            setForceManual(true);
        } else {
            setDismissed(true);
        }
    }

    if (mode === 'hidden') return null;

    const hint = {
        native: isTablet
            ? 'Acesso rápido no tablet, como um app.'
            : 'Acesso rápido no celular, como um app.',
        'manual-ios': isTablet
            ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início" (iPad).'
            : 'Toque em Compartilhar e depois em "Adicionar à Tela de Início".',
        'manual-menu':
            'Abra o menu do navegador (⋮) e toque em "Instalar aplicativo" ou "Adicionar à tela inicial".',
        'manual-generic':
            'Use o menu do navegador para adicionar o CâmaraGest à tela inicial.',
    }[mode];

    return (
        <div
            className="pwa-banner pwa-banner--install"
            role="dialog"
            aria-label="Instalar aplicativo"
        >
            <div className="pwa-banner__body">
                <GetAppOutlined sx={{ fontSize: 20 }} aria-hidden />
                <div className="pwa-banner__text">
                    <strong>Instale o CâmaraGest</strong>
                    <span>{hint}</span>
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
