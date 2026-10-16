# Research: 005

## Decision: Painel único por seleção

**Decision**: Usar `PautaDetalhePanel` em vez de `PautaListaDetalhe` (stack de PDFs com `min-height: 62vh`).

**Rationale**: Stack de iframes estoura a página; spec pede troca de conteúdo sem scroll da página.

## Decision: Lista com scroll interno

**Decision**: Manter `.pauta-split__lista-scroll { overflow-y: auto }`.

**Rationale**: Clarificação confirmada (pauta longa).
