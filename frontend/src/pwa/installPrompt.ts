/**
 * Captura do `beforeinstallprompt` fora do React.
 *
 * O Chrome dispara o evento assim que considera o app instalável — para quem já
 * visitou o site (service worker ativo, manifest em cache) isso acontece antes
 * do bundle terminar de avaliar. Registrar o ouvinte só no `useEffect` do banner
 * perde o evento e o botão "Instalar" nunca aparece.
 */

export type InstallPromptOutcome = 'accepted' | 'dismissed' | 'unavailable';

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export type InstallPromptState = {
    /** Prompt nativo disponível — o navegador confirmou que o app é instalável. */
    canPrompt: boolean;
    installed: boolean;
};

let deferredEvent: BeforeInstallPromptEvent | null = null;
let state: InstallPromptState = { canPrompt: false, installed: false };
const subscribers = new Set<() => void>();

function setState(next: InstallPromptState) {
    state = next;
    for (const notify of subscribers) notify();
}

export function subscribeToInstallPrompt(onChange: () => void): () => void {
    subscribers.add(onChange);
    return () => subscribers.delete(onChange);
}

export function getInstallPromptState(): InstallPromptState {
    return state;
}

/** Chamar no boot, antes do render, para não perder o evento. */
export function listenForInstallPrompt() {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeinstallprompt', (event) => {
        // Sem preventDefault o Chrome mostraria a própria mini-infobar.
        event.preventDefault();
        deferredEvent = event as BeforeInstallPromptEvent;
        setState({ ...state, canPrompt: true });
    });

    window.addEventListener('appinstalled', () => {
        deferredEvent = null;
        setState({ canPrompt: false, installed: true });
    });
}

/**
 * Dispara o prompt nativo. Um evento só pode ser usado uma vez e o navegador
 * pode recusá-lo, então o resultado é sempre explícito — nunca falha em silêncio.
 */
export async function promptInstall(): Promise<InstallPromptOutcome> {
    const event = deferredEvent;
    if (!event) return 'unavailable';

    deferredEvent = null;
    setState({ ...state, canPrompt: false });

    try {
        // Chrome moderno resolve `prompt()` com a escolha; versões antigas, não.
        const result = await event.prompt();
        const outcome = result?.outcome ?? (await event.userChoice).outcome;
        if (outcome === 'accepted') {
            setState({ canPrompt: false, installed: true });
        }
        return outcome;
    } catch {
        return 'unavailable';
    }
}
