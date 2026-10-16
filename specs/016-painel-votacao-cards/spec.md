# Feature Specification: Painel de votação — cards maiores e sem o título "Placar"

**Feature Branch**: `016-painel-votacao-cards`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-16 de docs/bugs-e-features-sessao-baturite.md — No painel de votação, os cards de vereadores e da Mesa são pequenos, com muito espaço vazio, e o bloco de placar tem o título 'PLACAR', que não é necessário."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Votos legíveis de longe no plenário (Priority: P1)

Os cards de vereadores (foto, nome, partido e indicador de voto) crescem e ocupam o espaço vazio. O indicador de voto fica legível na projeção.

**Why this priority**: O painel de votação é o momento de maior atenção do público.

**Independent Test**: Abrir o painel de votação em tela cheia 1920×1080 com 20 vereadores e conferir cards maiores, sem rolagem e sem faixa vazia abaixo da grade.

**Acceptance Scenarios**:

1. **Given** uma votação aberta, **When** o painel é exibido em tela cheia 1920×1080, **Then** os cards crescem proporcionalmente, ocupam o espaço vazio e tudo cabe sem rolagem.
2. **Given** um vereador com nome longo, **When** exibido, **Then** o nome não é cortado de forma ilegível nem quebra o layout.
3. **Given** o indicador de voto, **When** o card cresce, **Then** o indicador cresce junto e é legível a distância.

---

### User Story 2 - Mesa Diretora em destaque equilibrado (Priority: P2)

Os cards da Mesa (além do Presidente) ficam maiores, mais perto do destaque do Presidente, sem deixar metade da coluna vazia.

**Why this priority**: A coluna da Mesa hoje desperdiça metade do espaço.

**Independent Test**: Conferir a coluna da Mesa no painel de votação: sem área vazia relevante.

**Acceptance Scenarios**:

1. **Given** a Mesa com 4 membros, **When** o painel de votação é exibido, **Then** os cards de Vice e Secretários são maiores que hoje e a coluna não tem metade vazia.

---

### User Story 3 - Placar sem título (Priority: P3)

O bloco de placar perde o título "PLACAR" e mantém o conteúdo, sem deixar espaço vazio.

**Why this priority**: Ajuste visual simples.

**Independent Test**: Abrir o painel e conferir o placar sem título.

**Acceptance Scenarios**:

1. **Given** o painel de votação, **When** exibido, **Then** o bloco de placar mostra os totais sem o título "PLACAR" e sem espaço vazio no lugar dele.

---

### Edge Cases

- Câmara com poucos vereadores: os cards crescem até um limite, sem ficar desproporcionais.
- Suplentes em exercício: sem texto de suplência (spec 003).
- Inativos: não aparecem (spec 004).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Os cards de vereadores no painel de votação DEVEM crescer proporcionalmente para ocupar o espaço disponível.
- **FR-002**: O indicador de voto DEVE crescer junto com o card e ser legível a distância.
- **FR-003**: Os cards da Mesa (exceto Presidente) DEVEM ser maiores, aproximando-se do destaque do Presidente.
- **FR-004**: O painel DEVE caber numa tela (1920×1080, tela cheia) sem rolagem.
- **FR-005**: Nomes longos NÃO DEVEM ser cortados de forma ilegível nem quebrar o layout.
- **FR-006**: O título "PLACAR" DEVE ser removido, mantendo o conteúdo e sem espaço vazio.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 1920×1080 tela cheia, 0 rolagem e área vazia abaixo da grade menor que 10% da altura.
- **SC-002**: O indicador de voto de cada vereador é identificável a 8 metros da projeção (validação no plenário).
- **SC-003**: 100% dos nomes legíveis, inclusive os mais longos cadastrados.

## Assumptions

- Mesmo painel exibido automaticamente ao abrir a votação na spec 018.
