/** Postgres do `docker compose` no host (porta 5433). */
const LOCAL_DOCKER_DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/gestao_vereadores?schema=public';

/**
 * Mapeia variáveis injetadas pelo Vercel Storage (prefixo do projeto)
 * para os nomes usados pelo Prisma e pela aplicação.
 *
 * Com `SIGL_USE_LOCAL_DB=true`, usa sempre banco local (Docker Compose)
 * e ignora URLs da Vercel.
 */
export function resolveVercelDatabaseEnv(): void {
    if (process.env.SIGL_USE_LOCAL_DB === 'true') {
        const local =
            process.env.LOCAL_DATABASE_URL?.trim() ??
            process.env.DATABASE_URL?.trim() ??
            LOCAL_DOCKER_DATABASE_URL;
        process.env.DATABASE_URL = local;
        process.env.DIRECT_DATABASE_URL = local;
        return;
    }

    if (!process.env.DATABASE_URL?.trim()) {
        const pooled =
            process.env.gestaovereadores_PRISMA_DATABASE_URL?.trim() ??
            process.env.POSTGRES_PRISMA_URL?.trim() ??
            process.env.PRISMA_DATABASE_URL?.trim();
        if (pooled) {
            process.env.DATABASE_URL = pooled;
        }
    }

    if (!process.env.DIRECT_DATABASE_URL?.trim()) {
        const direct =
            process.env.gestaovereadores_POSTGRES_URL?.trim() ??
            process.env.POSTGRES_URL_NON_POOLING?.trim() ??
            process.env.POSTGRES_URL?.trim();
        if (direct) {
            process.env.DIRECT_DATABASE_URL = direct;
        }
    }

    if (
        !process.env.DIRECT_DATABASE_URL?.trim() &&
        process.env.DATABASE_URL?.trim()
    ) {
        process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
    }
}
