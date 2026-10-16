# Feature Specification: Gestão da sessão — remover o horário do cabeçalho

**Feature Branch**: `015-remover-horario-cabecalho`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-15 de docs/bugs-e-features-sessao-baturite.md — Abaixo de '34ª Sessão Ordinária', o cabeçalho da gestão da sessão mostra o horário 18:00, que não deve aparecer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cabeçalho só com o título (Priority: P1)

O cabeçalho da gestão da sessão mostra só o título, alinhado com a seta de voltar e os selos. Selos e ações continuam iguais.

**Why this priority**: Pedido direto da Câmara; o horário ocupa espaço sem uso no contexto.

**Independent Test**: Abrir a gestão de uma sessão e conferir que não há horário abaixo do título.

**Acceptance Scenarios**:

1. **Given** uma sessão com horário cadastrado, **When** a gestão da sessão é aberta, **Then** o cabeçalho não mostra o horário.
2. **Given** o cabeçalho sem o horário, **When** exibido, **Then** o título fica alinhado com a seta de voltar e os selos, sem espaço vazio.
3. **Given** o horário da sessão, **When** se geram atas, convocações e relatórios, **Then** o horário continua aparecendo neles.

---

### Edge Cases

- Título longo: continua alinhado e trunca como hoje.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O cabeçalho da gestão da sessão NÃO DEVE exibir o horário abaixo do título.
- **FR-002**: O título DEVE ficar alinhado com a seta de voltar e os selos, sem espaço vazio.
- **FR-003**: O horário DEVE continuar salvo no cadastro e exibido em atas, convocações e relatórios.
- **FR-004**: A remoção DEVE valer só para o cabeçalho da gestão/detalhe da sessão (não listagem nem painel público) — assunção em research.md até validação da Câmara.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 exibições do horário no cabeçalho da gestão da sessão.
- **SC-002**: 100% dos documentos (atas, convocações, relatórios) continuam com o horário.

## Assumptions

- Escopo do FR-004: só cabeçalho da gestão/detalhe da sessão (assunção documentada em research.md).
