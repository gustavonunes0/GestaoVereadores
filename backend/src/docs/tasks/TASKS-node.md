# Debug Tasks — Node.js / NestJS / Prisma / Fastify

> Plano de depuração.
> Padrão CQRS opcional — ajustar conforme arquitetura do projeto.

---

## TASK-01 — Habilitar Query Logging no Prisma

**Objetivo:** Capturar todas as queries SQL geradas pelo Prisma no console para identificar queries lentas e N+1.

**Arquivos-alvo:**
- `src/database/prisma.service.ts` (ou onde o `PrismaClient` é instanciado)
- `.env.development`

**Ações:**

1. Localizar a instância do `PrismaClient` e adicionar o log condicional:
```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : ['warn', 'error'],
    });

    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error — evento de query não tipado por padrão
      this.$on('query', (e: { query: string; params: string; duration: number }) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Params: ${e.params}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }
}
```

2. Em `.env.development`, confirmar:
```env
NODE_ENV=development
```

3. Rodar a aplicação e verificar o console:
```bash
npm run start:dev
```

**Critério de sucesso:** Cada query SQL aparece no console com seus parâmetros e tempo de execução em modo Development.

---

## TASK-02 — Instalar e Configurar clinic.js ou @fastify/under-pressure para Profiling

**Objetivo:** Medir tempo de resposta por rota e identificar gargalos no Fastify.

**Arquivos-alvo:**
- `package.json`
- `src/main.ts`

**Ações:**

1. Instalar os pacotes:
```bash
npm install @fastify/under-pressure
npm install --save-dev clinic autocannon
```

2. Registrar o `under-pressure` no adaptador Fastify do NestJS em `src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import underPressure from '@fastify/under-pressure';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  if (process.env.NODE_ENV === 'development') {
    app.register(underPressure, {
      maxEventLoopDelay: 1000,
      maxHeapUsedBytes: 900_000_000,
      maxRssBytes: 900_000_000,
      pressureHandler: (_req, _rep, type, value) => {
        console.warn(`[under-pressure] ${type}: ${value}`);
      },
    });
  }

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

3. Para profiling de CPU/event loop em desenvolvimento:
```bash
npx clinic doctor -- node dist/main.js
npx autocannon -c 10 -d 10 http://localhost:3000/rota-suspeita
```

**Critério de sucesso:** `under-pressure` bloqueia requests quando o event loop estiver sobrecarregado; `clinic doctor` gera relatório HTML com hotspots de CPU.

---

## TASK-03 — Auditar e Corrigir N+1 nas Queries Prisma

**Objetivo:** Identificar resolvers/services que disparam N+1 queries e converter para `include` seletivo ou `select` com projeção.

**Arquivos-alvo:**
- `src/**/**.service.ts` — todos os services com chamadas ao Prisma
- `src/**/**.repository.ts` — repositórios (se existirem)

**Ações:**

1. Com o logging da TASK-01 ativo, chamar cada endpoint de listagem e contar quantas queries são disparadas. Mais de 1 query para retornar uma lista simples indica N+1.

2. Para cada N+1 encontrado, substituir o acesso em loop por `include` no Prisma:
```typescript
// ANTES (N+1 — busca demand e depois acessa teacher em loop):
const demands = await this.prisma.demand.findMany();
for (const d of demands) {
  const teacher = await this.prisma.user.findUnique({ where: { id: d.teacherId } });
}

// DEPOIS (1 query com include):
const demands = await this.prisma.demand.findMany({
  include: {
    teacher: {
      select: { id: true, name: true, email: true }, // só o necessário
    },
  },
});
```

3. Para listagens onde apenas alguns campos são necessários, usar `select` em vez de `include` para evitar over-fetching:
```typescript
const demands = await this.prisma.demand.findMany({
  select: {
    id: true,
    status: true,
    teacher: { select: { name: true } },
    discipline: { select: { name: true } },
  },
});
```

4. Rodar os endpoints novamente e confirmar que cada listagem dispara apenas 1 query.

**Critério de sucesso:** Nenhum endpoint de listagem dispara mais de 1 query SQL (validar via log da TASK-01).

---

## TASK-04 — Adicionar Índices nas Foreign Keys Críticas via Prisma Migrate

**Objetivo:** Reduzir table scans adicionando índices nas colunas de FK e status mais consultadas.

**Arquivos-alvo:**
- `prisma/schema.prisma`

**Ações:**

1. Identificar as FKs e colunas de filtro mais usadas nas queries (via logs da TASK-01).

2. Adicionar `@@index` no `schema.prisma` para cada relação crítica. Exemplo para um domínio equivalente:
```prisma
model Demand {
  id           String   @id @default(uuid())
  disciplineId String
  teacherId    String?
  status       String
  createdAt    DateTime @default(now())

  discipline Discipline @relation(fields: [disciplineId], references: [id])
  teacher    User?      @relation(fields: [teacherId], references: [id])

  @@index([disciplineId])
  @@index([teacherId])
  @@index([status])
}

