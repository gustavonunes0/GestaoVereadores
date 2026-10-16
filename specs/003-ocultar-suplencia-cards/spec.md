# Feature Specification: Painel — remover indicação de suplência nos cards de vereador

**Feature Branch**: `003-ocultar-suplencia-cards`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-03 de docs/bugs-e-features-sessao-baturite.md — Cards de suplentes em exercício mostram 'Suplente · subst. <titular>' nos painéis de presença e votação, fora do padrão visual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Suplente aparece como qualquer vereador (Priority: P1)

No painel público, o suplente em exercício aparece com foto, nome, partido e status, igual aos demais. Não há menção a suplência nem ao titular.

**Why this priority**: É informação que a Câmara não quer expor no painel, e o texto quebra o alinhamento da grade.

**Independent Test**: Abrir os painéis de presença e de votação de uma sessão com suplentes em exercício (ex.: Hermenegildo Barros Ferreira) e conferir que nenhum card contém "Suplente", "subst." ou o nome do titular.

**Acceptance Scenarios**:

1. **Given** um suplente em exercício na sessão, **When** o painel de presença é aberto, **Then** o card dele mostra só foto, nome, partido e status.
2. **Given** o mesmo suplente, **When** o painel de votação é aberto, **Then** o card não mostra suplência nem titular.
3. **Given** um suplente que integra a Mesa Diretora, **When** o painel é aberto, **Then** o card da Mesa também não mostra suplência.
4. **Given** a grade com suplentes e titulares, **When** é exibida, **Then** todos os cards têm a mesma altura e estrutura.

---

### User Story 2 - Presença do suplente vem do registro dele (Priority: P2)

O status de presença exibido no card do suplente é o do próprio suplente, nunca o do titular afastado.

**Why this priority**: SONIRA GOMES apareceu AUSENTE mesmo em exercício; o status pode estar vindo do registro errado.

**Independent Test**: Registrar presença para um suplente em exercício e conferir que o card dele fica PRESENTE.

**Acceptance Scenarios**:

1. **Given** um suplente em exercício com presença registrada, **When** o painel é exibido, **Then** o card dele mostra PRESENTE.
2. **Given** o titular afastado sem presença, **When** o painel é exibido, **Then** isso não afeta o status do suplente.

---

### Edge Cases

- Nome do suplente mais longo que o dos titulares: segue a mesma regra de truncamento dos demais cards.
- Dois suplentes ativos para a mesma titular (P-05 do documento: Oriel Moreira e SONIRA GOMES): fora do escopo desta spec, mas a exibição não deve quebrar; registrado como pendência.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Os cards de vereador nos painéis de presença e de votação NÃO DEVEM exibir "Suplente", "subst." nem o nome do titular.
- **FR-002**: O card da Mesa Diretora NÃO DEVE exibir indicação de suplência.
- **FR-003**: Os cards de suplentes DEVEM ter a mesma estrutura e altura dos demais cards.
- **FR-004**: O vínculo suplente → titular DEVE continuar salvo e visível no cadastro de parlamentares e nos relatórios.
- **FR-005**: O status de presença exibido para um suplente em exercício DEVE vir do registro de presença do próprio suplente.

### Key Entities

- **Substituição**: vínculo entre suplente e titular, com período; continua existindo, só deixa de ser exibido no painel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 ocorrências de texto de suplência nos painéis de presença e votação.
- **SC-002**: 100% dos cards de uma mesma grade com altura idêntica.
- **SC-003**: Em 100% dos casos testados, a presença registrada para o suplente aparece no card dele.

## Assumptions

- A investigação do caso SONIRA GOMES (status AUSENTE) faz parte desta spec; se a causa for dado duplicado de substituição (P-05), a correção do dado é tratada à parte.
- O impedimento de duas substituições ativas para o mesmo titular (P-05) é pendência separada, ainda não registrada como bug.
