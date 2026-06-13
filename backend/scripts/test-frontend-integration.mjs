/**
 * Testa integração frontend ↔ backend: endpoints usados pelas páginas React.
 * Valida resposta JSON, status esperado e formato paginado (data + meta).
 */
const BASES = [
    { label: 'API direta', base: process.env.API_BASE ?? 'http://localhost:3000/api' },
    { label: 'Proxy nginx', base: process.env.PROXY_BASE ?? 'http://localhost:8080/api' },
];

const CAMARA = {
    email: 'admin@camara.teste',
    password: 'camara123',
    tenantCnpj: '00000000000191',
};

const SIGL = { username: 'admin', password: 'admin' };

/** Endpoints GET usados pelo frontend com login Câmara. */
const CAMARA_MODULES = [
    ['auth', 'GET /auth/me', '/auth/me', false, 200],
    ['dominios', 'GET /dominios', '/dominios', false, 200],
    ['dashboard', 'GET parlamentares (total)', '/legislative/parlamentares?limit=1&page=1', true, 200],
    ['dashboard', 'GET materias (total)', '/legislative/materias?limit=1&page=1', true, 200],
    ['dashboard', 'GET sessoes (total)', '/legislative/sessoes-plenarias?limit=1&page=1', true, 200],
    ['legislaturas', 'GET list', '/legislative/legislaturas?limit=50', true, 200],
    ['parlamentares', 'GET list', '/legislative/parlamentares?limit=100', true, 200],
    ['parlamentares', 'GET partidos', '/legislative/partidos-politicos?limit=50', true, 200],
    ['comissoes', 'GET list', '/legislative/comissoes?limit=100', true, 200],
    ['frentes', 'GET list', '/legislative/frentes-parlamentares?limit=100', true, 200],
    ['mesa-diretora', 'GET list', '/legislative/mesa-diretora?limit=100', true, 200],
    ['materias', 'GET list', '/legislative/materias?limit=100', true, 200],
    ['sessoes', 'GET list', '/legislative/sessoes-plenarias?limit=100', true, 200],
    ['agenda', 'GET list', '/legislative/agenda-legislativa?limit=100', true, 200],
    ['normas', 'GET list', '/normas?limit=100', true, 200],
    ['autores', 'GET guest-users', '/guest-users?limit=100', true, 200],
];

const SIGL_MODULES = [
    ['usuarios', 'GET list', '/usuarios?limit=50', true, 200],
    ['atos', 'GET list (SIGL only)', '/atos?limit=100', true, 200],
];

async function login(base, kind) {
    const path = kind === 'sigl' ? '/auth/login' : '/auth/login-camara';
    const body =
        kind === 'sigl'
            ? SIGL
            : { email: CAMARA.email, password: CAMARA.password, tenantCnpj: CAMARA.tenantCnpj };
    const res = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${kind} login falhou (${res.status}): ${text.slice(0, 120)}`);
    }
    const data = await res.json();
    return data.access_token;
}

async function call(base, token, path, expectPaginated = false, expectStatus = 200) {
    const res = await fetch(`${base}${path}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
    const ct = res.headers.get('content-type') ?? '';
    let body = null;
    let parseError = null;
    if (ct.includes('json')) {
        try {
            body = await res.json();
        } catch (e) {
            parseError = e.message;
        }
    } else if (res.status !== 204) {
        parseError = `content-type: ${ct || 'vazio'}`;
    }

    const issues = [];
    if (res.status !== expectStatus) issues.push(`status ${res.status} (esperado ${expectStatus})`);
    if (parseError) issues.push(`JSON inválido: ${parseError}`);
    if (expectPaginated && body) {
        if (!Array.isArray(body.data)) issues.push('falta campo data[]');
        if (!body.meta || typeof body.meta.total !== 'number') issues.push('falta meta.total');
    }

    return {
        ok: issues.length === 0,
        status: res.status,
        issues,
        preview: body ? JSON.stringify(body).slice(0, 100) : '',
    };
}

async function testBase({ label, base }) {
    console.log(`\n── ${label} (${base}) ──`);

    let camaraToken;
    let siglToken;
    try {
        camaraToken = await login(base, 'camara');
        siglToken = await login(base, 'sigl');
    } catch (e) {
        console.log(`  ✗ Login: ${e.message}`);
        return { label, passed: 0, failed: 1, results: [] };
    }

    const results = [];

    for (const [module, desc, path, expectPaginated, expectStatus] of CAMARA_MODULES) {
        const r = await call(base, camaraToken, path, expectPaginated, expectStatus);
        const icon = r.ok ? '✓' : '✗';
        const detail = r.ok ? `${r.status}` : `${r.status} — ${r.issues.join(', ')}`;
        console.log(`  ${icon} [${module}] ${desc}: ${detail}`);
        results.push({ module, desc, ...r });
    }

    for (const [module, desc, path, expectPaginated, expectStatus] of SIGL_MODULES) {
        const r = await call(base, siglToken, path, expectPaginated, expectStatus);
        const icon = r.ok ? '✓' : '✗';
        const detail = r.ok ? `${r.status}` : `${r.status} — ${r.issues.join(', ')}`;
        console.log(`  ${icon} [${module}] ${desc}: ${detail}`);
        results.push({ module, desc, ...r });
    }

    const passed = results.filter((r) => r.ok).length;
    const failed = results.length - passed;
    return { label, passed, failed, results };
}

async function main() {
    console.log('=== Consenso SGL — teste de integração frontend ↔ backend ===');

    const summaries = [];
    for (const b of BASES) {
        summaries.push(await testBase(b));
    }

    console.log('\n=== Resumo ===');
    let totalFailed = 0;
    for (const s of summaries) {
        console.log(`  ${s.label}: ${s.passed} ok, ${s.failed} falha(s)`);
        totalFailed += s.failed;
    }

    if (totalFailed > 0) {
        console.log('\nFalhas detalhadas:');
        for (const s of summaries) {
            for (const r of s.results.filter((x) => !x.ok)) {
                console.log(`  [${s.label}] ${r.module} / ${r.desc}: ${r.status} ${r.issues.join(', ')}`);
                if (r.preview) console.log(`    → ${r.preview}`);
            }
        }
        process.exit(1);
    }

    console.log('\nTodos os módulos do frontend responderam corretamente.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
