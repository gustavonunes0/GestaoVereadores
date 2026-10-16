# Research: 014

## Decision: Tokens CSS centrais (+4px → 1.25rem)

**Decision**: Introduzir `--sigl-action-icon-size: 1.25rem` (20px) e `--sigl-action-hit-min: 2rem` (32px) em `prime-theme-tokens.css`. Aplicar em `.p-button-icon-only` / `.p-button-icon` e em `.ord-btn` / `.pauta-card__ord-btn` / `.pauta-remove-btn`.

**Rationale**: FR-002 exige um único lugar; baseline visual do projeto (~14–16px no glifo) + 4px ≈ 20px (exemplo da spec). Hit area de icon-only já era 2rem; setas e remove estavam abaixo de 32px.

**Alternatives considered**: Ajustar tela a tela (rejeitado — FR-002); aumentar todos os `.pi` (rejeitado — US2 / FR-004).

## Decision: Não tocar PDF viewer / títulos / abas

**Decision**: Escopo só botões de ação e controles explícitos de reordenação/remoção.

**Rationale**: FR-004 e US2.
