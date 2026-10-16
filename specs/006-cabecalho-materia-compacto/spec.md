# Feature Specification: Detalhe da matéria — cabeçalho compacto

**Feature Branch**: `006-cabecalho-materia-compacto`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-06 de docs/bugs-e-features-sessao-baturite.md — O cabeçalho do detalhe da matéria (aba Pauta) ocupa três faixas (Autor+Status, Votação, Tags+título) e empurra o PDF para baixo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cabeçalho em duas linhas (Priority: P1)

O operador vê Autor, Status da matéria e Votação (status + placar) na mesma linha, e Tags + título (com o ✕) na linha seguinte. O PDF fica mais alto.

**Why this priority**: Recupera espaço vertical para o documento, que é o que o operador lê durante a sessão.

**Independent Test**: Abrir uma matéria com votação em 1920×1080 e conferir as duas linhas do cabeçalho e o PDF mais alto que antes.

**Acceptance Scenarios**:

1. **Given** uma matéria com votação, **When** o detalhe é aberto, **Then** a linha 1 mostra Autor | Status da matéria | Votação (status + placar), e a linha 2 mostra Tags + título com o botão ✕.
2. **Given** o placar (SIM / NÃO / ABST.), **When** exibido na linha 1, **Then** mantém as cores e continua legível, mesmo mais compacto.
3. **Given** o novo cabeçalho, **When** comparado ao atual, **Then** a altura é visivelmente menor e o PDF ganha esse espaço.

---

### User Story 2 - Matéria sem votação e telas menores (Priority: P2)

Sem votação, o cabeçalho não deixa buraco. Em telas ≤ 1366px, os blocos quebram linha de forma organizada.

**Why this priority**: Evita regressão visual nos casos comuns fora do cenário principal.

**Independent Test**: Abrir uma matéria sem votação, e depois a mesma tela em 1366×768.

**Acceptance Scenarios**:

1. **Given** uma matéria sem votação, **When** o detalhe é aberto, **Then** a linha 1 mostra Autor e Status sem espaço vazio ou quebrado.
2. **Given** uma tela com largura ≤ 1366px, **When** os blocos não cabem numa linha, **Then** quebram de forma ordenada (Votação passa para baixo, alinhada), sem sobreposição.

---

### Edge Cases

- Autor + coautores com nomes longos: o texto trunca com reticências e mostra o nome completo ao passar o mouse.
- Título muito longo: limita a duas linhas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O cabeçalho do detalhe DEVE exibir Autor, Status da matéria e Votação (status + placar) na mesma linha.
- **FR-002**: Tags, título e botão fechar DEVEM ficar na segunda linha.
- **FR-003**: O placar DEVE manter as cores e a legibilidade de SIM/NÃO/ABST.
- **FR-004**: Matéria sem votação NÃO DEVE deixar espaço vazio onde ficaria a Votação.
- **FR-005**: Em larguras ≤ 1366px, os blocos DEVEM quebrar linha de forma organizada, sem sobreposição.
- **FR-006**: O espaço vertical economizado DEVE ser repassado ao visualizador de PDF.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A altura do cabeçalho cai pelo menos 30% em relação à versão atual em 1920×1080.
- **SC-002**: A área visível do PDF aumenta na mesma proporção do espaço economizado.
- **SC-003**: 0 sobreposição de elementos em 1366×768 e 1920×1080.

## Assumptions

- Complementa a spec 005 (página sem scroll).
- A exibição de coautores no cabeçalho segue o que já existe hoje; a inclusão de coautores no PDF é a spec 007.