model Question {
  id       String @id @default(uuid())
  demandId String
  status   String

  demand Demand @relation(fields: [demandId], references: [id])

  @@index([demandId])
  @@index([status])
}
```

3. Gerar e aplicar a migration:
```bash
npx prisma migrate dev --name add_performance_indexes
```

4. Inspecionar o SQL gerado em `prisma/migrations/*/migration.sql` para confirmar os `CREATE INDEX`.

**Critério de sucesso:** Migration aplicada com sucesso; índices visíveis via `\d nome_tabela` no psql ou equivalente no banco usado.

---

## TASK-05 — Adicionar Paginação nas Listagens

**Objetivo:** Evitar full scans em tabelas grandes com `skip`/`take` e cursor-based pagination.

**Arquivos-alvo:**
- `src/**/**.service.ts` — métodos `findAll`, `findMany` sem paginação
- `src/**/**.controller.ts` — controllers correspondentes
- `src/common/dto/pagination.dto.ts` — criar se não existir

**Ações:**

1. Criar o DTO de paginação em `src/common/dto/pagination.dto.ts`:
```typescript
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;

  get skip() {
    return (this.page - 1) * this.pageSize;
  }
}
```

2. Criar o tipo de resposta paginada em `src/common/types/paged-result.type.ts`:
```typescript
export interface PagedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

3. Aplicar nos services:
```typescript
async findAll(pagination: PaginationDto): Promise<PagedResult<DemandDto>> {
  const [data, total] = await this.prisma.$transaction([
    this.prisma.demand.findMany({
      skip: pagination.skip,
      take: pagination.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.demand.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}
```

4. Atualizar os controllers para receber `@Query() pagination: PaginationDto`.

**Critério de sucesso:** `GET /demand?page=1&pageSize=20` retorna 20 itens com objeto `meta` de paginação; sem `findMany()` sem `take` no código.

---

## TASK-06 — Auditar uso de async/await e eliminar Promises bloqueantes

**Objetivo:** Eliminar `Promise` não aguardadas, `await` em loop e callbacks síncronos que bloqueiam o event loop do Node.js.

**Arquivos-alvo:**
- `src/**/*.service.ts`
- `src/**/*.repository.ts`
- `src/**/*.handler.ts`

**Ações:**

1. Buscar padrões problemáticos no projeto:
```bash
# await dentro de loop (causa N+1 e bloqueia event loop)
grep -rn "for.*await\|await.*forEach" --include="*.ts" src/

# Promises não tratadas
grep -rn "\.then(" --include="*.ts" src/ | grep -v "\.catch\|\.finally"

# new Promise desnecessário (anti-pattern)
grep -rn "new Promise" --include="*.ts" src/
```

2. Para `await` em loop, substituir por `Promise.all`:
```typescript
// ANTES (sequencial — bloqueia):
for (const id of ids) {
  await this.prisma.question.update({ where: { id }, data: { status: 'approved' } });
}

// DEPOIS (paralelo):
await Promise.all(
  ids.map(id =>
    this.prisma.question.update({ where: { id }, data: { status: 'approved' } }),
  ),
);
```

3. Para operações que devem ser atômicas, usar `$transaction` do Prisma:
```typescript
await this.prisma.$transaction(
  ids.map(id =>
    this.prisma.question.update({ where: { id }, data: { status: 'approved' } }),
  ),
);
```

4. Garantir que todos os métodos dos controllers e services retornem `Promise<T>` e sejam marcados como `async`.

**Critério de sucesso:** Nenhum `await` dentro de `for`/`forEach`; zero Promises não tratadas; nenhum `new Promise` desnecessário.

