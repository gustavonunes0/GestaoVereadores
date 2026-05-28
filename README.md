# Gestão Vereadores

Sistema de gestão da atividade legislativa da Câmara (baseado no mapeamento IntGest / SIGL).

## Estrutura do repositório

| Pasta | Descrição |
|-------|-----------|
| `backend/` | API **NestJS** + **Prisma** (módulo Atividade Legislativa) |
| `frontend/` | SPA **React** + **Vite** (login, cadastros legislativos, relatórios) |
| `docs/` | Engenharia reversa, ERD e fluxos de trabalho |

## Pré-requisitos

- Node.js 20+
- Docker Desktop (recomendado para banco e stack completa)

## Início rápido com Docker (stack completa)

```bash
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Frontend (SPA) | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger (documentação da API) | http://localhost:3000/api/docs |
| PostgreSQL | `localhost:5432` |

**Login:** `admin` / `admin` (usuário master criado no seed).

Na primeira subida, a API executa `prisma migrate deploy` e o seed (domínios + usuário admin).

## Desenvolvimento local (sem container da API)

1. Suba só o PostgreSQL:

```bash
docker compose up postgres -d
```

2. Configure e rode o backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173 e entre com `admin` / `admin`.

API local: http://localhost:3000/api — Swagger: http://localhost:3000/api/docs

## Swagger

Documentação interativa da API (OpenAPI), com autenticação JWT:

1. Suba a API (`docker compose up` ou `npm run start:dev` no `backend/`).
2. Abra http://localhost:3000/api/docs
3. Faça login em `POST /api/auth/login` (corpo: `username`, `password`) ou use o botão **Authorize** com o token `Bearer <access_token>` retornado no login.

Rotas públicas: `POST /api/auth/login` e `GET /api/health`.

## Testes

Os testes ficam no backend (Jest). É necessário Node.js 20+ e dependências instaladas (`npm install` em `backend/`).

**Testes unitários** (helpers, auth, etc.):

```bash
cd backend
npm test
```

**Testes e2e** (sobe o app Nest em memória; recomenda-se Postgres disponível para `/api/health`):

```bash
cd backend
npm run test:e2e
```

**Build de verificação** (compilação TypeScript da API):

```bash
cd backend
npm run build
```

## Documentação da API

Detalhes de rotas, perfis de acesso, paginação, mapeamento drawio → tabelas e scripts: [backend/README.md](backend/README.md).

## Referências de domínio

- [docs/fluxos_de_trabalho.md](docs/fluxos_de_trabalho.md) — fluxo legislativo
- [docs/Mapeamento_Banco_Dados_IntGest_Cardinalidade_CORRIGIDO.drawio](docs/Mapeamento_Banco_Dados_IntGest_Cardinalidade_CORRIGIDO.drawio) — ERD com cardinalidade
- [docs/desenho_banco_de_dados.md](docs/desenho_banco_de_dados.md) — ERD resumido do módulo legislativo
