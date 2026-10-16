# Data Model: 004

Sem migration.

**Parliamentarian.status** (`ACTIVE` | `INACTIVE`) — fonte da regra ao vivo.

**SessaoElencoExercicio** — elenco congelado; em sessão `ABERTA`/`SUSPENSA` ocupantes `INACTIVE` são omitidos na leitura; em `ENCERRADA` o snapshot é preservado.
