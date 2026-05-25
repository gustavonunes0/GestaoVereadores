# Frontend (placeholder)

Estrutura mínima com **Vite** para validar integração com a API até o app definitivo existir.

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | Base da API (ex.: `http://localhost:3000/api`) |

## Desenvolvimento local

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Docker

Com o profile `full` na raiz do repositório:

```bash
docker compose --profile full up --build
```

Quando criar o frontend real, mantenha `VITE_API_URL` e substitua este diretório pelo projeto (React, Next.js, etc.).
