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
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: process.env.NODE_ENV !== 'production',
            bodyLimit: 10 * 1024 * 1024,
        }),
    );

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
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') ?? [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost',
        ],
        credentials: true,
    });
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

bootstrap();
