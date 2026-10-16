# Feature Specification: Gestão da sessão (aba Pauta) — eliminar o scroll da página

**Feature Branch**: `005-pauta-sem-scroll-pagina`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-05 de docs/bugs-e-features-sessao-baturite.md — Na aba Pauta da gestão da sessão, o painel da direita (visualizador de PDF) é mais alto que a janela e faz a página inteira rolar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operador navega pela pauta sem a tela pular (Priority: P1)

O operador da sessão vê cabeçalho, abas, lista da Pauta e painel de detalhe sempre na tela. Ao clicar num item, só o painel da direita muda.

**Why this priority**: Durante a sessão ao vivo, o operador perde o contexto quando cabeçalho e lista somem com a rolagem.

**Independent Test**: Abrir a aba Pauta em 1366×768, clicar em cada item e verificar que a página nunca rola.

**Acceptance Scenarios**:

1. **Given** a aba Pauta aberta em 1366×768 ou 1920×1080, **When** a tela carrega, **Then** não há barra de rolagem na página.
2. **Given** a lista da Pauta, **When** o operador clica em qualquer item, **Then** o painel da direita mostra o item, o item fica destacado na lista e a página não rola.
3. **Given** um item que não é matéria (ex.: "33 Sessão legislativo…"), **When** é clicado, **Then** abre corretamente no painel.

---

### User Story 2 - PDF rola dentro do próprio painel (Priority: P1)

O visualizador de PDF ocupa a altura disponível e rola por dentro. Status da matéria e placar ficam visíveis acima dele.

**Why this priority**: É o conteúdo que hoje estoura a altura da tela.

**Independent Test**: Abrir uma matéria com PDF de várias páginas e rolar o documento: só o PDF se move.

**Acceptance Scenarios**:

1. **Given** uma matéria com PDF longo, **When** o operador rola o documento, **Then** só o visualizador rola; cabeçalho, abas, lista, status e placar ficam parados.

---

### Edge Cases

- Pauta longa (20+ itens): a lista da esquerda tem rolagem interna própria.
- Matéria sem PDF: o painel mostra estado vazio que ocupa a mesma área, sem alterar a altura da página.
- Janela redimensionada durante o uso: o layout se reajusta à nova altura sem rolagem da página.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A aba Pauta NÃO DEVE gerar rolagem da página em 1366×768 e 1920×1080.
- **FR-002**: Cabeçalho, abas, lista da Pauta e painel da direita DEVEM ocupar juntos exatamente a altura da janela.
- **FR-003**: Selecionar um item da Pauta DEVE trocar o conteúdo do painel e destacar o item, sem rolar a página.
- **FR-004**: O visualizador de PDF DEVE ocupar a altura disponível do painel e rolar apenas internamente.
- **FR-005**: Status da matéria e placar da votação DEVEM permanecer visíveis acima do PDF.
- **FR-006**: Itens que não são matéria DEVEM abrir corretamente no painel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 rolagem de página na aba Pauta nas duas resoluções-alvo, para qualquer item selecionado.
- **SC-002**: O operador troca de item da pauta com 1 clique, sem precisar rolar para encontrar a lista ou o cabeçalho.
- **SC-003**: Status e placar permanecem visíveis em 100% do tempo enquanto o PDF é lido.

## Assumptions

- Esta spec complementa a spec 006 (cabeçalho compacto da matéria), que devolve espaço ao PDF.
- Lista da esquerda com rolagem interna (confirmado).
- Painel da direita mostra um único item selecionado (não empilha todos os PDFs).