---

## TASK-07 — Verificar Escopo dos Providers NestJS (Singleton vs Request)

**Objetivo:** Garantir que providers com estado por request não sejam instanciados como Singleton, evitando vazamento de contexto entre requests.

**Arquivos-alvo:**
- `src/**/*.module.ts` — todos os módulos
- `src/**/*.service.ts` — services com estado (ex: usuário autenticado, contexto de tenant)

**Ações:**

1. Verificar se algum service armazena estado de request (ex: `userId`, `tenantId`) em propriedade da classe:
```typescript
// PROBLEMÁTICO — singleton com estado de request:
@Injectable()
export class DemandService {
  private currentUserId: string; // ← estado de request em singleton!
}
```

2. Para services que precisam de contexto de request, usar `REQUEST` scope:
```typescript
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

@Injectable({ scope: Scope.REQUEST })
export class DemandService {
  constructor(@Inject(REQUEST) private readonly request: FastifyRequest) {}

  get currentUserId(): string {
    return this.request.user?.id;
  }
}
```

3. Confirmar que o `PrismaService` é `Singleton` (correto — é thread-safe e gerencia o pool de conexões).

4. Buscar por injeção de `REQUEST`-scoped providers em `Singleton` providers, o que causa erro em runtime:
```bash
grep -rn "scope: Scope.REQUEST" --include="*.ts" src/
```
Para cada um encontrado, garantir que os providers que os injetam também sejam `REQUEST`-scoped ou usem factory.

**Critério de sucesso:** Nenhum service `Singleton` armazena estado de request; `PrismaService` permanece Singleton; sem `ScopeWarning` nos logs de startup.

---

## TASK-08 — Configurar Timeout de Query e Tratamento de Erros do Prisma

**Objetivo:** Definir timeout explícito para queries e retornar respostas HTTP adequadas para erros de banco (timeout, constraint violation, not found).

**Arquivos-alvo:**
- `src/database/prisma.service.ts`
- `src/common/filters/prisma-exception.filter.ts` — criar se não existir
- `src/main.ts`

**Ações:**

1. Configurar timeout global nas queries do Prisma:
```typescript
// Em PrismaService, adicionar middleware de timeout:
this.$use(async (params, next) => {
  const timeout = 30_000; // 30 segundos
  return Promise.race([
    next(params),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeout),
    ),
  ]);
});
```

2. Criar o filtro de exceções do Prisma em `src/common/filters/prisma-exception.filter.ts`:
```typescript
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FastifyReply } from 'fastify';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);

    const errorMap: Record<string, { status: number; message: string }> = {
      P2002: { status: HttpStatus.CONFLICT,       message: 'Registro duplicado.' },
      P2025: { status: HttpStatus.NOT_FOUND,      message: 'Registro não encontrado.' },
      P2003: { status: HttpStatus.BAD_REQUEST,    message: 'Violação de chave estrangeira.' },
      P2034: { status: HttpStatus.SERVICE_UNAVAILABLE, message: 'Conflito de concorrência. Tente novamente.' },
    };

    const mapped = errorMap[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno no banco de dados.',
    };

    reply.status(mapped.status).send({ mensagem: mapped.message, code: exception.code });
  }
}
```

3. Registrar o filtro globalmente em `src/main.ts`:
```typescript
app.useGlobalFilters(new PrismaExceptionFilter());
```

**Critério de sucesso:** Query que ultrapasse 30s retorna HTTP 504; violação de unique constraint retorna HTTP 409 com mensagem em pt-BR; nenhum erro do Prisma retorna HTTP 500 genérico.

---

## TASK-09 — Adicionar Fallback de E-mail com Fila de Reenvio

**Objetivo:** Evitar perda silenciosa de e-mails de convite/ativação quando o SMTP falhar.

**Arquivos-alvo:**
- `src/mail/mail.service.ts`
- `prisma/schema.prisma` — adicionar modelo `PendingEmail`
- `src/mail/mail-retry.job.ts` — criar job de reenvio

**Ações:**

1. Adicionar o modelo no `schema.prisma`:
```prisma
model PendingEmail {
  id          String    @id @default(uuid())
  to          String
  subject     String
  htmlBody    String    @db.Text
  attempts    Int       @default(0)
  sent        Boolean   @default(false)
  lastAttemptAt DateTime?
  createdAt   DateTime  @default(now())

  @@index([sent, attempts])
}
```

