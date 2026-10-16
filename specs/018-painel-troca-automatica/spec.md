# Feature Specification: Painel público — troca automática de tela conforme a etapa da sessão

**Feature Branch**: `018-painel-troca-automatica`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "FEAT-02 de docs/bugs-e-features-sessao-baturite.md — Continuação do FEAT-01. Depois de 'Abrir sessão', o painel público deixa a presença e passa a acompanhar o que o operador conduz: a matéria selecionada na Pauta e, ao abrir a votação, a tela de votação."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Painel acompanha a matéria atual (Priority: P1)

Ao abrir a sessão, o painel sai da tela de presença e mostra a matéria atual. Quando o operador clica num item da Pauta, o painel troca na hora para esse item, sem recarregar.

**Why this priority**: Hoje alguém precisa mexer no computador do painel; a troca automática acompanha o rito.

**Independent Test**: Com o painel aberto, clicar em "Abrir sessão" e depois em dois itens da Pauta: o painel muda sozinho a cada passo.

**Acceptance Scenarios**:

1. **Given** a sessão em Chamada com quórum, **When** o operador clica em "Abrir sessão", **Then** o status vira "Aberta", a hora de abertura é registrada e o painel sai da presença para a tela da matéria.
2. **Given** a sessão aberta, **When** o operador seleciona um item da Pauta, **Then** o painel mostra esse item em tempo real.
3. **Given** a tela da matéria, **When** exibida, **Then** mostra no mínimo: número/tipo (ex.: REQ nº 99/2026), ementa, autor e coautores, e posição na pauta (ex.: "Item 1 de 7").
4. **Given** um item que não é matéria, **When** selecionado, **Then** o painel mostra título e posição na pauta, sem campos vazios de matéria.
5. **Given** a sessão aberta sem item selecionado, **When** o painel é exibido, **Then** mostra tela de espera "Sessão aberta · Aguardando pauta" (assunção em research.md).

---

### User Story 2 - Painel muda para votação ao abrir a votação (Priority: P1)

Ao clicar em "Abrir votação", o painel muda na hora para a tela de votação da matéria (layout da spec 016), só com vereadores ativos e sem textos de suplência.

**Why this priority**: É o momento mais acompanhado pelo público.

**Independent Test**: Abrir a votação de uma matéria e conferir que o painel troca sozinho para a tela de votação.

**Acceptance Scenarios**:

1. **Given** uma matéria selecionada, **When** o operador clica em "Abrir votação", **Then** o painel mostra a tela de votação em tempo real.
2. **Given** a tela de votação, **When** exibida, **Then** só mostra vereadores ativos (spec 004), sem textos de suplência (spec 003).
3. **Given** a votação encerrada, **When** o resultado é apurado, **Then** o painel mostra o resultado por ~25s e depois volta para a matéria atual (assunção em research.md).

---

### User Story 3 - Painel sempre na tela certa (Priority: P2)

Ao abrir ou recarregar o painel no meio da sessão, ele vai direto para a tela da etapa atual.

**Why this priority**: O computador do painel pode reiniciar ou perder conexão durante a sessão.

**Independent Test**: Com uma votação aberta, recarregar o painel: ele volta direto na tela de votação.

**Acceptance Scenarios**:

1. **Given** a sessão em qualquer etapa, **When** o painel é aberto ou recarregado, **Then** mostra a tela correspondente à etapa atual.
2. **Given** o painel perde a conexão, **When** a conexão volta, **Then** ele se ressincroniza com a etapa atual sem intervenção.

---

### Edge Cases

- Operador troca de item durante uma votação aberta: o painel continua na votação até ela ser encerrada.
- Pauta reordenada durante a sessão: a posição exibida ("Item X de Y") atualiza.
- Sessão encerrada: o painel mostra um estado final de sessão encerrada.
- Presença durante a sessão aberta: se quórum e presentes continuam visíveis é pendência (ver Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao abrir a sessão, o status DEVE virar "Aberta", a hora de abertura DEVE ser registrada e o painel DEVE trocar para a tela da matéria.
- **FR-002**: O painel DEVE mostrar o item atualmente selecionado pelo operador na Pauta e trocar em tempo real ao mudar a seleção, sem recarregar.
- **FR-003**: A tela da matéria DEVE mostrar número/tipo, ementa, autor e coautores e posição na pauta.
- **FR-004**: Itens que não são matéria DEVEM ter exibição própria, sem campos vazios.
- **FR-005**: Ao abrir a votação, o painel DEVE trocar para a tela de votação (layout da spec 016), só com vereadores ativos e sem textos de suplência.
- **FR-006**: As trocas de tela DEVEM ser automáticas e sincronizadas, sem intervenção no computador do painel.
- **FR-007**: Ao abrir ou recarregar o painel, ele DEVE mostrar direto a tela da etapa atual.
- **FR-008**: A seleção do item atual DEVE ser guardada pelo sistema (não só na tela do operador), para que o painel a recupere.

### Key Entities

- **Etapa atual da sessão**: Chamada, Aberta (com item atual) ou Votação em andamento; define a tela do painel.
- **Item atual da Pauta**: item selecionado pelo operador; persistido na sessão.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O painel troca de tela em até 2 segundos após cada ação do operador.
- **SC-002**: 0 intervenções manuais no computador do painel durante uma sessão completa.
- **SC-003**: Após recarregar ou reconectar, o painel mostra a tela correta em 100% dos testes.

## Assumptions

- **Falta validar (além dos marcadores):** se quórum e presentes continuam visíveis em algum canto do painel durante a sessão aberta. Até a resposta, não são exibidos na tela da matéria.
- **Fora do escopo:** Palavra e Transmissão mudando o painel (vereador com a palavra + cronômetro) — se desejado, vira feature separada.
- Depende das specs 017 (Chamada), 004, 003, 016 e 007 (coautores).
- Com esta feature, a faixa da Pauta da spec 001 pode virar só indicador de posição.
