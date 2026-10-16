# Feature Specification: Detalhe do parlamentar — modal ampliado e Substituições em destaque

**Feature Branch**: `012-modal-detalhe-parlamentar`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-12 de docs/bugs-e-features-sessao-baturite.md — O modal de detalhe do parlamentar é estreito e com rolagem interna; a seção Substituições fica no fim, sem destaque, e o botão de adicionar é só um ícone."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o parlamentar inteiro sem rolar (Priority: P1)

O detalhe abre maior, em duas colunas: Identificação + Conta | Mandatos + Substituições.

**Why this priority**: Hoje é preciso rolar para ver informações relacionadas.

**Independent Test**: Abrir o detalhe de um parlamentar com mandato e substituição em 1920×1080: tudo visível sem rolar.

**Acceptance Scenarios**:

1. **Given** um parlamentar com mandato e substituições, **When** o detalhe é aberto em 1920×1080, **Then** todo o conteúdo aparece sem rolagem, em duas colunas.
2. **Given** o mesmo parlamentar em 1366×768, **When** o detalhe é aberto, **Then** a rolagem é mínima.

---

### User Story 2 - Substituição em andamento em destaque (Priority: P1)

Quando há substituição em andamento, um aviso no topo informa a situação. Ex.: "Afastado desde 15/10/2026 · Substituído por Hermenegildo Barros Ferreira · Cargo no Executivo".

**Why this priority**: É a informação mais importante sobre um titular afastado.

**Independent Test**: Abrir o detalhe de Lindomar da Silva Soares e ver o aviso no topo com substituto, motivo e data.

**Acceptance Scenarios**:

1. **Given** um titular com substituição em andamento, **When** o detalhe é aberto, **Then** o topo mostra aviso com data de início, substituto e motivo.
2. **Given** um parlamentar sem substituição em andamento, **When** o detalhe é aberto, **Then** nenhum aviso aparece.
3. **Given** a seção Substituições, **When** exibida, **Then** o card da substituição tem destaque visual e o botão diz "+ Nova substituição".

---

### User Story 3 - Ações de substituição continuam funcionando (Priority: P2)

Editar datas, Encerrar e Histórico funcionam como hoje.

**Why this priority**: O redesenho não pode quebrar o fluxo existente.

**Independent Test**: Executar cada ação no novo layout.

**Acceptance Scenarios**:

1. **Given** uma substituição, **When** o usuário usa Editar datas, Encerrar ou Histórico, **Then** cada ação funciona como antes.

---

### Edge Cases

- Suplente (não titular): o aviso mostra de quem ele é substituto, quando estiver em exercício.
- Muitas substituições no histórico: a seção limita os itens visíveis e oferece "Histórico" para o restante.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O detalhe DEVE abrir em área maior que a atual, organizada em duas colunas (Identificação + Conta | Mandatos + Substituições).
- **FR-002**: Em 1920×1080 o detalhe NÃO DEVE ter rolagem; em 1366×768 a rolagem DEVE ser mínima.
- **FR-003**: Com substituição em andamento, DEVE aparecer um aviso no topo com data de início, substituto e motivo.
- **FR-004**: O card de substituição DEVE ter destaque visual.
- **FR-005**: A ação de adicionar DEVE ser um botão com texto "+ Nova substituição".
- **FR-006**: Editar datas, Encerrar e Histórico DEVEM continuar funcionando.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 rolagem no detalhe em 1920×1080 para um parlamentar com 1 mandato e até 3 substituições.
- **SC-002**: Um usuário identifica se o parlamentar está afastado e por quem foi substituído em menos de 5 segundos após abrir o detalhe.

## Assumptions

- O formato (modal maior, tela cheia ou painel lateral) é decisão de design no plano; a exigência é espaço suficiente para as duas colunas.
- O padrão visual definido aqui é reaproveitado na edição (spec 013).
