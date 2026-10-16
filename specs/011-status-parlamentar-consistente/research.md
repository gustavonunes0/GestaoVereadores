# Research: 011

## Decision: Opção A — status único (`Parliamentarian.status`)

**Decision**: Mesma regra da spec 004: listagem, detalhe legislativo e sessão usam `Parliamentarian.status`. Inativar conta (revoke) → `Parliamentarian.status = INACTIVE`; reativar (grant/activate) → `ACTIVE`. Conta de acesso continua visível no detalhe como informação auxiliar, mas o selo principal da lista espelha o status legislativo.

**Rationale**: Já embarcada em `assertParlamentarAtivo` / elenco da sessão; evita dois selos e divergência BUG-11.

**Alternatives considered**: Opção B (dois selos) — rejeitada para manter consistência com 004.
