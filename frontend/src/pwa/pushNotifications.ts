import { pushApi } from '../api/notifications/push.api';
import {
    clearPendingSubscription,
    readPendingSubscription,
    saveVapidPublicKey,
    toStoredSubscription,
    vapidKeyToBytes,
} from './pushStorage';
import { DEFAULT_VAPID_PUBLIC_KEY } from './vapid';

const DISMISS_KEY = 'sigl.push.dismissed';

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

    const publicKey = await loadVapidPublicKey();
    // O service worker precisa da chave para reinscrever em pushsubscriptionchange.
    await saveVapidPublicKey(publicKey);

    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKeyToBytes(publicKey) as BufferSource,
        });
    }

    await pushApi.subscribe(toStoredSubscription(subscription, navigator.userAgent));
    await clearPendingSubscription();
    localStorage.removeItem(DISMISS_KEY);
    return true;
}

export async function disablePushNotifications(): Promise<void> {
    const subscription = await getExistingPushSubscription();
    if (!subscription) return;

    try {
        await pushApi.unsubscribe(subscription.endpoint);
    } finally {
        await clearPendingSubscription();
        await subscription.unsubscribe();
    }
}

/**
 * Reenvia ao backend a subscription renovada pelo navegador enquanto o app
 * estava fechado. Chamar no boot da sessão autenticada.
 */
async function loadVapidPublicKey(): Promise<string> {
    const fromEnv = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
    try {
        const { publicKey } = await pushApi.getVapidPublicKey();
        return publicKey?.trim() || fromEnv || DEFAULT_VAPID_PUBLIC_KEY;
    } catch {
        return fromEnv || DEFAULT_VAPID_PUBLIC_KEY;
    }
}

export async function syncPushSubscription(): Promise<void> {
    if (!isPushSupported()) return;

    const pending = await readPendingSubscription();
    if (!pending) return;

    await pushApi.subscribe(pending);
    await clearPendingSubscription();
}
