# Backend — GestaoVereadores (SIGL)

API NestJS multi-tenant para gestão legislativa de câmaras municipais brasileiras.

---

## Visão geral

| Item | Valor |
|------|-------|
| Nome do pacote | `gestao-vereadores-api` |
| Framework | NestJS 11 + Fastify |
| ORM | Prisma 6 |
| Banco | PostgreSQL 16 |
| Auth | JWT (Passport) |
| Realtime | Socket.io (`@nestjs/websockets`) |
| Docs interativos | Swagger em `/api/docs` |
| Prefixo global | `/api` |

### Infraestrutura (Docker)

```
postgres  → localhost:5433  (DB: gestao_vereadores)
api       → localhost:3000  (/api)
frontend  → localhost:8080  (build nginx; dev usa Vite :5173)
```

Variáveis principais: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`.

---

## Estrutura de pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Fonte de verdade do banco
│   ├── migrations/        # Nunca alterar migrations já aplicadas
│   └── seed.ts
├── docs/                  # Specs, tasks, ADRs, reviews
└── src/
    ├── main.ts            # Bootstrap Fastify + Swagger + CORS
    ├── app.module.ts      # Guards globais + imports de módulos
    ├── auth/              # Login JWT, guards, roles
    ├── identidade/        # User, Tenant, TenantUser, TenantPartner
    ├── legislativo/       # Domínio principal (matérias, sessões, etc.)
    ├── controle-juridico/ # Normas
    ├── atos-administrativos/
    ├── relatorios/
    ├── common/            # Guards, decorators, dominios, interceptors
    ├── health/
    └── prisma/            # PrismaService global
```

---

## Arquitetura por submódulo

Padrão **Clean Architecture** em cada feature:

```
src/<domínio>/<submódulo>/
├── application/
│   ├── controllers/     # HTTP — só delega para use-cases
│   ├── dto/             # class-validator
│   ├── use-cases/       # Orquestração
│   ├── view-models/     # Resposta HTTP (sem campos internos)
│   └── errors/
├── domain/
│   ├── entities/        # SEM @prisma/client nem @nestjs/*
│   ├── enums/
│   ├── repositories/    # Contratos (abstract class)
│   └── services/        # Regras de domínio puras
└── infra/
    └── prisma/          # Implementação dos repositórios
```

**Fluxo:** `controller → use-case → domain service → prisma repository`

---

## Guards e segurança (globais)

Registrados em `app.module.ts`:

| Guard | Função |
|-------|--------|
| `JwtAuthGuard` | Exige JWT (exceto rotas `@Public()`) |
| `TenantGuard` | Injeta `tenantId` do token; bloqueia cross-tenant |
| `RolesGuard` | Roles globais do sistema |
| `TenantRolesGuard` | `@TenantRoles(...)` por rota (STAFF, ADMIN, etc.) |
| `ThrottlerGuard` | Rate limit (ex.: login 5/min) |

Guards adicionais por contexto:

- `PresidentOrStaffGuard` — ações de presidente/staff em sessão
- Combos em `auth/guards/guard-combos.ts` (`STAFF_AND_ABOVE`, etc.)

### Regras absolutas

1. **Domain layer** nunca importa `@prisma/client` ou `@nestjs/*`
2. `tenantId` **nunca** vem do body/query/params — sempre do JWT (`@TenantId()`)
3. Todo query filtra `{ tenantId, isRemoved: false }`
4. Nunca `prisma.*.delete()` — sempre **soft delete** (`isRemoved: true`)
5. Nunca alterar migrations já aplicadas
6. Nunca remover models legados (`Parlamentar`, `Legislatura`, `MateriaCoautor`…)
7. `tramitacaoJson` e `cicloVidaJson` são **legados** — não usar em código novo
8. `TramitacaoHistorico` é append-only — nunca recebe update
9. Contadores de voto calculados via query, não inseridos manualmente
10. View Models nunca expõem: `tenantId`, `isRemoved`, `removedAt`, `tramitacaoJson`, `cicloVidaJson`
11. Mensagens de erro em **português brasileiro**
12. Sem `any`

---

## Módulos NestJS

