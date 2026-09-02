/**
 * Estado do Web Push em Cache Storage — única API de persistência acessível
 * tanto na janela quanto no service worker (que não tem localStorage).
 */

const CACHE_NAME = 'sigl-push-state';
const VAPID_KEY_URL = '/__sigl/push/vapid-key';
const PENDING_SUB_URL = '/__sigl/push/pending-subscription';

export type StoredPushSubscription = {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
};

async function write(url: string, payload: unknown): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, new Response(JSON.stringify(payload)));
}

async function read<T>(url: string): Promise<T | null> {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(url);
    if (!hit) return null;
    try {
        return (await hit.json()) as T;
    } catch {
        return null;
    }
}

export async function saveVapidPublicKey(publicKey: string): Promise<void> {
    await write(VAPID_KEY_URL, { publicKey });
}

export async function readVapidPublicKey(): Promise<string | null> {
    const stored = await read<{ publicKey: string }>(VAPID_KEY_URL);
    return stored?.publicKey ?? null;
}

/**
 * Subscription renovada pelo navegador enquanto o app estava fechado — o
 * service worker não tem o JWT, então a janela sincroniza no próximo boot.
 */
export async function savePendingSubscription(
    subscription: StoredPushSubscription,
): Promise<void> {
    await write(PENDING_SUB_URL, subscription);
}

export async function readPendingSubscription(): Promise<StoredPushSubscription | null> {
    return read<StoredPushSubscription>(PENDING_SUB_URL);
}

export async function clearPendingSubscription(): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(PENDING_SUB_URL);
}

/** Converte a chave VAPID (base64url) para o formato aceito por `pushManager.subscribe`. */
export function vapidKeyToBytes(base64Url: string): Uint8Array {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

export function toStoredSubscription(
    subscription: PushSubscription,
    userAgent?: string,
): StoredPushSubscription {
    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('Subscription push incompleta');
    }
    return {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        userAgent,
    };
}
