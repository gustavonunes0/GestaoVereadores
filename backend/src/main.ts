import { createApp } from './create-app';

async function bootstrap() {
    const app = await createApp();

    const port = Number(process.env.PORT ?? 3000);
    const host = process.env.HOST ?? '0.0.0.0';
    await app.listen(port, host);

    const url = await app.getUrl();
    console.log(`Consenso SGL API em ${url}/api`);
    console.log(`Swagger em ${url}/api/docs`);
}

bootstrap();
