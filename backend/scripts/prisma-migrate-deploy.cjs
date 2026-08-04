/**
 * Aplica migrations pendentes no banco (produção / Vercel build).
 * Requer DIRECT_DATABASE_URL ou DATABASE_URL (ver resolve-vercel-env.cjs).
 *
 * Executa automaticamente no deploy Vercel (VERCEL=1), via npm run build.
 * Para aplicar manualmente no banco de produção:
 *   npm run prisma:deploy
 */
require('./resolve-vercel-env.cjs');

const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

const runOnVercel = process.env.VERCEL === '1';
const force = process.env.FORCE_MIGRATE_DEPLOY === '1';

if (!process.env.DATABASE_URL?.trim()) {
    const message =
        '[prisma-migrate-deploy] DATABASE_URL ausente — migrations ignoradas.';
    if (runOnVercel) {
        console.error(message);
        console.error(
            '  Configure DATABASE_URL (e DIRECT_DATABASE_URL) no projeto Vercel.',
        );
        process.exit(1);
    }
    console.warn(message);
    process.exit(0);
}

if (!runOnVercel && !force) {
    console.log(
        '[prisma-migrate-deploy] Ignorado localmente (use npm run prisma:deploy para produção).',
    );
    process.exit(0);
}

console.log(
    `[prisma-migrate-deploy] Aplicando migrations${runOnVercel ? ' (deploy Vercel)' : ' (manual)'}...`,
);

const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    env: process.env,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if ((result.status ?? 1) === 0) {
    console.log('[prisma-migrate-deploy] Migrations aplicadas com sucesso.');
}

process.exit(result.status ?? 1);
