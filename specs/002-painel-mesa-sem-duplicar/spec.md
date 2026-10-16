# Feature Specification: Painel da sessão — Mesa Diretora fora da grade de presença

**Feature Branch**: `002-painel-mesa-sem-duplicar`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-02 de docs/bugs-e-features-sessao-baturite.md — Membros da Mesa Diretora aparecem duplicados (card da Mesa e grade de Presença) e o card da Mesa não mostra presença."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cada vereador aparece uma única vez no painel (Priority: P1)

Quem integra a Mesa Diretora da sessão aparece só no card da Mesa. A grade de Presença mostra apenas os demais vereadores.

**Why this priority**: A duplicação confunde o público e passa a impressão de contagem errada.

**Independent Test**: Abrir o painel de uma sessão com Mesa de 4 membros e 20 vereadores ativos; a grade mostra 16 cards e nenhum nome repetido.

**Acceptance Scenarios**:

1. **Given** uma sessão com Mesa Diretora composta por 4 vereadores, **When** o painel é aberto, **Then** a grade de Presença mostra só os 16 vereadores fora da Mesa.
2. **Given** a composição da Mesa vinculada à sessão, **When** a Mesa muda (ex.: novo biênio), **Then** a grade passa a excluir os novos membros sem nenhum ajuste manual.

---

### User Story 2 - Presença dos membros da Mesa visível (Priority: P1)

Cada membro no card da Mesa mostra se está PRESENTE ou AUSENTE, no mesmo padrão visual da grade (selo colorido e borda lateral verde/vermelha).

**Why this priority**: Ao tirar a Mesa da grade, a presença dela só pode ser vista no card da Mesa.

**Independent Test**: Registrar a presença do Presidente e conferir que o card da Mesa troca o status dele em tempo real.

**Acceptance Scenarios**:

1. **Given** um membro da Mesa sem presença registrada, **When** o painel é exibido, **Then** o card dele mostra AUSENTE com selo e borda vermelha.
2. **Given** o operador registra a presença desse membro, **When** o painel está aberto, **Then** o card passa para PRESENTE com selo e borda verde, sem recarregar.

---

### Edge Cases

- Sessão sem Mesa vinculada: o card da Mesa mostra estado vazio e todos os vereadores aparecem na grade.
- Cargo da Mesa vago: o card mostra o cargo sem ocupante, e ninguém é removido da grade por esse cargo.
- Membro da Mesa com conta inativa: some do card (regra da spec 004).
- Membro da Mesa é suplente em exercício: aparece sem texto de suplência (spec 003).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A grade de Presença NÃO DEVE exibir vereadores que integram a Mesa Diretora vinculada à sessão.
- **FR-002**: A identificação dos membros da Mesa DEVE usar a composição da Mesa vinculada à sessão, nunca nomes ou IDs fixos.
- **FR-003**: Cada membro no card da Mesa DEVE exibir o status de presença (PRESENTE/AUSENTE) no mesmo padrão visual da grade.
- **FR-004**: O status de presença no card da Mesa DEVE atualizar em tempo real.
- **FR-005**: O card da Mesa NÃO DEVE exibir indicação de suplência (spec 003).
- **FR-006**: Os contadores "presentes / ausentes" DEVEM considerar todos os vereadores em exercício da sessão, **incluindo** os membros da Mesa (base do quórum), mesmo que a grade mostre só quem não está na Mesa.

### Key Entities

- **Mesa Diretora da sessão**: composição (Presidente, Vice, 1º e 2º Secretários) vinculada à sessão; define quem sai da grade.
- **Presença**: registro por vereador e sessão; alimenta tanto a grade quanto o card da Mesa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nenhum vereador aparece mais de uma vez no painel, em 100% das sessões.
- **SC-002**: O status de presença de cada membro da Mesa fica visível no painel e atualiza em até 2 segundos após o registro.
- **SC-003**: Trocar a composição da Mesa reflete no painel sem alteração de código ou configuração manual.

## Assumptions

- Com 16 cards, o layout pode usar 4 ou 8 colunas para fechar as linhas (alinhado com a spec 001).
- O padrão visual de presença (selo + borda lateral) é o já usado na grade hoje.
- Depende da spec 004 para excluir contas inativas e da spec 003 para remover textos de suplência.
