# API Gestão Vereadores — Atividade Legislativa

Backend **NestJS** + **Prisma** modelado a partir da aba **Atividade Legislativa** do arquivo `docs/Mapeamento_Banco_Dados_IntGest_Cardinalidade_CORRIGIDO.drawio`.

## Stack

- **NestJS 11** — HTTP, validação (`class-validator`), CORS habilitado para o frontend
- **Prisma 6** — ORM com **PostgreSQL**
- **TypeScript** — build em `dist/`

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16 (via [Docker Compose na raiz](../docker-compose.yml) ou instalação local)

## Configuração local

```bash
cd backend
cp .env.example .env
# Com postgres do compose na raiz: docker compose up postgres -d
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

API: http://localhost:3000/api

## Docker (API em container)

Na raiz do repositório:

```bash
docker compose up --build
```

O `Dockerfile` desta pasta gera o client Prisma, compila o NestJS e, ao iniciar, aplica o schema (`db push`) e o seed.

## Build

```bash
npm run build
npm run start:prod
```

## Mapeamento drawio → modelo

| Entidade no drawio | Implementação Prisma |
|---|---|
| `PARLAMENTAR` + `PK` | `Pessoa` + `Parlamentar` |
| `COMISSAO` | `Comissao` + `ComissaoMembro` |
| `FRENTE` | `FrenteParlamentar` + `FrenteMembro` |
| `MESADIRETORA` + `COMPOSICAO_MESA` | `MesaDiretora` + `MesaDiretoraMembro` + `CargoMesa` |
| `MATERIA` | `Materia` |
| `MATERIA_PESQUISAR` | `GET /api/materias` com query params |
| `NORMA_PESQUISAR` | `Norma` + `GET /api/normas` |
| `SESSAO` / `SESSAO_PESQUISAR` | `SessaoPlenaria` + filtros |
| `SESSAO_186`–`188` | `PautaItem`, `PresencaSessao` |
| `PESQUISARATOS` | `Ato` |
| `RELATORIOS_*` | `POST /api/relatorios/*` |
| Domínios tracejados | Tabelas de domínio + `GET /api/dominios` |

## Rotas principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/dominios` | Listas auxiliares |
| CRUD | `/api/parlamentares` | Vereadores |
| CRUD | `/api/comissoes` | Comissões (+ membros) |
| CRUD | `/api/frentes` | Frentes parlamentares |
| GET/POST | `/api/legislaturas` | Legislaturas e sessões legislativas |
| GET/POST | `/api/sessoes` | Sessões plenárias, pauta, presença |
| CRUD | `/api/materias` | Proposições |
| GET/POST | `/api/normas` | Normas jurídicas |
| GET/POST | `/api/atos` | Atos administrativos/legislativos |
| GET/POST | `/api/mesa-diretora` | Mesa diretora |
| POST | `/api/relatorios/atividade-legislativa/completo` | Relatório completo |
| POST | `/api/relatorios/atividade-legislativa/geral` | Relatório geral |
| POST | `/api/relatorios/presenca` | Relatório de presença |

## Scripts npm

| Script | Ação |
|---|---|
| `npm run start:dev` | Desenvolvimento com hot reload |
| `npm run build` | Compilar para produção |
| `npm run start:prod` | Rodar `dist/main.js` |
| `npm run prisma:generate` | Gerar client Prisma |
| `npx prisma db push` | Sincronizar schema com o banco |
| `npm run prisma:seed` | Dados iniciais de domínio |
| `npm run prisma:studio` | UI do banco |

## Prisma e TypeScript

O `PrismaService` importa `PrismaClient` de `.prisma/client` (client gerado). Após alterar `schema.prisma` ou clonar o repo:

```bash
npm run prisma:generate
```

O script `postinstall` também executa `prisma generate` no `npm install`.

## Integração com o frontend

- CORS liberado na API.
- No frontend, use `VITE_API_URL` (ex.: `http://localhost:3000/api`).
- Compose com profile `full` sobe API + Postgres + frontend placeholder na raiz.
