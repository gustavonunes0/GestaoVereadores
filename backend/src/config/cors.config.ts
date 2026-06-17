import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost',
];

/** Deploys Vercel do frontend (produção + previews). */
const VERCEL_FRONTEND_ORIGIN =
    /^https:\/\/gestao-vereadores(-[a-z0-9-]+)?\.vercel\.app$/i;

function collectAllowedOrigins(): Array<string | RegExp> {
    const fromEnv =
        process.env.CORS_ORIGIN?.split(',')
            .map((value) => value.trim())
            .filter(Boolean) ?? [];

    return [...new Set([...DEFAULT_ORIGINS, ...fromEnv]), VERCEL_FRONTEND_ORIGIN];
}

export function buildCorsOptions(): CorsOptions {
    return {
        origin: collectAllowedOrigins(),
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        optionsSuccessStatus: 204,
    };
}
