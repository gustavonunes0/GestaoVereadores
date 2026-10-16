# Feature Specification: Parlamentares — status consistente entre listagem, detalhe e sessão

**Feature Branch**: `011-status-parlamentar-consistente`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-11 de docs/bugs-e-features-sessao-baturite.md — Lindomar da Silva Soares aparece 'Ativo' na listagem de parlamentares, mas a conta de acesso está 'Inativo' no detalhe; status legislativo e mandato mostram 'ACTIVE' mesmo substituído desde 15/10/2026."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listagem mostra o status real (Priority: P1)

O selo na listagem de parlamentares bate com o detalhe e com o que o painel da sessão usa.

**Why this priority**: Status divergente leva a decisões erradas (ex.: incluir inativo na sessão) e é a base da spec 004.

**Independent Test**: Abrir `/camara/parlamentares` e comparar o selo de Lindomar da Silva Soares com o detalhe dele.

**Acceptance Scenarios**:

1. **Given** um parlamentar inativo, **When** a listagem é aberta, **Then** o selo mostra "Inativo", igual ao detalhe.
2. **Given** listagem, detalhe e painel da sessão, **When** consultam o status do mesmo parlamentar, **Then** os três usam a mesma regra e mostram o mesmo resultado.
3. **Given** o modelo de status, **When** a listagem é exibida, **Then** segue a Opção A — status único (`Parliamentarian.status`); inativar/reativar a conta sincroniza o status legislativo (alinhado à spec 004).

---

### User Story 2 - Filtro por status (Priority: P2)

O usuário filtra a listagem por Ativos, Inativos ou Todos.

**Why this priority**: Facilita conferir quem está em exercício.

**Independent Test**: Aplicar cada filtro e conferir os resultados.

**Acceptance Scenarios**:

1. **Given** a listagem, **When** o filtro "Ativos" é aplicado, **Then** só aparecem parlamentares ativos (pela regra definida no cenário 1.3).
2. **Given** o filtro "Inativos" ou "Todos", **When** aplicado, **Then** o resultado corresponde ao filtro.

---

### User Story 3 - Atualização imediata ao inativar/reativar (Priority: P2)

Ao inativar ou reativar um parlamentar, a listagem reflete a mudança sem recarregar a página.

**Why this priority**: Evita que o usuário veja o status antigo logo após a ação.

**Independent Test**: Inativar um parlamentar pelo detalhe e fechar o modal: o selo na listagem já mostra "Inativo".

**Acceptance Scenarios**:

1. **Given** um parlamentar ativo, **When** é inativado, **Then** a listagem passa a mostrar "Inativo" sem recarregar.

---

### Edge Cases

- Rótulos em inglês ("ACTIVE"): todos os status exibidos ficam em português (P-01 do documento).
- Titular substituído com status legislativo "ACTIVE" e selo "Em exercício" (P-02): o selo "Em exercício" não aparece para quem está afastado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O selo de status na listagem DEVE refletir o status real do parlamentar, igual ao detalhe.
- **FR-002**: Listagem, detalhe e painel da sessão DEVEM usar a mesma fonte/regra de status.
- **FR-003**: A listagem DEVE oferecer filtro por status: Ativos, Inativos, Todos.
- **FR-004**: Inativar ou reativar DEVE atualizar a listagem automaticamente.
- **FR-005**: Os rótulos de status DEVEM ser exibidos em português ("Ativo", "Inativo"), nunca "ACTIVE".
- **FR-006**: O modelo de status DEVE ser único (Opção A): `Parliamentarian.status` como fonte; sync com conta no revoke/grant.

### Key Entities

- **Parlamentar / Mandato**: status legislativo do parlamentar na legislatura.
- **Conta de acesso**: login do parlamentar no sistema, com status próprio hoje.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 divergências de status entre listagem, detalhe e painel para o mesmo parlamentar.
- **SC-002**: 0 rótulos de status em inglês na interface.
- **SC-003**: A mudança de status aparece na listagem em até 2 segundos após a ação.

## Assumptions

- Opção A (status único), herdada da research da 004 — ver research.md.
- Selo "Em exercício" não aparece quando `Parliamentarian.status` ≠ ACTIVE.
