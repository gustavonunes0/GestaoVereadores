import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { resolveVercelDatabaseEnv } from '../config/resolve-vercel-env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
    private readonly pool: Pool;

    constructor() {
        resolveVercelDatabaseEnv();

        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL não configurada');
        }

        const pool = new Pool({
            connectionString,
            ssl: connectionString.includes('sslmode=require')
                ? { rejectUnauthorized: false }
                : undefined,
        });

        super({ adapter: new PrismaPg(pool) });
        this.pool = pool;
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}
