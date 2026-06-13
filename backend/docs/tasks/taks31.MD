Quero substituir o motor HTTP padrão (Express) pelo Fastify no meu projeto NestJS para melhorar a performance de requisições por segundo.

Instruções para o Cursor:

Instalação de Dependências:
Instale os pacotes necessários para o Fastify funcionar com o NestJS executando o comando apropriado no terminal (ou me forneça o comando):

Bash
npm i --save @nestjs/platform-fastify
Atualização do src/main.ts:
Modifique o arquivo src/main.ts para usar o FastifyAdapter. Garanta que:

O NestFactory.create receba o tipo <NestFastifyApplication>.

O FastifyAdapter seja instanciado e passado como segundo argumento.

(Opcional) Configure o Fastify para escutar em 0.0.0.0 se houver problemas de acesso externo (comum em Docker/ambientes de nuvem).

Validação de Tipos e Middlewares:
Verifique se existem middlewares globais ou interceptores que dependem de objetos específicos do Express (como req: Request ou res: Response do Express) e me avise se precisar adaptar algo para o padrão do Fastify.

Como o código final do seu main.ts deve ficar:
O Cursor provavelmente vai gerar algo muito parecido com o código abaixo para o seu arquivo principal:

TypeScript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Inicializa o NestJS usando o adaptador do Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }) // Ativa o log nativo do Fastify (opcional)
  );

  // 2. Configura a porta e o host (0.0.0.0 ajuda a evitar problemas de rede)
  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
⚠️ Três pontos de atenção que você pode pedir para o Cursor checar:
Se o seu projeto já for grande, adicione este complemento na task do Cursor:

"Verifique os Guards/Interceptors:" Se você usa autenticação (Passport, JWT), o Cursor precisa garantir que a leitura dos Headers do Fastify (que usa request.headers) não quebre caso estivesse usando alguma propriedade exclusiva do Express.

"Cheque o upload de arquivos:" Se você usa o FileInterceptor (que usa Multer por baixo dos panos), ele não funciona nativamente com o Fastify. Peça ao Cursor: "Se houver upload de arquivos, adapte para usar o pacote fastify-multipart ou @fastify/multipart".

"Adapte o Swagger:" Se você usa documentação Swagger, a inicialização dele não muda quase nada, mas é bom o Cursor validar se o SwaggerModule.setup continua funcionando corretamente.