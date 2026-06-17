# Gestão Vereadores

Sistema de gestão da atividade legislativa da Câmara (SIGL).

## Estrutura do repositório

| Pasta | Descrição |
|-------|-----------|
| `backend/` | API **NestJS** + **Prisma** (módulo Atividade Legislativa) |
| `frontend/` | SPA **React** + **Vite** (login, cadastros legislativos, relatórios) |
| `docs/` | Engenharia reversa, ERD e fluxos de trabalho |

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20 ou superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **em execução** (não pausado)
- Git (para clonar o repositório)

---

## Como iniciar o aplicativo

Há duas formas de subir o SIGL: **Docker (tudo em containers)** ou **desenvolvimento local** (API e frontend no Node, só o banco no Docker).

### Opção A — Stack completa com Docker (mais simples)

Use quando quiser testar o sistema sem instalar dependências Node na máquina.

**1.** Abra um terminal na pasta raiz do projeto:

```bash
cd GestaoVereadores
```

**2.** Suba todos os serviços (PostgreSQL, API e frontend):

```bash
docker compose up --build
```

Na primeira execução o build pode levar alguns minutos. Aguarde as mensagens de saúde da API e do frontend.

**3.** Acesse no navegador:

| Serviço | URL |
|---------|-----|
| **Aplicativo (SPA)** | http://localhost:8080 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |
| PostgreSQL (host) | `localhost:5433` |

**4.** Faça login:

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin` |

> Na primeira subida, o container da API executa automaticamente `prisma migrate deploy` e o seed (domínios + usuário admin).

**Parar os containers:** `Ctrl+C` no terminal e, se quiser remover os volumes, `docker compose down`.

---

### Opção B — Desenvolvimento local (API + frontend no Node)

Use durante o desenvolvimento: hot-reload no backend e no frontend.

**1.** Certifique-se de que o Docker Desktop está rodando.

**2.** Suba apenas o PostgreSQL:

```bash
docker compose up postgres -d
```

Aguarde o container ficar saudável (`docker compose ps` deve mostrar `healthy`).

**3.** Configure o backend:

```bash
cd backend
cp .env.example .env
```

Copie o template de banco local (ou use `backend/.env.example`):

```bash
cp ../.env.docker.example .env
```

O arquivo deve conter `SIGL_USE_LOCAL_DB=true` e `LOCAL_DATABASE_URL` apontando para `localhost:5433` (Postgres do Docker Compose). Isso garante que a API **não** use o banco remoto da Vercel durante o desenvolvimento local.

**4.** Instale dependências, aplique o schema e popule o banco:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

**5.** Inicie a API em modo desenvolvimento (deixe este terminal aberto):

```bash
npm run start:dev
```

Confirme que a API responde: http://localhost:3000/api/health

**6.** Em outro terminal, suba o frontend:

```bash
cd frontend
npm install
npm run dev
```

**7.** Acesse o aplicativo:

| Serviço | URL |
|---------|-----|
| **Aplicativo (dev)** | http://localhost:5173 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/api/docs |

**8.** Login (aba *Plataforma SIGL*):

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin` |

> O Vite faz proxy de `/api` para `http://localhost:3000` — não é obrigatório criar `frontend/.env` em dev. Para apontar a API explicitamente: copie `frontend/.env.example` para `frontend/.env`.

---

### Verificar se está tudo funcionando

1. **API:** abra http://localhost:3000/api/health — deve retornar status OK.
2. **Frontend:** a tela de login do SIGL deve carregar sem erro de rede.
3. **Login:** após entrar com `admin` / `admin`, o painel inicial deve exibir contadores e o menu lateral.

### Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `Can't reach database server` | Docker pausado ou Postgres parado — rode `docker compose up postgres -d` |
| `EADDRINUSE :3000` | Outra instância da API já está rodando — encerre o processo ou pare o container `api` |
| `JWT_SECRET` ausente | Crie `backend/.env` a partir de `.env.example` |
| Porta 5432 em conflito | O Postgres do projeto usa a porta **5433** no host; use essa porta no `DATABASE_URL` |
| Frontend sem dados | Confirme que a API está em `:3000` e que o seed foi executado |

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
- `docs/` — diagramas e mapeamento de banco (ERD com cardinalidade)
- [docs/desenho_banco_de_dados.md](docs/desenho_banco_de_dados.md) — ERD resumido do módulo legislativo