### `AuthModule`

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/auth/login` | POST | Login SIGL (email) ou câmara (CPF + tenantId) |
| `/api/auth/login-camara` | POST | Login explícito câmara |
| `/api/auth/me` | GET | Usuário autenticado + tenant + roles |

### `IdentidadeModule`

| Submódulo | Controller | Prefixo |
|-----------|------------|---------|
| Users (legado) | `users.controller` | `/api/users` |
| Tenants | `tenants.controller` | `/api/tenants` |
| Tenant Users | `tenant-users.controller` | `/api/tenant-users` |
| Usuários staff | `usuarios.controller` | `/api/identidade/usuarios` |
| **Tenant Partners** | `tenant-partners.controller` | `/api/identidade/tenant-partners` |

#### Tenant Partner (instituições parceiras / autores externos)

Substitui `GuestUser` (ADR-010). Fluxo em duas etapas:

1. **Criar instituição** — só dados do `TenantPartner`
2. **Vincular usuário** — cria `User` + `TenantPartnerUser` (sem login)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/identidade/tenant-partners` | Lista paginada (`page`, `limit`, `nome`) |
| GET | `/identidade/tenant-partners/:id` | Detalhe + `usuario` vinculado |
| POST | `/identidade/tenant-partners` | Cria parceiro |
| PATCH | `/identidade/tenant-partners/:id` | Atualiza parceiro |
| DELETE | `/identidade/tenant-partners/:id` | Soft delete parceiro + vínculo |
| POST | `.../:id/usuario` | Provisiona User (`nome`, `cpf`, `fotoPerfil?`) |
| PATCH | `.../:id/usuario` | Edita User vinculado |
| DELETE | `.../:id/usuario` | Remove vínculo + soft delete User |

### `LegislativoModule`

| Submódulo | Controller | Prefixo |
|-----------|------------|---------|
| Partidos | `political-parties` | `/api/legislative/partidos-politicos` |
| Parlamentares | `parliamentarians` | `/api/legislative/parlamentares` |
| Mandatos | `parlamentar-mandatos` | `/api/legislative/parlamentares/:id/mandatos` |
| Legislaturas | `legislatures` | `/api/legislative/legislaturas` |
| Comissões | `comissoes` | `/api/legislative/comissoes` |
| Mesa Diretora | `mesa-diretora` | `/api/legislative/mesa-diretora` |
| Frentes | `frentes` | `/api/legislative/frentes-parlamentares` |
| **Matérias** | `materias` | `/api/legislative/materias` |
| **Sessões** | `sessoes` | `/api/legislative/sessoes-plenarias` |
| Votações | `votacoes` | `/api/legislative/votacoes` |
| Agenda | `agenda` | `/api/legislative/agenda-legislativa` |

#### Matérias — endpoints principais

> Documentação completa do módulo: [`materia.md`](./materia.md)

- CRUD `/materias`
- `GET /materias/minhas` — matérias do parlamentar logado
- `GET /materias/tenant-partners`, `/opcoes-autor` — autoria
- `POST /:id/tramitar`, `GET /:id/tramitacao` — workflow
- `POST /:id/texto-original` — upload (multipart)
- `POST /:id/publicacoes` — publicação oficial
- Autoria: `/autoria`, coautores, autores legados

#### Sessões plenárias — endpoints principais

- CRUD + ciclo de vida: `abrir`, `suspender`, `encerrar`, `cancelar`
- Pauta: CRUD itens, `publicar`, `resultado`
- Presenças: registrar/listar/atualizar
- Votação aninhada: abrir, votos, finalizar, encerrar
- **Parlamentar:** `GET sessao-ativa`, `POST minha-presenca`, `POST pedir-palavra`
- **Presidente/staff:** `PATCH fase`, pedidos de palavra (listar/responder/encerrar)
- Quorum: `GET :id/quorum`

### `ControleJuridicoModule` — Normas

| Prefixo | `/api/normas` |
|---------|---------------|
| CRUD normas | + uploads texto integral / áudio |
| Workflow | `sancao`, `veto`, `promulgacao`, `publicacao`, `revogacao` |
| Público | `GET /normas/public` |

### `AtosAdministrativosModule`

| Prefixo | `/api/atos` |
|---------|-------------|
| CRUD atos administrativos (com `tenantId`) |

