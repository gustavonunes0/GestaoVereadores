Task 23 — Pauta da Sessão

Módulo: `src/legislativo/sessoes-plenarias`

## Objetivo

Gerenciar itens da pauta com regras de domínio explícitas.

## Regras

- `PautaItem` pertence a uma sessão plenária.
- `PautaItem` referencia uma matéria legislativa.
- **Ordem** é única entre itens ativos da mesma sessão.
- **Matéria** não pode ser duplicada na mesma sessão (itens ativos).
- Pauta só pode ser alterada com sessão **EM_ANDAMENTO**.
- Matéria precisa estar **EM_TRAMITACAO** para entrar na pauta.
- Matéria precisa estar na pauta (item ativo) antes de ser votada.

## Fases

| Valor | Label |
|-------|-------|
| `PEQUENO_EXPEDIENTE` | Pequeno expediente |
| `GRANDE_EXPEDIENTE` | Grande expediente |
| `ORDEM_DO_DIA` | Ordem do dia (padrão) |
| `EXPLICACOES_PESSOAIS` | Explicações pessoais |

## Endpoints

- `GET /legislative/sessoes-plenarias/pauta/fases` — catálogo de fases
- `GET /legislative/sessoes-plenarias/:id/pauta` — lista itens (`?fase=` opcional)
- `GET /legislative/sessoes-plenarias/:id/pauta/:pautaItemId` — detalhe do item
- `POST /legislative/sessoes-plenarias/:id/pauta` — incluir matéria (`materiaId`, `ordem`, `fase?`)
- `PATCH /legislative/sessoes-plenarias/:id/pauta/:pautaItemId` — alterar `ordem` / `fase`
- `DELETE /legislative/sessoes-plenarias/:id/pauta/:pautaItemId` — remover item (soft delete)

Inclusão dispara tramitação `COLOCAR_EM_PAUTA`; remoção dispara `RETIRAR_DA_PAUTA` quando aplicável.

Votação (`/votacao`) exige item de pauta ativo vinculado à matéria.

## Critério de aceite

- [x] Ordem e matéria únicos por sessão (entre itens ativos)
- [x] Fases completas incluindo PEQUENO_EXPEDIENTE
- [x] Matéria na pauta antes de votação
- [x] View-model de item com matéria, fase e status de votação
