import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/create-app';

let appPromise: ReturnType<typeof createApp> | null = null;

async function getApp() {
    if (!appPromise) {
        appPromise = createApp();
    }
    return appPromise;
}

/** Handler serverless para Vercel — encaminha requisições ao Fastify/NestJS. */
export default async function handler(
    req: IncomingMessage,
    res: ServerResponse,
) {
    const app = await getApp();
    const fastify = app.getHttpAdapter().getInstance();
    fastify.server.emit('request', req, res);
}
