# Tasks: Painel da sessão — Pauta no rodapé e Presença expandida

**Input**: Design documents from `/specs/001-painel-layout-pauta-rodape/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Não solicitados na spec — validação via quickstart.md + build frontend.

**Organization**: Por user story (P1 → P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo
- **[Story]**: US1 / US2 / US3
- Caminhos absolutos ao repo: `frontend/src/...`

## Phase 1: Setup

**Purpose**: Confirmar escopo e arquivos-alvo

- [x] T001 Confirmar artefatos em `specs/001-painel-layout-pauta-rodape/` (plan, research, contracts/ui-layout.md, quickstart)
- [x] T002 Localizar `PainelInicioSessao` / `PainelPautaCarrossel` em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx` e CSS `.sessao-painel-inicio` em `frontend/src/styles/sigl-ui-patterns.css`

---

## Phase 2: Foundational

**Purpose**: Base de layout sem quebrar a tela atual de votação

**⚠️ CRITICAL**: Completar antes das user stories

- [x] T003 Isolar mudanças à fase de início: não alterar `VotingPanel` nem `MesaApresentacaoPanel` em `frontend/src/components/sessoes/painel/voting/`
- [x] T004 Definir constantes de pauta (`PAUTA_CARROSSEL_POR_PAGINA = 6`) em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx`

**Checkpoint**: Escopo fechado; pronto para US1

---

## Phase 3: User Story 1 — Presença expandida no topo (Priority: P1) 🎯 MVP

**Goal**: Topo com Mesa (esquerda) + Presença (direita, largura restante); grade com mais cards/linha; sem faixa vazia grande no card de presença.

**Independent Test**: Abrir `/sessoes/{id}/painel` em 1920×1080 — duas colunas no topo; Pauta não na 3ª coluna.

### Implementation for User Story 1

- [x] T005 [US1] Alterar `.sessao-painel-inicio` para grid de 2 colunas (`mesa | presença`) em `frontend/src/styles/sigl-ui-patterns.css`
- [x] T006 [US1] Ajustar `.sessao-painel-presenca__grade` para mais colunas (ex. auto-fill / 6) sem distorcer avatar/nome em `frontend/src/styles/sigl-ui-patterns.css`
- [x] T007 [US1] Remover altura forçada / stretch que gera área vazia abaixo da grade em `.sessao-painel-presenca` / grid pai em `frontend/src/styles/sigl-ui-patterns.css`

**Checkpoint**: US1 testável só com CSS + layout; pauta ainda pode estar na 3ª coluna até US2

---

## Phase 4: User Story 2 — Pauta em faixa horizontal no rodapé (Priority: P2)

**Goal**: Pauta full-width abaixo; itens lado a lado; ≤6 sem paginação; >6 com páginas de 6.

**Independent Test**: Sessão com 6 itens — todos na faixa inferior; com 7+ — paginação/dots.

### Implementation for User Story 2

- [x] T008 [US2] Colocar `.sessao-painel-carrossel` (ou classe nova de faixa) em `grid-column: 1 / -1` na linha inferior em `frontend/src/styles/sigl-ui-patterns.css`
- [x] T009 [US2] Refatorar markup/CSS de `PainelPautaCarrossel` para lista horizontal (itens lado a lado, título com ellipsis) em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx` e `frontend/src/styles/sigl-ui-patterns.css`
- [x] T010 [US2] Garantir paginação com `PAUTA_CARROSSEL_POR_PAGINA = 6`, timer/dots existentes, estado vazio discreto em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx`
- [x] T011 [US2] Ajustar media queries de `.sessao-painel-inicio` / carrossel em `frontend/src/styles/sigl-ui-patterns.css` para não reintroduzir 3 colunas no desktop

**Checkpoint**: US1 + US2 no layout contratado

---

## Phase 5: User Story 3 — Tela cheia sem rolagem (Priority: P2)

**Goal**: Fullscreen 1920×1080 sem scrollbar; realtime intacto.

**Independent Test**: Tela cheia com ~20 vereadores + 6 itens — sem scroll; presença atualiza.

### Implementation for User Story 3

- [x] T012 [US3] Ajustar alturas/gaps/padding do `.sessao-painel-main:has(.sessao-painel-inicio)` e filhos para caber em 1080p fullscreen em `frontend/src/styles/sigl-ui-patterns.css`
- [x] T013 [US3] Verificar que contadores e fluxo `useSessaoRealtime` / `usePainelElenco` em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx` não foram alterados

**Checkpoint**: SC-001 / SC-004 cobertos

---

## Phase 6: Polish

- [x] T014 Rodar `npm run build` em `frontend/`
- [x] T015 Percorrer cenários V1–V5 de `specs/001-painel-layout-pauta-rodape/quickstart.md`
- [x] T016 Marcar tarefas concluídas neste `tasks.md`; **não** push/deploy (trava)

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational → US1 → US2 → US3 → Polish
- US2 depende do grid de 2 colunas da US1 para a faixa `grid-column: 1 / -1`
- US3 afina overflow após US1+US2

### User Story Dependencies

- **US1 (P1)**: após Foundational — MVP
- **US2 (P2)**: após US1 (mesmo arquivo CSS/JSX)
- **US3 (P2)**: após US2

### Parallel Opportunities

- T006 e T007 podem ser feitos em paralelo após T005 (mesmo CSS, cuidado com conflitos)
- T003 e T004 em paralelo na Foundational

---

## Parallel Example: User Story 1

```text
Task: T006 — grade presença em sigl-ui-patterns.css
Task: T007 — remover faixa vazia em sigl-ui-patterns.css
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. T001–T004
2. T005–T007 → validar duas colunas no topo
3. Seguir US2/US3

### Incremental Delivery

1. US1 layout topo
2. US2 pauta rodapé
3. US3 fullscreen polish + build

### Notes

- Sem commit/push/deploy sem pedido explícito
- Não tocar painel de votação
