/**
 * Aplica migrations no banco apontado por DATABASE_URL (produção manual).
 * Carrega variáveis do .env / Vercel Storage via resolve-vercel-env.cjs.
 */
process.env.FORCE_MIGRATE_DEPLOY = '1';
require('./prisma-migrate-deploy.cjs');
