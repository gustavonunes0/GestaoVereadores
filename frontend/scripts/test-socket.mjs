import { io } from 'socket.io-client';

async function login(baseUrl, tenantHost) {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Host': tenantHost,
        },
        body: JSON.stringify({ cpf: '99999999999', password: 'admin123' }),
    });
    if (!res.ok) throw new Error(`Login ${res.status}: ${await res.text()}`);
    return res.json();
}

function testSocket(socketBase, token, sessaoId) {
    return new Promise((resolve) => {
        const started = Date.now();
        const socket = io(`${socketBase}/sessao`, {
            auth: { token },
            query: { sessaoId },
            path: '/socket.io',
            transports: ['websocket'],
            timeout: 8000,
            reconnection: false,
        });

        const finish = (result) => {
            try {
                socket.disconnect();
            } catch {
                /* ignore */
            }
            resolve({ ...result, ms: Date.now() - started });
        };

        const timer = setTimeout(() => finish({ ok: false, error: 'timeout' }), 10000);

        socket.on('connect', () => {
            clearTimeout(timer);
            finish({
                ok: true,
                transport: socket.io.engine.transport.name,
                id: socket.id,
            });
        });

        socket.on('connect_error', (err) => {
            clearTimeout(timer);
            finish({ ok: false, error: err.message });
        });
    });
}

const tenantHost = 'baturite.stellarsolucoes.com.br';
const targets = [
    { label: 'backend-local', api: 'http://127.0.0.1:3000', socket: 'http://127.0.0.1:3000' },
    { label: 'vite-proxy', api: 'http://127.0.0.1:5173', socket: 'http://127.0.0.1:5173' },
    {
        label: 'producao-apibaturite',
        api: 'https://apibaturite.stellarsolucoes.com.br',
        socket: 'https://apibaturite.stellarsolucoes.com.br',
    },
];

for (const t of targets) {
    try {
        const auth = await login(t.api, tenantHost);
        const token = auth.access_token;
        const sessRes = await fetch(`${t.api}/api/legislative/sessoes-plenarias?limit=1`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Tenant-Host': tenantHost,
            },
        });
        const sessJson = await sessRes.json();
        const sessaoId = sessJson?.data?.[0]?.id ?? sessJson?.[0]?.id ?? 'test-sessao-id';
        const result = await testSocket(t.socket, token, sessaoId);
        console.log(JSON.stringify({ target: t.label, sessaoId, ...result }));
    } catch (e) {
        console.log(JSON.stringify({ target: t.label, ok: false, error: String(e.message || e) }));
    }
}
