import { api } from '../client';
import { API_PATHS } from '../paths';

export type PushSubscriptionPayload = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userAgent?: string;
};

export const pushApi = {
    getVapidPublicKey: () =>
        api<{ publicKey: string }>(API_PATHS.pushVapidPublicKey),

    subscribe: (body: PushSubscriptionPayload) =>
        api<{ id: string; endpoint: string; enabled: boolean }>(
            API_PATHS.pushSubscriptions,
            { method: 'POST', body: JSON.stringify(body) },
        ),

    unsubscribe: (endpoint: string) =>
        api<{ enabled: boolean }>(API_PATHS.pushSubscriptions, {
            method: 'DELETE',
            body: JSON.stringify({ endpoint }),
        }),
};
