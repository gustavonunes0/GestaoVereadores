# Feature Specification: PDF da matéria — incluir coautores

**Feature Branch**: `007-pdf-coautores`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-07 de docs/bugs-e-features-sessao-baturite.md — O PDF da matéria mostra só o autor principal no quadro AUTORIA e no bloco de assinatura; os coautores cadastrados não aparecem."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Coautores no quadro AUTORIA (Priority: P1)

O PDF lista o autor principal e, abaixo, cada coautor, identificados como "Autor" ou "Coautor".

**Why this priority**: O documento oficial precisa refletir quem assina a matéria.

**Independent Test**: Gerar o PDF de uma matéria com 2 coautores e conferir os 3 nomes no quadro AUTORIA, na ordem certa.

**Acceptance Scenarios**:

1. **Given** uma matéria com autor e coautores, **When** o PDF é gerado, **Then** o quadro AUTORIA mostra o autor principal e depois os coautores na ordem de cadastro, cada um com sua identificação.
2. **Given** uma matéria sem coautor, **When** o PDF é gerado, **Then** o documento fica igual ao de hoje.

---

### User Story 2 - Bloco de assinatura por coautor (Priority: P1)

Depois da assinatura do autor, o PDF traz um bloco por coautor: NOME, "Vereador(a) do PARTIDO" e "Coautor".

**Why this priority**: Sem o bloco, o coautor não tem onde assinar.

**Independent Test**: Gerar o PDF de uma matéria com 5 coautores e conferir que todos os blocos aparecem organizados.

**Acceptance Scenarios**:

1. **Given** uma matéria com coautores, **When** o PDF é gerado, **Then** há um bloco de assinatura para cada coautor, após o do autor, com o partido vindo do cadastro de cada um.
2. **Given** muitos coautores, **When** o PDF é gerado, **Then** os blocos ficam organizados (ex.: em duas colunas) sem cortar nem sobrepor texto.

---

### User Story 3 - PDF atualizado ao mudar coautoria (Priority: P2)

Ao adicionar ou remover coautor, o PDF é gerado de novo.

**Why this priority**: Evita circular documento desatualizado.

**Independent Test**: Remover um coautor e abrir o PDF: o nome não aparece mais.

**Acceptance Scenarios**:

1. **Given** um PDF já gerado, **When** um coautor é adicionado ou removido, **Then** o próximo acesso ao PDF mostra a coautoria atualizada.

---

### Edge Cases

- Coautor sem partido cadastrado: o bloco mostra "Vereador(a)" sem o trecho do partido, sem deixar texto quebrado.
- Coautor inativo: continua no PDF, porque a coautoria é fato do documento.
- Blocos de assinatura que não cabem na página: continuam na página seguinte, sem cortar nenhum bloco no meio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O quadro AUTORIA DEVE listar o autor principal e todos os coautores, identificando cada um como "Autor" ou "Coautor".
- **FR-002**: A ordem DEVE ser: autor principal, depois coautores na ordem de cadastro.
- **FR-003**: O PDF DEVE ter um bloco de assinatura por coautor (NOME, "Vereador(a) do PARTIDO", "Coautor") após o do autor.
- **FR-004**: O partido de cada coautor DEVE vir do cadastro dele.
- **FR-005**: Com vários coautores, os blocos DEVEM ficar organizados sem cortar nem sobrepor.
- **FR-006**: Matéria sem coautor DEVE gerar PDF idêntico ao atual.
- **FR-007**: Adicionar ou remover coautor DEVE fazer o PDF ser gerado de novo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos coautores cadastrados aparecem no quadro AUTORIA e nas assinaturas.
- **SC-002**: PDFs de matérias sem coautor ficam idênticos aos atuais.
- **SC-003**: Após mudar a coautoria, o PDF seguinte reflete a mudança em 100% dos casos.

## Assumptions

- A identificação "Vereador(a)" segue o padrão de gênero já usado no bloco do autor.
- O partido exibido é o atual do cadastro do coautor.
