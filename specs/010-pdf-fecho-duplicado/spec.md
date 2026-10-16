# Feature Specification: PDF da matéria — fecho "Pede e Aguarda Deferimento." sem duplicação

**Feature Branch**: `010-pdf-fecho-duplicado`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-10 de docs/bugs-e-features-sessao-baturite.md — O fecho do PDF repete a frase: 'Pede e Aguarda Deferimento. / Nestes Termos. / Pede e Aguarda Deferimento.'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fecho único no PDF (Priority: P1)

O PDF termina com um único fecho: "Nestes Termos. Pede e Aguarda Deferimento."

**Why this priority**: Erro visível em documento oficial.

**Independent Test**: Gerar o PDF de um requerimento e conferir que o fecho aparece uma vez só.

**Acceptance Scenarios**:

1. **Given** um requerimento cujo texto não contém o fecho, **When** o PDF é gerado, **Then** o fecho aparece uma única vez, como "Nestes Termos. Pede e Aguarda Deferimento."
2. **Given** um requerimento em que o vereador também digitou "Pede e Aguarda Deferimento." no texto, **When** o PDF é gerado, **Then** o fecho não aparece duplicado.

---

### User Story 2 - Mesma regra nos outros tipos de matéria (Priority: P2)

Os outros tipos de matéria (Indicação, PLOE etc.) também não têm fecho duplicado.

**Why this priority**: O mesmo template pode estar sendo usado em outros tipos.

**Independent Test**: Gerar um PDF de cada tipo de matéria e conferir o fecho.

**Acceptance Scenarios**:

1. **Given** cada tipo de matéria cadastrado, **When** o PDF é gerado, **Then** o fecho (se o tipo tiver fecho) aparece uma única vez.

---

### Edge Cases

- Vereador digita a frase com variação (maiúsculas, sem ponto, espaços extras): também conta como fecho já presente.
- Tipo de matéria que não usa esse fecho: nada muda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O PDF DEVE exibir o fecho uma única vez, no formato "Nestes Termos. Pede e Aguarda Deferimento."
- **FR-002**: Quando o texto digitado já contém o fecho, o sistema DEVE remover automaticamente essas frases do corpo ao gerar o PDF (mantém o fecho do template uma vez).
- **FR-003**: A regra DEVE valer para todos os tipos de matéria que usam fecho.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 PDFs com o fecho repetido, em todos os tipos de matéria.

## Assumptions

- Duplicação = texto digitado + fecho do template; strip no PDF (não aviso no editor) — ver research.md.
