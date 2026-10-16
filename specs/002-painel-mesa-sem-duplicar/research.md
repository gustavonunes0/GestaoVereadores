# Research: 002

## Decision: Filtrar grade por IDs da Mesa da sessão

**Decision**: `vereadoresGrade = all.filter(v => !mesaIds.has(v.id))` onde `mesaIds` vem de `mesaMembros` (composição dinâmica).

**Rationale**: FR-001/002 — composição vinculada à sessão, já montada em `mesaMembros`.

## Decision: Contadores sobre `all`

**Decision**: Totais Presentes/Ausentes usam `all` (inclui Mesa); grade usa lista filtrada.

**Rationale**: FR-006 resolvido alinhado ao quórum.

## Decision: Status visual nos cards da Mesa

**Decision**: Reutilizar classes `--presente` / `--ausente` da grade nos cards `.sessao-painel-inicio__mesa-card`.

**Rationale**: FR-003/004; `Councilor.status` já atualiza via realtime.
