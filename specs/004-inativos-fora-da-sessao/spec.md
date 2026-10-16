# Feature Specification: Sessão — vereadores inativos não participam nem aparecem

**Feature Branch**: `004-inativos-fora-da-sessao`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-04 de docs/bugs-e-features-sessao-baturite.md — Vereadores com conta inativa (titulares afastados ou suplentes fora do exercício) ainda aparecem e participam da sessão (presença e votação)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Só ativos aparecem e contam na sessão (Priority: P1)

Na presença e na votação da sessão, só aparecem vereadores ativos. Contadores, quórum e total de votos consideram apenas eles. O titular afastado some e o suplente ativo aparece no lugar.

**Why this priority**: Inativo contando para o quórum ou para a votação afeta a validade da sessão.

**Independent Test**: Inativar um titular substituído e abrir a sessão: ele não aparece na grade, na Mesa, nos contadores nem na votação; o suplente ativo aparece.

**Acceptance Scenarios**:

1. **Given** um titular inativo com suplente ativo, **When** o painel de presença é aberto, **Then** só o suplente aparece, e os contadores não incluem o titular.
2. **Given** um vereador inativo, **When** uma votação é aberta, **Then** ele não está na lista de votantes nem no total de votos.
3. **Given** um membro da Mesa inativo, **When** o painel é aberto, **Then** ele não aparece no card da Mesa.

---

### User Story 2 - Back-end bloqueia presença e voto de inativo (Priority: P1)

Mesmo que alguém tente direto pela API, o sistema recusa presença e voto de conta inativa.

**Why this priority**: Esconder na tela não basta; a regra precisa valer na origem.

**Independent Test**: Enviar registro de presença e de voto para uma conta inativa direto na API e verificar a recusa com mensagem clara.

**Acceptance Scenarios**:

1. **Given** uma conta inativa, **When** chega uma requisição de presença para ela, **Then** o sistema recusa e informa que a conta está inativa.
2. **Given** uma conta inativa, **When** chega uma requisição de voto, **Then** o sistema recusa e o placar não muda.

---

### User Story 3 - Inativação vale para frente, inclusive durante a sessão (Priority: P2)

A inativação guarda data e hora. Sessões anteriores continuam mostrando o vereador. Na sessão em andamento, ele sai do painel na hora e contadores e quórum são recalculados.

**Why this priority**: Preserva o histórico legal (atas, votos) e mantém o painel correto em tempo real.

**Independent Test**: Com uma sessão aberta, inativar um vereador presente: ele sai do painel e os contadores caem em tempo real; uma sessão encerrada antes continua mostrando sua presença e seus votos.

**Acceptance Scenarios**:

1. **Given** uma sessão encerrada antes da inativação, **When** se consulta presença, votos, ata ou relatório, **Then** o vereador aparece normalmente.
2. **Given** uma sessão em andamento, **When** o vereador é inativado, **Then** ele sai do painel e os contadores/quórum são recalculados sem recarregar a tela.
3. **Given** um vereador inativado durante a sessão, **When** uma votação é aberta depois disso, **Then** ele não está incluído.
4. **Given** um voto registrado antes da inativação, na mesma sessão, **When** o vereador é inativado, **Then** o voto continua valendo (não é anulado).

---

### Edge Cases

- Vereador reativado: volta a aparecer a partir da reativação; o período inativo não ganha presença retroativa.
- Inativação durante uma votação aberta: o comportamento sobre o voto dessa votação segue a resposta do FR-009.
- Quórum calculado no momento da abertura com um vereador que foi inativado logo depois: o registro da abertura não muda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Contas inativas NÃO DEVEM aparecer na grade de presença, no card da Mesa nem nos contadores.
- **FR-002**: Contadores e quórum DEVEM considerar apenas contas ativas.
- **FR-003**: Contas inativas NÃO DEVEM aparecer na lista de votantes nem entrar no total de votos.
- **FR-004**: O sistema DEVE recusar, na origem, registros de presença e de voto de conta inativa, com mensagem explicando o motivo.
- **FR-005**: O sistema DEVE guardar data e hora de cada inativação e reativação.
- **FR-006**: O filtro de participação DEVE usar a data/hora da inativação, não só o status atual: sessões encerradas antes dela mostram o vereador normalmente.
- **FR-007**: Na sessão em andamento, a inativação DEVE retirar o vereador do painel e recalcular contadores e quórum em tempo real.
- **FR-008**: O "status ativo" usado nesta regra DEVE ser o de `Parliamentarian.status` (`ACTIVE`/`INACTIVE`), não o da conta de acesso (`ParlamentarianUser`).
- **FR-009**: Votos registrados antes da inativação, na mesma sessão, DEVEM continuar valendo (não são anulados).

### Key Entities

- **Histórico de status do vereador**: registros de ativação/inativação com data e hora; base para filtrar sessões passadas e futuras.
- **Presença** e **Voto**: continuam ligados ao vereador; não são apagados pela inativação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 contas inativas visíveis ou contadas em sessões e votações abertas depois da inativação.
- **SC-002**: 100% das tentativas de presença ou voto de conta inativa recusadas, inclusive por chamada direta.
- **SC-003**: Sessões encerradas antes da inativação mantêm 100% dos registros de presença e voto do vereador.
- **SC-004**: Na sessão em andamento, o painel reflete a inativação em até 2 segundos.

## Assumptions

- FR-008 resolvido: `Parliamentarian.status`.
- FR-009 resolvido: voto anterior continua valendo.
- Sem campo `inactivatedAt` no schema: filtro histórico temporal fica como follow-up; sessões ao vivo usam status atual; elenco de sessões encerradas é preservado.
- Contas inativadas antes desta correção não têm data de inativação; filtro temporal completo depende do follow-up.
- Base para a spec 017 (quórum da Chamada só com contas ativas).
