Task 22 — Base de Sessões Plenárias

Módulo: `src/legislativo/sessoes-plenarias`

## Objetivo

Fluxo de sessão plenária com ciclo de vida controlado — não apenas CRUD.

## Regras

- Sessão pertence ao tenant (Câmara).
- Sessão possui tipo (`TipoSessao`) e situação (`SituacaoSessao`).
- Tipos: **Ordinária**, **Extraordinária**, **Solene**, **Especial** (`CodigoTipoSessao`).
- Sessão possui `dataInicio` e `dataFim` (opcional até encerramento).
- Nova sessão inicia em **AGENDADA**.

## Situações (ciclo de vida)

| Código | Label |
|--------|-------|
| `AGENDADA` | Agendada |
| `EM_ANDAMENTO` | Em andamento |
| `ENCERRADA` | Encerrada |
| `CANCELADA` | Cancelada |

## Ações de ciclo de vida

| Ação | De | Para |
|------|-----|------|
| `INICIAR` | AGENDADA | EM_ANDAMENTO |
| `ENCERRAR` | EM_ANDAMENTO | ENCERRADA (+ `dataFim` automática se ausente) |
| `CANCELAR` | AGENDADA, EM_ANDAMENTO | CANCELADA |

## Endpoints

- `GET /legislative/sessoes-plenarias/situacoes` — catálogo de situações e transições
- `GET /legislative/sessoes-plenarias/:id/fluxo` — capacidades e transições da sessão
- `GET /legislative/sessoes-plenarias/:id/ciclo-vida/acoes` — ações disponíveis
- `POST /legislative/sessoes-plenarias/:id/ciclo-vida` — executa ação (`action`, `observacao?`)
- `PATCH /legislative/sessoes-plenarias/:id` — **não** aceita `situacaoId`

Resposta inclui bloco `workflow` com `capabilities` e histórico `cicloVida`.

## Critério de aceite

- [x] Sessão possui ciclo de vida controlado por use cases
- [x] Situação não muda via update genérico
- [x] Pauta e presença respeitam capacidades do workflow
