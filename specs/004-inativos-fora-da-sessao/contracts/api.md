# Contract: 004 — participação de inativos

## Bloqueio API

- Presença / voto / chamada: `ExercicioMandatoService.assertPodeExercerNaSessao` → `422` com `MSG_PARLAMENTAR_INATIVO`.

## Painel público `GET .../painel-publico`

- Sessão ao vivo: grade e mesa só com `Parliamentarian.status = ACTIVE` (e elenco em exercício).
- Sessão encerrada: respeita elenco congelado sem refiltrar por status atual.
