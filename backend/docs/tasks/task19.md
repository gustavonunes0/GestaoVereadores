Task 19 — Regras base de Matérias Legislativas

Módulo:
src/legislativo/materias

Objetivo:
Definir matéria como proposição legislativa com ciclo de vida, não apenas CRUD.

Regras:
- Matéria pertence ao tenant (Câmara Municipal).
- Matéria possui tipo, número, ano, ementa e status.
- Matéria pode ter autor, coautor e relator.
- Matéria pode tramitar (histórico em `tramitacaoJson`).
- Matéria em `EM_TRAMITACAO` pode entrar em pauta.
- Matéria em `EM_TRAMITACAO` pode ser votada (resultado → APROVADA/REJEITADA).
- Matéria `APROVADA` pode gerar norma jurídica.

Status e transições:
| Status atual     | Pode ir para                                      |
|------------------|---------------------------------------------------|
| EM_TRAMITACAO    | APROVADA, REJEITADA, ARQUIVADA, RETIRADA          |
| APROVADA         | ARQUIVADA                                         |
| REJEITADA        | ARQUIVADA                                         |
| RETIRADA         | EM_TRAMITACAO                                     |
| ARQUIVADA        | (terminal)                                        |

Endpoints de fluxo:
- `GET /legislative/materias/status` — catálogo de status e transições.
- `GET /legislative/materias/:id/fluxo` — capacidades, transições permitidas e histórico.
- `PATCH /legislative/materias/:id/status` — altera status com validação de transição.

Critério de aceite:
- Matéria não é apenas CRUD; possui status, capacidades de fluxo e histórico de tramitação.
- Resposta da API inclui bloco `workflow` com `capabilities` e `tramitacao`.
