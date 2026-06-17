import path from 'node:path';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
) as {
    version: string;
};

export default defineConfig({
    plugins: [react(), tailwindcss()],
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
            '/uploads': {
                target: 'http://127.0.0.1:3000',
                changeOrigin: true,
            },
        },
    },
});
