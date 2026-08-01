import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { resolveVercelDatabaseEnv } from '../config/resolve-vercel-env';

const isDevelopment = process.env.NODE_ENV === 'development';

type PrismaLogOptions = Prisma.PrismaClientOptions & {
    log: [
        { emit: 'event'; level: 'query' },
        { emit: 'stdout'; level: 'warn' },
        { emit: 'stdout'; level: 'error' },
    ];
};

@Injectable()
export class PrismaService
    extends PrismaClient<PrismaLogOptions>
    implements OnModuleDestroy
{
    private readonly pool: Pool;
    private readonly logger: Logger;

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

        super({
            adapter: new PrismaPg(pool),
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'warn' },
                { emit: 'stdout', level: 'error' },
            ],
        });
        this.pool = pool;
        this.logger = new Logger(PrismaService.name);

        this.$on('query', (event: Prisma.QueryEvent) => {
            if (!isDevelopment) return;
            this.logger.debug(
                `${event.query} | params=${event.params} | ${event.duration}ms`,
            );
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}