2. Rodar:
```bash
npx prisma migrate dev --name add_pending_email
```

3. No `MailService`, envolver o envio em try/catch e salvar em `PendingEmail` em caso de falha:
```typescript
async send(to: string, subject: string, html: string): Promise<void> {
  try {
    await this.transporter.sendMail({ from, to, subject, html });
  } catch (err) {
    this.logger.warn(`Falha ao enviar e-mail para ${to}. Enfileirando para reenvio.`);
    await this.prisma.pendingEmail.create({
      data: { to, subject, htmlBody: html },
    });
  }
}
```

4. Criar um `@Cron` job para reenvio (usando `@nestjs/schedule`):
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MailRetryJob {
  private readonly logger = new Logger(MailRetryJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingEmails() {
    const pending = await this.prisma.pendingEmail.findMany({
      where: { sent: false, attempts: { lt: 3 } },
    });

    for (const email of pending) {
      try {
        await this.mailService.sendRaw(email.to, email.subject, email.htmlBody);
        await this.prisma.pendingEmail.update({
          where: { id: email.id },
          data: { sent: true },
        });
      } catch {
        await this.prisma.pendingEmail.update({
          where: { id: email.id },
          data: { attempts: { increment: 1 }, lastAttemptAt: new Date() },
        });
      }
    }
  }
}
```

5. Registrar `ScheduleModule.forRoot()` no `AppModule` e o `MailRetryJob` como provider.

**Critério de sucesso:** Falha de SMTP não lança exceção na camada de negócio; e-mail é salvo em `PendingEmail` e reenviado automaticamente a cada 5 minutos.

---

## TASK-10 — Health Checks para banco e serviços externos

**Objetivo:** Detectar falha de infraestrutura no endpoint `/health` antes que o usuário seja afetado.

**Arquivos-alvo:**
- `package.json`
- `src/health/health.module.ts` — criar se não existir
- `src/main.ts`

**Ações:**

1. Instalar o pacote:
```bash
npm install @nestjs/terminus
```

2. Criar `src/health/health.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}
```

3. Criar o indicador Prisma em `src/health/prisma.health.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Prisma falhou', this.getStatus(key, false));
    }
  }
}
```

4. Criar o controller em `src/health/health.controller.ts`:
```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prisma.isHealthy('database'),
    ]);
  }
}
```

5. Adicionar `HealthModule` ao `AppModule`.

**Critério de sucesso:** `GET /health` retorna JSON com status separado para `database`; falha na conexão retorna `503 Service Unavailable`.

---

## TASK-11 — Revisar tabelas e campos não utilizados no schema Prisma

**Objetivo:** Identificar e remover modelos, campos e relações obsoletos do `schema.prisma` que acumulam overhead de storage, índices desnecessários e confusão de manutenção.

**Arquivos-alvo:**
- `prisma/schema.prisma`
- `src/**/*.service.ts`
- `src/**/*.repository.ts`
- `src/**/*.dto.ts`

**Ações:**

### Etapa 1 — Mapear uso real de cada modelo

Gerar a lista de todos os modelos do schema e cruzar com as ocorrências no código TypeScript:

```bash
# Listar todos os modelos definidos no schema
grep "^model " prisma/schema.prisma | awk '{print $2}'

# Para cada modelo, contar referências no código-fonte (exemplo para "AuditLog"):
grep -rn "prisma\.auditLog\|AuditLog" --include="*.ts" src/ | wc -l
```

Montar uma tabela com o resultado:

| Modelo | Referências no código | Decisão |
|---|---|---|
| `AuditLog` | 0 | candidato a remoção |
| `TempImport` | 0 | candidato a remoção |
| `Demand` | 47 | manter |

### Etapa 2 — Mapear campos não utilizados por modelo

Para cada modelo ativo, verificar campos que nunca aparecem em `select`, `where`, `orderBy` ou DTOs:

```bash
# Listar campos de um modelo no schema
grep -A 50 "^model Demand {" prisma/schema.prisma | grep -v "^}" | grep -v "^$"

