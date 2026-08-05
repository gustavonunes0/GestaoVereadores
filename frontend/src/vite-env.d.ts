/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_APP_VERSION: string;
    readonly VITE_API_URL?: string;
    readonly VITE_SOCKET_URL?: string;
    readonly VITE_PLATFORM_HOSTS?: string;
    readonly VITE_VAPID_PUBLIC_KEY?: string;
    readonly VITE_POWERED_BY?: string;
    readonly VITE_POWERED_BY_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
