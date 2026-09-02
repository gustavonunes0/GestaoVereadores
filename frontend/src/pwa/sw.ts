/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';
import {
    readVapidPublicKey,
    savePendingSubscription,
    toStoredSubscription,
    vapidKeyToBytes,
} from './pushStorage';

declare let self: ServiceWorkerGlobalScope;

/**
 * `registerType: 'prompt'` — o SW novo fica em `waiting` até o usuário aceitar.
 * Ativar sem esperar derrubaria os chunks lazy da build em uso na aba aberta.
 */
self.addEventListener('message', (event) => {
    if ((event.data as { type?: string } | undefined)?.type === 'SKIP_WAITING') {
        void self.skipWaiting();
    }
});

clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/index.html'), {
        denylist: [/^\/api\//, /^\/socket\.io/, /^\/uploads\//],
    }),
);

type PushPayload = {
    title?: string;
    body?: string;
    url?: string;
    tag?: string;
    data?: Record<string, unknown>;
};

self.addEventListener('push', (event) => {
    let payload: PushPayload = {
        title: 'CâmaraGest',
        body: 'Nova atualização na sessão plenária',
        url: '/parlamentar/sessoes',
    };

    try {
        if (event.data) {
            payload = { ...payload, ...(event.data.json() as PushPayload) };
        }
    } catch {
        const text = event.data?.text();
        if (text) payload.body = text;
    }

    const title = payload.title ?? 'CâmaraGest';
    const options: NotificationOptions = {
        body: payload.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: payload.tag ?? 'sigl-push',
        data: {
            url: payload.url ?? '/parlamentar/sessoes',
            ...(payload.data ?? {}),
        },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const data = event.notification.data as { url?: string } | undefined;
    const targetUrl = data?.url || '/parlamentar/sessoes';

    event.waitUntil(
        (async () => {
            const allClients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            for (const client of allClients) {
                if ('focus' in client) {
                    await client.focus();
                    if ('navigate' in client) {
                        await (client as WindowClient).navigate(targetUrl);
                    }
                    return;
                }
            }

            await self.clients.openWindow(targetUrl);
        })(),
    );
});

/**
 * O navegador pode rotacionar a subscription sem aviso. Sem reinscrever aqui o
 * vereador para de receber alertas silenciosamente. O SW não tem o JWT, então
 * guarda a subscription nova para a janela enviar ao backend no próximo boot.
 */
self.addEventListener('pushsubscriptionchange', (event) => {
    const changeEvent = event as ExtendableEvent & {
        oldSubscription?: PushSubscription | null;
        newSubscription?: PushSubscription | null;
    };

    changeEvent.waitUntil(
        (async () => {
            let subscription = changeEvent.newSubscription ?? null;

            if (!subscription) {
                const publicKey = await readVapidPublicKey();
                if (!publicKey) return;

                subscription = await self.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKeyToBytes(publicKey) as BufferSource,
                });
            }

            await savePendingSubscription(toStoredSubscription(subscription));

            const clients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });
            for (const client of clients) {
                client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' });
            }
        })(),
    );
});