# Verificar uso de um campo específico no código
grep -rn "\.legacyCode\|legacyCode:" --include="*.ts" src/ | wc -l
```

Campos com 0 ocorrências são candidatos a remoção.

### Etapa 3 — Remover modelos obsoletos

Para cada modelo confirmado como não utilizado:

1. Confirmar que não há dados relevantes na tabela em produção:
```bash
npx prisma studio
# ou via query direta:
npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "AuditLog";'
```

2. Remover o modelo do `schema.prisma` e qualquer service, DTO ou import relacionado.

3. Gerar e inspecionar a migration:
```bash
npx prisma migrate dev --name remove_unused_tables
```

### Etapa 4 — Remover campos obsoletos

Para cada campo confirmado como não utilizado:

1. Remover do modelo no `schema.prisma` e do DTO correspondente.

2. Confirmar ausência de referências residuais:
```bash
grep -rn "nomeDoCampo" --include="*.ts" src/
```

3. Gerar a migration:
```bash
npx prisma migrate dev --name remove_unused_fields_<modelo>
```

### Etapa 5 — Revisar índices órfãos

Após remoções, mapear todos os índices do schema e cruzar com o uso real no código antes de decidir o que remover.

**5.1 — Listar todos os índices:**
```bash
grep -n "@@index\|@@unique\|@unique" prisma/schema.prisma
```

**5.2 — Para cada índice encontrado, verificar se os campos aparecem em queries:**
```bash
# Exemplo para @@index([teacherId]):
grep -rn "teacherId" --include="*.ts" src/ | grep -E "where|orderBy|findMany|findFirst"
```

**5.3 — Montar a tabela de decisão antes de qualquer remoção:**

| Modelo | Índice | Campo(s) | Aparece em where/orderBy | Decisão |
|---|---|---|---|---|
| `Demand` | `@@index([teacherId])` | `teacherId` | sim — `DemandService.findByTeacher` | manter |
| `Demand` | `@@index([legacyCode])` | `legacyCode` | não | remover |
| `Question` | `@@index([status, demandId])` | `status`, `demandId` | sim — `QuestionService.findApproved` | manter |
| `User` | `@@index([importBatchId])` | `importBatchId` | não | remover |

**5.4 — Somente após revisão e aprovação da tabela, remover do `schema.prisma` apenas os marcados como "remover" e gerar a migration:**
```bash
npx prisma migrate dev --name remove_orphan_indexes
```

### Etapa 6 — Validação pós-limpeza

```bash
npx prisma validate
npx prisma generate
npm run build
# Aplicar em staging antes de produção:
npx prisma migrate deploy
```

**Critério de sucesso:**
- Zero modelos no `schema.prisma` sem referências no código TypeScript
- Zero campos em modelos ativos ausentes de qualquer `select`, `where`, `orderBy` ou DTO
- `npx prisma validate` e `npm run build` sem erros
- Migrations de remoção aplicadas em staging sem regressão funcional

---

## Ordem de Execução Recomendada

```
TASK-01 → TASK-02   (visibilidade primeiro — log e profiling)
TASK-06 → TASK-07   (corrigir bugs de async e scope antes de otimizar)
TASK-03 → TASK-04   (N+1 e índices)
TASK-05             (paginação)
TASK-08             (timeout e filtro de erros)
TASK-09             (resiliência — fallback de e-mail)
TASK-10             (health checks)
TASK-11             (limpeza de schema — rodar por último, após estabilizar o resto)
```

---

## Validação Final

```bash
# Build sem erros
npm run build

# Iniciar em desenvolvimento
npm run start:dev

# Conferir health
curl http://localhost:3000/health

# Conferir paginação
curl "http://localhost:3000/demand?page=1&pageSize=20"

# Profiling de carga
npx autocannon -c 20 -d 15 http://localhost:3000/demand

# Schema limpo
npx prisma validate
```

Verificar:
- [ ] `/health` retorna `{ status: "ok" }` com indicador `database: up`
- [ ] Logs no console mostram queries SQL sem N+1 aparentes
- [ ] Listagens retornam objeto `meta` com `total`, `page`, `totalPages`
- [ ] Erro de `unique constraint` do Prisma retorna HTTP 409, não 500
- [ ] `npx prisma validate` sem erros após limpeza do schema
- [ ] Zero modelos ou campos sem referências no código TypeScript
