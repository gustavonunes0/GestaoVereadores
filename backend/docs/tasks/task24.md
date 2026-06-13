Task 24 — Presença em Sessão



Módulo: `src/legislativo/sessoes-plenarias`



## Objetivo



Registrar e gerenciar presença dos parlamentares em sessões plenárias.



## Regras



- `PresencaSessao` pertence a uma sessão plenária.

- Presença referencia um parlamentar (`parlamentarId`).

- Parlamentar precisa ter **mandato ativo** (na legislatura da sessão, quando vinculada).

- Parlamentar **não pode ter presença duplicada** na mesma sessão (registro único; alterações via PATCH).

- Sessão encerrada ou cancelada não permite alteração de presença.

- Situação `JUSTIFICADO` exige `justificativa`.



## Situações



| Valor | Label |

|-------|-------|

| `PRESENTE` | Presente |

| `AUSENTE` | Ausente |

| `JUSTIFICADO` | Justificado |



Apenas `PRESENTE` conta para quorum de votação.



## Endpoints



- `GET /legislative/sessoes-plenarias/presenca/situacoes` — catálogo de situações

- `GET /legislative/sessoes-plenarias/:id/presencas` — lista presenças (`?situacao=` / `?parlamentarId=` opcionais)

- `GET /legislative/sessoes-plenarias/:id/presencas/:presencaId` — detalhe do registro

- `POST /legislative/sessoes-plenarias/:id/presencas` — registrar presença (`parlamentarId`, `situacao?`, `presente?`, `justificativa?`)

- `PATCH /legislative/sessoes-plenarias/:id/presencas/:presencaId` — alterar situação / justificativa



## Critério de aceite



- [x] Presença vinculada à sessão e ao parlamentar

- [x] Validação de mandato ativo

- [x] Sem duplicidade por parlamentar/sessão

- [x] Situações PRESENTE, AUSENTE e JUSTIFICADO

- [x] View-model com parlamentar, situação e flag de quorum

