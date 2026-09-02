import { registerSW } from 'virtual:pwa-register';

export type PwaUpdateHandler = (reload: () => void) => void;

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

let notifyUpdate: PwaUpdateHandler | null = null;
/** `registerPwa()` roda antes do React montar — guarda o update até ter ouvinte. */
let pendingReload: (() => void) | null = null;

export function onPwaUpdateAvailable(handler: PwaUpdateHandler) {
    notifyUpdate = handler;
    if (pendingReload) {
        handler(pendingReload);
    }
}

export function registerPwa() {
    if (!('serviceWorker' in navigator)) return;

    const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
            const reload = () => {
                pendingReload = null;
                void updateSW(true);
            };
            pendingReload = reload;
            notifyUpdate?.(reload);
        },
        onRegisteredSW(_swUrl, registration) {
            if (!registration) return;

            const checkForUpdate = () => {
                void registration.update();
            };

            // App em standalone fica aberto por horas durante a sessão plenária.
            window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') checkForUpdate();
            });
        },
    });
}
