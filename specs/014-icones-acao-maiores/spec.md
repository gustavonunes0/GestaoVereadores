# Feature Specification: Sistema — ícones de ação 4px maiores

**Feature Branch**: `014-icones-acao-maiores`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-14 de docs/bugs-e-features-sessao-baturite.md — Ícones de ação (visualizar, documento, editar, excluir etc.) estão pequenos, atrapalhando leitura e clique. Aumentar em 4px, apenas os de ação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ícones de ação maiores e fáceis de clicar (Priority: P1)

Todos os ícones clicáveis que executam ação ficam 4px maiores (ex.: 16px → 20px), com área de clique de pelo menos 32×32px.

**Why this priority**: Melhora leitura e precisão de clique em todo o sistema.

**Independent Test**: Comparar o tamanho dos ícones de ação na listagem de parlamentares, nos modais de detalhe/edição e na lista da Pauta antes e depois.

**Acceptance Scenarios**:

1. **Given** um ícone de ação (visualizar, abrir documento, editar, excluir, adicionar, encerrar, histórico, setas ↑↓ da Pauta, fechar ✕), **When** exibido, **Then** fica 4px maior que hoje.
2. **Given** qualquer ícone de ação, **When** o usuário clica, **Then** a área de clique tem no mínimo 32×32px e não encosta no ícone vizinho.
3. **Given** os ícones maiores, **When** exibidos em linhas de tabela e cabeçalhos, **Then** continuam alinhados com o conteúdo.

---

### User Story 2 - Ícones não clicáveis ficam iguais (Priority: P1)

Ícones decorativos ou informativos e componentes de terceiros não mudam.

**Why this priority**: Aumentar tudo desequilibraria títulos, abas e selos.

**Independent Test**: Conferir que ícones de títulos de seção, abas, selos/tags, campos e a barra do visualizador de PDF mantêm o tamanho.

**Acceptance Scenarios**:

1. **Given** um ícone decorativo/informativo, **When** exibido, **Then** mantém o tamanho atual.
2. **Given** a barra do visualizador de PDF, **When** exibida, **Then** não muda.

---

### Edge Cases

- Ícone de ação dentro de botão com texto: o botão continua com a mesma altura do padrão, ou cresce de forma uniforme em todo o sistema.
- Linhas de tabela com vários ícones de ação: o espaçamento entre eles se mantém confortável, sem quebrar a linha.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ícones de ação DEVEM ser 4px maiores que o tamanho atual.
- **FR-002**: O tamanho DEVE ser aplicado de forma central (uma definição única de "ícone de ação"), não ajustado tela a tela.
- **FR-003**: A área de clique dos ícones de ação DEVE ter no mínimo 32×32px.
- **FR-004**: Ícones decorativos, informativos e de componentes de terceiros NÃO DEVEM mudar.
- **FR-005**: Os ícones DEVEM continuar alinhados ao conteúdo ao redor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos ícones de ação nas telas revisadas (listagem de parlamentares, modais de detalhe/edição, lista da Pauta) com o novo tamanho.
- **SC-002**: 100% dos ícones de ação com área de clique ≥ 32×32px.
- **SC-003**: Mudar o tamanho padrão no futuro exige alteração em um único lugar.

## Assumptions

- Telas fora da lista de revisão também são afetadas pela definição central; a revisão visual prioriza as listadas.
