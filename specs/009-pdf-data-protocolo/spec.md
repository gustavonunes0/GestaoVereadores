# Feature Specification: PDF da matéria — "Data do protocolo" legível

**Feature Branch**: `009-pdf-data-protocolo`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-09 de docs/bugs-e-features-sessao-baturite.md — O campo 'Data do protocolo' do PDF mostra 'I - 15100000/2026' (data DDMM com zeros presa numa máscara de número) em vez de uma data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Data do protocolo em DD/MM/AAAA (Priority: P1)

O PDF mostra a data de protocolo da matéria no formato DD/MM/AAAA, igual ao registro.

**Why this priority**: Erro visível em documento oficial.

**Independent Test**: Gerar o PDF de uma matéria protocolada em 15/10/2026 e conferir "15/10/2026" no campo.

**Acceptance Scenarios**:

1. **Given** uma matéria protocolada em 15/10/2026, **When** o PDF é gerado, **Then** o campo mostra a data no formato DD/MM/AAAA, sem zeros sobrando.
2. **Given** uma matéria protocolada em 28/08/2026, **When** o PDF é gerado, **Then** o campo mostra a data correspondente ao registro de protocolo.
3. **Given** o prefixo "I -" (número de protocolo nos modelos), **When** o PDF é gerado, **Then** o campo DATA DO PROTOCOLO mostra só DD/MM/AAAA; o "I -" permanece apenas em PROTOCOLO Nº / termo.

---

### Edge Cases

- Matéria sem data de protocolo (ainda não protocolada): o campo fica em branco ou "—", nunca com número sem sentido.
- PDFs já gerados com o valor errado: podem ser regerados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O campo "Data do protocolo" DEVE exibir a data no formato DD/MM/AAAA.
- **FR-002**: A data exibida DEVE ser a do registro de protocolo da matéria.
- **FR-003**: O campo NÃO DEVE exibir zeros sobrando nem máscara numérica.
- **FR-004**: O prefixo "I -" DEVE permanecer apenas no número de protocolo; NÃO DEVE aparecer em DATA DO PROTOCOLO.
- **FR-005**: Matéria sem protocolo NÃO DEVE exibir valor inventado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos PDFs gerados mostram a data de protocolo em DD/MM/AAAA, conferindo com o registro.
- **SC-002**: 0 ocorrências de valores no formato "DDMM0000/AAAA".

## Assumptions

- Prefixo "I -" é padrão do **número** de protocolo (modelos oficiais); a data usa só DD/MM/AAAA (ver research.md).
