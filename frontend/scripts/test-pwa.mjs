/**
 * Validação estática do PWA (manifest, SW, ícones, headers).
 * Uso: node scripts/test-pwa.mjs [baseUrl]
 */
const base = (process.argv[2] ?? 'http://127.0.0.1:8080').replace(/\/$/, '');

const checks = [];

function pass(name, detail) {
    checks.push({ name, ok: true, detail });
}

function fail(name, detail) {
    checks.push({ name, ok: false, detail });
}

async function fetchOk(path, opts = {}) {
    const res = await fetch(`${base}${path}`, opts);
    return { res, text: await res.text() };
}

try {
    const { res: indexRes, text: indexHtml } = await fetchOk('/');
    if (!indexRes.ok) fail('index.html', `HTTP ${indexRes.status}`);
    else {
        pass('index.html', `HTTP ${indexRes.status}`);
        if (indexHtml.includes('rel="manifest"')) pass('manifest link', 'presente no HTML');
        else fail('manifest link', 'ausente no HTML');
        if (indexHtml.includes('theme-color')) pass('theme-color meta', 'ok');
        else fail('theme-color meta', 'ausente');
    }

    const { res: manifestRes, text: manifestText } = await fetchOk('/manifest.webmanifest');
    if (!manifestRes.ok) fail('manifest.webmanifest', `HTTP ${manifestRes.status}`);
    else {
        const ct = manifestRes.headers.get('content-type') ?? '';
        pass('manifest.webmanifest', `HTTP ${manifestRes.status}`);
        if (ct.includes('manifest') || ct.includes('json')) pass('manifest content-type', ct);
        else fail('manifest content-type', ct || 'vazio');

        let manifest;
        try {
            manifest = JSON.parse(manifestText);
        } catch {
            fail('manifest JSON', 'parse error');
            manifest = null;
        }
        if (manifest) {
            const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
            for (const key of required) {
                if (manifest[key]) pass(`manifest.${key}`, 'ok');
                else fail(`manifest.${key}`, 'ausente');
            }
            if (manifest.display === 'standalone') pass('manifest.display', 'standalone');
            else fail('manifest.display', manifest.display);

            for (const icon of manifest.icons ?? []) {
                const iconRes = await fetch(`${base}/${icon.src.replace(/^\//, '')}`);
                if (iconRes.ok) pass(`icon ${icon.src}`, `${iconRes.status}`);
                else fail(`icon ${icon.src}`, `HTTP ${iconRes.status}`);
            }
        }
    }

    const { res: swRes, text: swText } = await fetchOk('/sw.js');
    if (!swRes.ok) fail('sw.js', `HTTP ${swRes.status}`);
    else {
        pass('sw.js', `HTTP ${swRes.status} (${swText.length} bytes)`);
        if (swText.includes('precache')) pass('sw precache', 'workbox precache presente');
        else fail('sw precache', 'precache não encontrado');
        if (swText.includes('push')) pass('sw push handler', 'ok');
        else fail('sw push handler', 'ausente');
        if (swText.includes('notificationclick')) pass('sw notificationclick', 'ok');
        else fail('sw notificationclick', 'ausente');
        const swAllowed = swRes.headers.get('service-worker-allowed');
        if (swAllowed === '/') pass('Service-Worker-Allowed', '/');
        else if (base.includes('8080')) {
            // nginx local configura o header
            if (swAllowed) pass('Service-Worker-Allowed', swAllowed);
            else fail('Service-Worker-Allowed', 'header ausente (nginx deve enviar /)');
        }
    }

    // Bundle principal precacheado
    const assetMatch = swText.match(/assets\/index-[A-Za-z0-9_-]+\.js/);
    if (assetMatch) {
        const assetPath = `/${assetMatch[0]}`;
        const assetRes = await fetch(`${base}${assetPath}`);
        if (assetRes.ok) pass('asset principal', assetPath);
        else fail('asset principal', `HTTP ${assetRes.status}`);
    }

    const failed = checks.filter((c) => !c.ok);
    console.log(`\nPWA test — ${base}\n`);
    for (const c of checks) {
        console.log(`${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`);
    }
    console.log(`\n${checks.length - failed.length}/${checks.length} ok`);
    process.exit(failed.length ? 1 : 0);
} catch (e) {
    console.error('Erro:', e.message || e);
    process.exit(1);
}
