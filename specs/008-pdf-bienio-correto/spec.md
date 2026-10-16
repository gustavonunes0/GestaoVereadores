# Feature Specification: PDF da matéria — biênio correto

**Feature Branch**: `008-pdf-bienio-correto`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-08 de docs/bugs-e-features-sessao-baturite.md — O PDF mostra 'BIÊNIO 2026/2026' (REQ 119/2026), montado com o ano da matéria repetido, em vez do biênio da legislatura."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Biênio vem da legislatura vigente (Priority: P1)

O PDF mostra o biênio da Mesa/legislatura vigente na data da matéria. Na Legislatura 2025–2028, os biênios são 2025/2026 e 2027/2028.

**Why this priority**: Erro em documento oficial.

**Independent Test**: Gerar o PDF da REQ 119/2026 e da REQ 99/2026: ambos mostram "BIÊNIO 2025/2026".

**Acceptance Scenarios**:

1. **Given** uma matéria de 2026 na Legislatura 2025–2028, **When** o PDF é gerado, **Then** aparece "BIÊNIO 2025/2026".
2. **Given** uma matéria de 2025, **When** o PDF é gerado, **Then** aparece "BIÊNIO 2025/2026".
3. **Given** uma matéria de 2027, **When** o PDF é gerado, **Then** aparece "BIÊNIO 2027/2028".

---

### User Story 2 - Regerar PDFs com erro (Priority: P2)

PDFs já gerados com o biênio errado podem ser gerados de novo com o valor correto.

**Why this priority**: Corrige documentos que já circulam.

**Independent Test**: Regerar o PDF da REQ 119/2026 e conferir o novo biênio.

**Acceptance Scenarios**:

1. **Given** um PDF gerado com "BIÊNIO 2026/2026", **When** é regerado, **Then** mostra "BIÊNIO 2025/2026".

---

### Edge Cases

- Matéria cuja data não cai em nenhum biênio cadastrado: o PDF não inventa valor; o campo fica sem biênio e o problema é registrado para o administrador.
- Matéria protocolada no último dia de um biênio: usa o biênio daquela data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O biênio do PDF DEVE ser o da legislatura/Mesa vigente na data da matéria.
- **FR-002**: O biênio NÃO DEVE ser montado repetindo o ano da matéria.
- **FR-003**: Os biênios DEVEM vir de cadastro ou configuração, não de valor fixo no código.
- **FR-004**: DEVE ser possível regerar PDFs já emitidos com o biênio errado.

### Key Entities

- **Legislatura**: período (ex.: 2025–2028), dividido em biênios.
- **Biênio / Mesa**: período de dois anos dentro da legislatura, usado no cabeçalho do PDF.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos PDFs gerados de matérias de 2025 e 2026 mostram "BIÊNIO 2025/2026".
- **SC-002**: 0 PDFs com biênio formado por ano repetido.

## Assumptions

- "Data da matéria" é a data de protocolo; se não existir, a data de criação.
- P-03 e P-04 do documento (fim de mandato "Previsto 30/12/2026" e períodos de mandato inconsistentes) parecem ter a mesma causa, mas estão fora do escopo desta spec até serem confirmados como bug.
