import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

if (!process.env.DIRECT_DATABASE_URL?.trim() && process.env.DATABASE_URL?.trim()) {
    process.env.DIRECT_DATABASE_URL = process.env.DATABASE_URL;
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed:
            'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
});
