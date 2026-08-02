import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as {
    version: string;
};

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'prompt',
            includeAssets: [
                'icons/favicon-16x16.png',
                'icons/favicon-32x32.png',
                'icons/apple-touch-icon.png',
            ],
            manifest: {
                name: 'SIGL — Gestão Vereadores',
                short_name: 'SIGL',
                description:
                    'Sistema Integrado de Gestão Legislativa para câmaras municipais.',
                lang: 'pt-BR',
                dir: 'ltr',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                display_override: ['standalone', 'minimal-ui'],
                orientation: 'any',
                background_color: '#f5f6f8',
                theme_color: '#0e1e46',
                categories: ['government', 'productivity'],
                icons: [
                    {
                        src: 'icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'icons/maskable-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                    {
                        src: 'icons/maskable-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            workbox: {
                navigateFallback: '/index.html',
                navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io/, /^\/uploads\//],
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                            expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                    {
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 8,
                            expiration: { maxEntries: 64, maxAgeSeconds: 60 * 5 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    optimizeDeps: {
        // primeicons is CSS/fonts only — do not pre-bundle as JS (no package entry).
        include: ['primereact/api'],
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
                ws: true,
            },
            '/uploads': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            },
            /** Jitsi self-hosted (dev): evita bloqueio do certificado ao carregar external_api.js */
            '/__jitsi': {
                target: 'https://localhost:8444',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/__jitsi/, ''),
            },
        },
    },
});
