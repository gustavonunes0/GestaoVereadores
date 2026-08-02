import { registerSW } from 'virtual:pwa-register';

export type PwaUpdateHandler = (reload: () => void) => void;

let notifyUpdate: PwaUpdateHandler | null = null;

export function onPwaUpdateAvailable(handler: PwaUpdateHandler) {
    notifyUpdate = handler;
}

export function registerPwa() {
    if (!('serviceWorker' in navigator)) return;

    const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
            notifyUpdate?.(() => {
                void updateSW(true);
            });
        },
        onOfflineReady() {
            // Shell disponível offline — sem toast agressivo.
        },
        onRegisteredSW(_swUrl, registration) {
            if (!registration) return;
            // Checa atualizações periodicamente (app em standalone fica aberto por horas).
            window.setInterval(
                () => {
                    void registration.update();
                },
                60 * 60 * 1000,
            );
        },
    });
}
