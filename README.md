# Gestão Vereadores

Sistema de gestão da atividade legislativa da Câmara (baseado no mapeamento IntGest / SIGL).

## Estrutura do repositório

| Pasta | Descrição |
|-------|-----------|
| `backend/` | API **NestJS** + **Prisma** (módulo Atividade Legislativa) |
| `frontend/` | Placeholder **Vite** até o app definitivo |
| `docs/` | Engenharia reversa, ERD e fluxos de trabalho |

## Pré-requisitos

- Node.js 20+
- Docker Desktop (recomendado para banco e stack completa)

## Início rápido com Docker

### Apenas API + banco

```bash
docker compose up --build
```

- API: http://localhost:3000/api  
- PostgreSQL: `localhost:5432` (usuário/senha/db: `postgres` / `postgres` / `gestao_vereadores`)

Na primeira subida, o container da API executa `prisma db push` e o seed automaticamente.

### Stack completa (API + banco + frontend placeholder)

```bash
docker compose --profile full up --build
```

- Frontend: http://localhost:5173  
- Variável `VITE_API_URL` aponta para `http://localhost:3000/api`

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

3. (Opcional) Frontend placeholder:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Build de verificação

```bash
cd backend
npm run build
```

## Documentação da API

Detalhes de rotas, mapeamento drawio → tabelas e scripts: [backend/README.md](backend/README.md).

## Referências de domínio

- [docs/fluxos_de_trabalho.md](docs/fluxos_de_trabalho.md) — fluxo legislativo
- [docs/Mapeamento_Banco_Dados_IntGest_Cardinalidade_CORRIGIDO.drawio](docs/Mapeamento_Banco_Dados_IntGest_Cardinalidade_CORRIGIDO.drawio) — ERD com cardinalidade
- [docs/desenho_banco_de_dados.md](docs/desenho_banco_de_dados.md) — ERD resumido do módulo legislativo
