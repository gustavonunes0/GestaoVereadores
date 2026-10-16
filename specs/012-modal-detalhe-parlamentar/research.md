# Research: 012

## Decision: Modal ampliado (não página dedicada)

**Decision**: Manter `Dialog` PrimeReact com `width: min(96vw, 1100px)` e `maxHeight` alto; duas colunas via CSS grid. Mesmo padrão reutilizado na 013.

**Rationale**: Menor diff; fluxo atual (lista → modal) preservado.

## Decision: Banner a partir de substituição `EM_EXERCICIO`

**Decision**: Aviso no topo quando existir item com `situacao === 'EM_EXERCICIO'`.
