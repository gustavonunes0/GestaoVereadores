# Quickstart: 001-painel-layout-pauta-rodape

## Prerequisites

- Frontend: `npm run dev` em `frontend/` (Vite).
- Backend local ou staging com sessão que tenha vereadores + itens de pauta.
- Sessão com status que permita abrir o painel público.

## Run

```powershell
cd frontend
npm run dev
```

Abrir: `http://localhost:5173/sessoes/{sessaoId}/painel` (ajustar porta se necessário).

## Validation scenarios

### V1 — Topo Mesa | Presença

1. Abrir o painel de uma sessão com elenco.
2. **Esperado**: Mesa à esquerda; Presença à direita ocupando o restante; Pauta **não** ao lado direito do topo.

### V2 — Pauta no rodapé horizontal

1. Sessão com 4–6 matérias na pauta.
2. **Esperado**: Faixa inferior full-width; itens lado a lado; sem paginação.

### V3 — Paginação >6

1. Sessão com 7+ matérias.
2. **Esperado**: Página mostra até 6; dots/timer avançam; layout não quebra.

### V4 — Fullscreen 1920×1080

1. Ativar “Tela cheia” (ou DevTools device 1920×1080 + fullscreen).
2. **Esperado**: Sem barra de rolagem; ~20 cards + 6 itens visíveis.

### V5 — Realtime

1. Registrar presença de um vereador na sessão (staff).
2. **Esperado**: Contadores / status do card atualizam em ≤2s; AO VIVO permanece.

## Build check

```powershell
cd frontend
npm run build
```

**Esperado**: exit 0.

## Deploy

**Não** fazer push/deploy nesta feature sem pedido explícito (trava de deploy).
