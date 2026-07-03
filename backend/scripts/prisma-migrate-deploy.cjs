/**
 * Aplica migrations pendentes no banco (produção / Vercel build).
 * Requer DIRECT_DATABASE_URL ou DATABASE_URL (ver resolve-vercel-env.cjs).
 */
require('./resolve-vercel-env.cjs');

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

if (!process.env.DATABASE_URL?.trim()) {
    console.warn('[prisma-migrate-deploy] DATABASE_URL ausente — migrations ignoradas.');
    process.exit(0);
}

const runOnVercel = process.env.VERCEL === '1';
const force = process.env.FORCE_MIGRATE_DEPLOY === '1';

if (!runOnVercel && !force) {
    console.log(
        '[prisma-migrate-deploy] Ignorado (defina VERCEL=1 ou FORCE_MIGRATE_DEPLOY=1 para aplicar).',
    );
    process.exit(0);
}

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

process.exit(result.status ?? 1);
