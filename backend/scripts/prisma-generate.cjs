/**
 * Gera o Prisma Client com tolerância a EPERM no Windows.
 * O DLL query_engine fica bloqueado enquanto o backend (nest) está rodando
 * ou quando o OneDrive sincroniza node_modules/.prisma.
 */
require('./resolve-vercel-env.cjs');

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const enginePath = path.join(
    root,
    'node_modules',
    '.prisma',
    'client',
    'query_engine-windows.dll.node',
);

function hasGeneratedClient() {
    return fs.existsSync(enginePath);
}

function runGenerate() {
    return spawnSync('npx', ['prisma', 'generate'], {
        cwd: root,
        shell: true,
        encoding: 'utf8',
    });
}

const result = runGenerate();

if (result.status === 0) {
    process.exit(0);
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const isEperm =
    output.includes('EPERM') ||
    output.toLowerCase().includes('operation not permitted');

if (isEperm && hasGeneratedClient()) {
    console.warn(
        '\n[prisma-generate] AVISO: query_engine em uso — generate ignorado.',
    );
    console.warn(
        '  Pare o backend (Ctrl+C no terminal do npm run start:dev) e rode:',
    );
    console.warn('  npm run prisma:generate\n');
    process.exit(0);
}

if (isEperm) {
    console.error(
        '\n[prisma-generate] ERRO: não foi possível gerar o Prisma Client.',
    );
    console.error(
        '  Pare o backend e qualquer Prisma Studio, depois rode:',
    );
    console.error('  npm run prisma:generate\n');
}

process.exit(result.status || 1);
