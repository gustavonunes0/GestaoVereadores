/**
 * Mapeia variáveis injetadas pelo Vercel Storage (prefixo do projeto)
 * para os nomes usados pelo Prisma e pela aplicação.
 *
 * Ordem: DATABASE_URL explícita vence; senão usa gestaovereadores_* / POSTGRES_*.
 */
export function resolveVercelDatabaseEnv(): void {
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
