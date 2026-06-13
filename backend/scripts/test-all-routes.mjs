/**
 * Smoke test de todas as rotas via OpenAPI (Fastify).
 * Sucesso: rota responde sem 5xx e retorna JSON quando aplicável.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.API_BASE ?? 'http://localhost:3000';
const UUID = '00000000-0000-4000-8000-000000000001';

const openapiPath =
    process.argv[2] ??
    path.join(__dirname, '..', 'tmp-openapi.json');

const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

const PUBLIC_PATHS = new Set([
    '/api/health',
    '/api/auth/login',
    '/api/auth/login-camara',
]);

async function loginSigl() {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' }),
    });
    if (!res.ok) throw new Error(`login SIGL falhou: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

async function loginCamara() {
    const res = await fetch(`${BASE}/api/auth/login-camara`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@camara.teste',
            password: 'camara123',
            tenantCnpj: '00000000000191',
        }),
    });
    if (!res.ok) throw new Error(`login câmara falhou: ${res.status}`);
    const data = await res.json();
    return data.access_token;
}

function resolvePath(routePath) {
    return routePath.replace(/\{[^}]+\}/g, UUID);
}

function pickToken(routePath, masterToken, camaraToken) {
    if (PUBLIC_PATHS.has(routePath)) return null;
    if (
        routePath.startsWith('/api/tenants') ||
        routePath.startsWith('/api/users') ||
        routePath.startsWith('/api/usuarios') ||
        routePath.startsWith('/api/tenant-users') ||
        routePath.startsWith('/api/guest-users')
    ) {
        return masterToken;
    }
    return camaraToken;
}

async function callRoute(method, routePath, token) {
    const url = `${BASE}${resolvePath(routePath)}`;
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const opts = { method: method.toUpperCase(), headers };
    const m = method.toLowerCase();
    if (m === 'post' || m === 'patch' || m === 'put') {
        headers['Content-Type'] = 'application/json';
        opts.body = '{}';
    }

    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') ?? '';
    let bodyPreview = '';
    if (contentType.includes('json')) {
        const json = await res.json();
        bodyPreview = JSON.stringify(json).slice(0, 120);
    } else {
        bodyPreview = (await res.text()).slice(0, 80);
    }

    return {
        status: res.status,
        contentType,
        server: res.headers.get('server'),
        bodyPreview,
    };
}

async function main() {
    console.log('=== Consenso SGL — smoke test de rotas (Fastify) ===\n');
    console.log(`Base: ${BASE}`);
    console.log(`OpenAPI: ${openapi.info.title} v${openapi.info.version}`);

    const health = await callRoute('get', '/api/health', null);
    const isFastify =
        !health.server?.includes('Express') &&
        health.contentType.includes('json');
    console.log(
        `\nMotor HTTP: ${isFastify ? 'Fastify (indícios OK)' : 'verificar headers'}`,
    );
    console.log(`Health: ${health.status} ${health.bodyPreview}\n`);

    const masterToken = await loginSigl();
    const camaraToken = await loginCamara();
    console.log('Tokens obtidos: SIGL master + câmara\n');

    const passed = [];
    const failed = [];
    const routes = [];

    for (const [routePath, methods] of Object.entries(openapi.paths)) {
        for (const method of Object.keys(methods)) {
            if (method === 'parameters') continue;
            routes.push({ method, routePath });
        }
    }

    for (const { method, routePath } of routes) {
        const token = pickToken(routePath, masterToken, camaraToken);
        const label = `${method.toUpperCase()} ${routePath}`;

        try {
            const res = await callRoute(method, routePath, token);
            const isServerError = res.status >= 500;
            const isJsonApi =
                PUBLIC_PATHS.has(routePath) ||
                routePath.startsWith('/api/docs') ||
                res.contentType.includes('json') ||
                res.contentType.includes('html');

            if (isServerError) {
                failed.push({
                    label,
                    reason: `HTTP ${res.status}`,
                    detail: res.bodyPreview,
                });
            } else if (!isJsonApi && res.status !== 404) {
                failed.push({
                    label,
                    reason: `Content-Type inesperado: ${res.contentType}`,
                    detail: res.bodyPreview,
                });
            } else {
                passed.push({ label, status: res.status });
            }
        } catch (error) {
            failed.push({
                label,
                reason: error.message,
                detail: '',
            });
        }
    }

    console.log(`Total de rotas: ${routes.length}`);
    console.log(`OK: ${passed.length}`);
    console.log(`Falhas: ${failed.length}\n`);

    if (failed.length) {
        console.log('--- Falhas ---');
        for (const f of failed.slice(0, 30)) {
            console.log(`  ${f.label} → ${f.reason}`);
            if (f.detail) console.log(`    ${f.detail}`);
        }
        if (failed.length > 30) {
            console.log(`  ... e mais ${failed.length - 30}`);
        }
        process.exit(1);
    }

    const statusHistogram = {};
    for (const p of passed) {
        statusHistogram[p.status] = (statusHistogram[p.status] ?? 0) + 1;
    }
    console.log('Distribuição de status HTTP:');
    for (const [status, count] of Object.entries(statusHistogram).sort()) {
        console.log(`  ${status}: ${count}`);
    }
    console.log('\nTodas as rotas responderam sem erro 5xx.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