### `RelatoriosModule`

| Prefixo | `/api/relatorios` |
|---------|-------------------|
| Atividade legislativa, presença |

### `DominiosModule`

| Prefixo | `/api/dominios` |
|---------|-----------------|
| Lookups: tipos de matéria, sessão, norma, etc. |

### `HealthModule`

| Rota | `/api/health` |
|------|---------------|

---

## Banco de dados (Prisma)

Fonte: `prisma/schema.prisma`

### Identidade

| Model | Descrição |
|-------|-----------|
| `User` | Pessoa física global (CPF, email, senha, foto) |
| `Tenant` | Câmara municipal (CNPJ) |
| `TenantUser` | Staff/admin da câmara |
| `TenantPartner` | Instituição parceira (autor externo) |
| `TenantPartnerUser` | Vínculo 1:1 parceiro ↔ User interno |
| `Parliamentarian` | Vereador (modelo novo EN) |
| `ParlamentarianUser` | Acesso do vereador ao app |
| `Parlamentar` | Legado PT — não remover |

### Legislativo

| Model | Descrição |
|-------|-----------|
| `Materia` | Proposição legislativa |
| `MatterCoauthor` | Coautor (novo) |
| `MateriaCoautor` | Coautor legado |
| `Autor` | Autor de matéria (parlamentar, partner, legado) |
| `SessaoPlenaria` | Sessão plenária |
| `PautaItem` | Item de pauta |
| `Votacao` / `VotoParlamentar` | Votação eletrônica |
| `PresencaSessao` | Presença na sessão |
| `PedidoPalavra` | Fila de uso da palavra |
| `AgendaLegislativa` | Agenda de eventos |
| `TramitacaoHistorico` | Histórico append-only de tramitação |

### Jurídico e administrativo

| Model | Descrição |
|-------|-----------|
| `Norma` | Lei, decreto, etc. |
| `Ato` | Ato administrativo |

### Enums relevantes

- `StatusMateria` (9 valores)
- `StatusSessao` — `AGENDADA | ABERTA | SUSPENSA | ENCERRADA`
- `StatusPautaItem` — `RASCUNHO | PUBLICADA | ENCERRADA`
- `FaseSessao`, `FasePauta`, `TipoPautaItem`
- `Voto` — `SIM | NAO | ABSTENCAO`
- `TenantUserRole` — `ADMIN_STAFF | STAFF | …`

### Campos legados (não usar em código novo)

- `Materia.tramitacaoJson`
- `SessaoPlenaria.cicloVidaJson`

---

## Uploads

Arquivos servidos em `/uploads/` via Fastify static:

- Normas: `uploads/normas/{tenantId}/`
- Matérias: `uploads/materias/{tenantId}/`

Limite de body: 10 MB (multipart).

---

## Testes

```bash
cd backend
npx jest --testPathPattern=identidade/tenant-partners
npx jest --testPathPattern=legislativo/materias
npx tsc --noEmit
```

Padrão: specs ao lado dos use-cases (`*.use-case.spec.ts`).

---

## Comandos úteis

```bash
docker-compose up -d
npx prisma migrate dev --name <descricao>
npx prisma generate
npx prisma db seed
npm run start:dev
```

Swagger: http://localhost:3000/api/docs

---

## Documentação complementar

| Arquivo | Conteúdo |
|---------|----------|
| `CLAUDE.md` | Regras e mapa para agentes |
| `backend/docs/specs/` | Especificações por domínio |
| `backend/docs/tasks/` | Tasks de implementação |
| `backend/docs/decisions/` | ADRs (ex.: ADR-010 tenant-partner) |
| `docs/DECISAO-APPS-staff-parlamentar.md` | Separação Staff vs Parlamentar |

---

## Gaps conhecidos / roadmap

- Contadores de voto: migrar para cálculo por query (não confiar em campos manuais)
- `VotoParlamentar.parliamentarianId` — modelo novo vs legado `parlamentarId`
- `Ato.tenantId` — isolamento de tenant
- App mobile parlamentar (presença, votação, pedido de palavra) — backend parcialmente pronto
- Integração Jitsi / YouTube / painel TV — fora do escopo atual da API REST
