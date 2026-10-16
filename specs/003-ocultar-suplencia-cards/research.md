# Research: 003

## Decision: Ocultar só na UI do painel

**Decision**: Remover render de `substituindo` em presença/votação do painel; manter campo no model/API.

**Rationale**: FR-001–004; cadastro e relatórios preservados.

## Decision: Presença do suplente

**Decision**: Sem mudança de mapeamento — `mapPresencaToCouncilors` usa o parlamentário em exercício; status é o do suplente.

**Rationale**: FR-005 já coberto pela fonte de elenco.
