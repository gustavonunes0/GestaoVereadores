import { pushApi } from '../api/notifications/push.api';

const DISMISS_KEY = 'sigl.push.dismissed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
        output[i] = raw.charCodeAt(i);
    }
    return output;
}

function subscriptionToPayload(sub: PushSubscription) {
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Subscription push incompleta');
    }
    return {
        endpoint: json.endpoint,
        keys: {
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
        },
        userAgent: navigator.userAgent,
    };
}

export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
}

export function wasPushDismissed(): boolean {
    return localStorage.getItem(DISMISS_KEY) === '1';
}

export function dismissPushPrompt() {
    localStorage.setItem(DISMISS_KEY, '1');
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) return null;
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
}

/**
 * Pede permissão, cria subscription Web Push e registra no backend.
 */
export async function enablePushNotifications(): Promise<boolean> {
    if (!isPushSupported()) {
        throw new Error('Este navegador não suporta notificações push');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        return false;
    }

    const { publicKey } = await pushApi.getVapidPublicKey();
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
    }

    await pushApi.subscribe(subscriptionToPayload(subscription));
    localStorage.removeItem(DISMISS_KEY);
    return true;
}

export async function disablePushNotifications(): Promise<void> {
    const subscription = await getExistingPushSubscription();
    if (!subscription) return;

    try {
        await pushApi.unsubscribe(subscription.endpoint);
    } finally {
        await subscription.unsubscribe();
    }
}
