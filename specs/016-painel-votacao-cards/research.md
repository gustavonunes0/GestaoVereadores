# Research: 016

## Decision: Escala via CSS tokens/clamps no voting-panel

**Decision**: Subir `min-height` das `.vp-row`, avatares e `.vp-dot`; na coluna Mesa usar `justify-content: space-evenly` e rows maiores (exceto presidente, que já destaca). Em LED 1600×900+, reforçar tamanhos.

**Rationale**: Um único arquivo de layout; cabe em 1920×1080 sem scroll se a grade ocupa a altura.

## Decision: Remover label "Placar" mantendo counters

**Decision**: Tirar `<span className="vp-card__label">Placar</span>`; card placar com `grid-template-rows: 1fr` / sem gap de label.

**Rationale**: FR-006; aria-live no container já comunica o placar.
