import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'path';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors.config';
import { resolveVercelDatabaseEnv } from './config/resolve-vercel-env';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

function validateRuntimeEnv(): void {
    resolveVercelDatabaseEnv();

    const missing: string[] = [];
    if (!process.env.DATABASE_URL?.trim()) {
        missing.push(
            'DATABASE_URL (ou gestaovereadores_PRISMA_DATABASE_URL)',
        );
    }
    if (!process.env.JWT_SECRET?.trim()) missing.push('JWT_SECRET');
    if (missing.length > 0) {
        throw new Error(
            `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
        );
    }
}

async function bootstrap() {
    validateRuntimeEnv();

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: process.env.NODE_ENV !== 'production',
            bodyLimit: 10 * 1024 * 1024,
        }),
    );

    app.enableCors(buildCorsOptions() as Parameters<NestFastifyApplication['enableCors']>[0]);

    await app.register(multipart, {
        limits: { fileSize: 10 * 1024 * 1024 },
    });

    if (!process.env.VERCEL) {
        await app.register(fastifyStatic, {
            root: join(process.cwd(), 'uploads'),
            prefix: '/uploads/',
            decorateReply: false,
        });
    }

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalInterceptors(new LoggingInterceptor());

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Consenso SGL API')
        .setDescription('Consenso SGL — Atividade Legislativa')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);

    const url = await app.getUrl();
    console.log(`Consenso SGL API em ${url}/api`);
    console.log(`Swagger em ${url}/api/docs`);
}

bootstrap().catch((error: unknown) => {
    console.error('Falha ao iniciar a API:', error);
    process.exit(1);
});
