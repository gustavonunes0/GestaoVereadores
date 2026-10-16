# Research: 008

## Decision: Fonte = Board (Mesa), não Legislature

**Decision**: Buscar `Board` cobrindo `dataProtocolo ?? createdAt`; `bienio = startYear/endYear`. Preferir `status: ACTIVE`.

**Rationale**: Biênios 2025/2026 e 2027/2028 são períodos de Mesa; legislatura 2025–2028 geraria rótulo errado 2025/2028. Ano da matéria repetido (2026/2026) era o bug.

## Decision: Sem biênio se não houver Mesa

**Decision**: Campo vazio (não inventar).

**Rationale**: Edge case da spec.
