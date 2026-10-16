# Feature Specification: Painel da sessão — Pauta no rodapé e Presença expandida

**Feature Branch**: `001-painel-layout-pauta-rodape`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-01 de docs/bugs-e-features-sessao-baturite.md — Reposicionar 'Pauta da Sessão' para a parte inferior do painel público e expandir o card 'Presença dos Vereadores' para a direita."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Público acompanha a presença com mais espaço (Priority: P1)

Durante a sessão, o painel público (projetado no plenário) mostra a Mesa Diretora à esquerda e a Presença dos Vereadores ocupando o restante da largura no topo. Os cards de vereador ficam maiores e sem área vazia abaixo da grade.

**Why this priority**: A presença é o conteúdo principal do painel durante a chamada e o expediente. Hoje ela divide espaço com a Pauta e sobra área vazia.

**Independent Test**: Abrir `/sessoes/{id}/painel` de uma sessão com 20 vereadores em 1920×1080 e conferir as duas colunas no topo, com a grade de Presença usando toda a largura disponível.

**Acceptance Scenarios**:

1. **Given** uma sessão com vereadores cadastrados, **When** o painel é aberto, **Then** o topo tem duas colunas: Mesa Diretora (esquerda) e Presença dos Vereadores (direita, ocupando o espaço antes usado pela Pauta).
2. **Given** a grade de Presença mais larga, **When** o painel é exibido, **Then** cabem mais cards por linha (ex.: 6 em vez de 5), sem distorcer cards nem fotos.
3. **Given** o card de Presença, **When** a grade termina antes do fim do card, **Then** não sobra faixa vazia grande abaixo da grade (a altura acompanha o conteúdo ou a área disponível).

---

### User Story 2 - Pauta em faixa horizontal no rodapé (Priority: P2)

A Pauta da Sessão aparece numa faixa de largura total abaixo de Mesa e Presença, com os itens lado a lado.

**Why this priority**: Libera espaço para a Presença e deixa a Pauta legível como linha do tempo da sessão.

**Independent Test**: Abrir o painel de uma sessão com 6 itens de pauta e conferir que todos aparecem lado a lado na faixa inferior.

**Acceptance Scenarios**:

1. **Given** uma sessão com itens de pauta, **When** o painel é aberto, **Then** a Pauta ocupa a largura total na parte inferior, com os itens na horizontal.
2. **Given** uma pauta com até 6 itens, **When** o painel é exibido, **Then** todos os itens aparecem sem paginação.
3. **Given** uma pauta com mais itens do que cabem na faixa, **When** o painel é exibido, **Then** a Pauta pagina ou alterna os itens sem quebrar o layout.

---

### User Story 3 - Tela cheia sem rolagem (Priority: P2)

No modo "Tela cheia", o novo layout cabe inteiro na tela de projeção.

**Why this priority**: O painel é projetado e ninguém interage com ele; rolagem esconde informação.

**Independent Test**: Ativar "Tela cheia" em 1920×1080 e verificar que não aparece barra de rolagem.

**Acceptance Scenarios**:

1. **Given** o painel em tela cheia em 1920×1080, **When** a sessão tem 20 vereadores e 6 itens de pauta, **Then** todo o conteúdo aparece sem barra de rolagem.
2. **Given** o novo layout, **When** um vereador tem a presença registrada, **Then** os contadores (presentes/ausentes) e o selo "AO VIVO" atualizam como hoje.

---

### Edge Cases

- Sessão sem itens de pauta: a faixa da Pauta mostra um estado vazio discreto, sem ocupar altura desnecessária.
- Câmara com poucos vereadores (ex.: 9): a grade não estica os cards de forma desproporcional.
- Títulos de itens de pauta muito longos: são truncados com reticências, sem empurrar outros itens.
- Resoluções menores (1366×768) fora de tela cheia: o layout se mantém legível e rola, se necessário, só nessa condição.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O painel público DEVE exibir no topo duas colunas: Mesa Diretora à esquerda e Presença dos Vereadores à direita.
- **FR-002**: O painel DEVE exibir a Pauta da Sessão em faixa de largura total abaixo das duas colunas.
- **FR-003**: Os itens da Pauta DEVEM ser exibidos lado a lado na horizontal.
- **FR-004**: A grade de Presença DEVE aproveitar a largura extra, com mais cards por linha, mantendo as proporções de cards e fotos.
- **FR-005**: O card de Presença NÃO DEVE manter altura fixa que gere área vazia abaixo da grade.
- **FR-006**: Com até 6 itens de pauta, o painel DEVE exibir todos sem paginação.
- **FR-007**: No modo "Tela cheia" em 1920×1080, o painel NÃO DEVE exibir barra de rolagem.
- **FR-008**: Contadores de presença e o indicador "AO VIVO" DEVEM continuar atualizando em tempo real.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 1920×1080 tela cheia, 100% do conteúdo (Mesa, 20 vereadores e 6 itens de pauta) fica visível sem rolagem.
- **SC-002**: A área vazia dentro do card de Presença cai para menos de 10% da altura do card.
- **SC-003**: Uma pessoa a 5 metros da projeção consegue ler o nome dos vereadores na grade (validação visual no plenário).
- **SC-004**: Atualizações de presença aparecem no painel em até 2 segundos, como hoje.

## Assumptions

- O número de colunas da grade (5→6, ou 4/8 para fechar as linhas certinho) é decisão de layout da implementação; a exigência é aproveitar a largura sem distorcer.
- Com mais de 6 itens de pauta, mantém-se a paginação atual da faixa.
- A grade de Presença passa a ter 16 cards quando o BUG-02 (spec 002) for aplicado; o layout deve funcionar com 16 e com 20.
- Com o FEAT-02 (spec 018), a faixa da Pauta pode virar só indicador de posição; esta spec não depende disso.
- Este layout é o mesmo usado na etapa de Chamada (spec 017).
