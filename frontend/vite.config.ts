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
            strategies: 'injectManifest',
            srcDir: 'src/pwa',
            filename: 'sw.ts',
            registerType: 'prompt',
            includeAssets: [
                'icons/favicon-16x16.png',
                'icons/favicon-32x32.png',
                'icons/apple-touch-icon.png',
            ],
            manifest: {
                id: '/',
                name: 'CâmaraGest — Gestão Legislativa',
                short_name: 'CâmaraGest',
                description:
                    'CâmaraGest — gestão legislativa para câmaras municipais — celular, tablet e desktop.',
                lang: 'pt-BR',
                dir: 'ltr',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                display_override: ['standalone', 'minimal-ui', 'browser'],
                orientation: 'any',
                background_color: '#f5f6f8',
                theme_color: '#0e1e46',
                categories: ['government', 'productivity'],
                prefer_related_applications: false,
                launch_handler: {
                    client_mode: ['navigate-existing', 'auto'],
                },
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
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
                maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
            },
            devOptions: {
                enabled: false,
                type: 'module',
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
