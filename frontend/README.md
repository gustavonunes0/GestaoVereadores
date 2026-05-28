# Frontend — Gestão Vereadores (SIGL)

Aplicação **React + Vite** integrada à API NestJS do módulo **Atividade Legislativa**.

## Login padrão

| Usuário | Senha | Perfil |
|---------|-------|--------|
| `admin` | `admin` | MASTER |

## Desenvolvimento

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173. O proxy do Vite encaminha `/api` para `http://localhost:3000`.

Certifique-se de que o backend está rodando com `JWT_SECRET` configurado no `.env`.

## Build

```bash
npm run build
```

## Docker

Na raiz do repositório, o serviço `frontend` expõe a SPA em http://localhost:8080 e faz proxy de `/api` para o container da API.
