# Tasks: 014-icones-acao-maiores

**Input**: Design documents from `/specs/014-icones-acao-maiores/`

## Phase 1: Setup

- [x] T001 Confirmar tokens e arquivos em plan.md

## Phase 2: Foundational

- [x] T002 Adicionar `--sigl-action-icon-size` e `--sigl-action-hit-min` em `frontend/src/styles/prime-theme-tokens.css`

## Phase 3: User Story 1 — Ícones de ação maiores (P1)

**Goal**: Glifo +4px e hit ≥32×32 nos controles de ação.

- [x] T003 [US1] Aplicar tokens em `.p-button-icon-only` e `.p-button-icon` em `frontend/src/styles/prime-overrides.css`
- [x] T004 [P] [US1] Aplicar tokens em `.ord-btn` e `.pauta-remove-btn` em `frontend/src/styles/sigl-ui-patterns.css`
- [x] T005 [P] [US1] Aplicar tokens em `.pauta-card__ord-btn` em `frontend/src/styles/lex-sessao.css`

## Phase 4: User Story 2 — Não clicáveis iguais (P1)

**Goal**: Não alterar ícones decorativos/PDF.

- [x] T006 [US2] Revisar diff: sem mudanças em ModuleTitle/Sidebar/PDF viewer

## Phase 5: Polish

- [x] T007 Build frontend (`npm run build`) e marcar conclusão; sem deploy
