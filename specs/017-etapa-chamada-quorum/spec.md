# Feature Specification: Sessão — etapa de Chamada antes da abertura, com liberação por quórum

**Feature Branch**: `017-etapa-chamada-quorum`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "FEAT-01 de docs/bugs-e-features-sessao-baturite.md — Nova etapa obrigatória 'Chamada' entre Agendada e Aberta. 'Abrir sessão' só é liberado quando o quórum mínimo é atingido; o painel público mostra a presença durante a chamada."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operador conduz a chamada (Priority: P1)

Numa sessão Agendada, o primeiro botão é "Iniciar chamada"; "Abrir sessão" fica desabilitado. Ao iniciar a chamada, a sessão passa para o status "Chamada", com selo próprio, e as presenças são registradas com o número de presentes atualizado em tempo real.

**Why this priority**: Formaliza o rito da Câmara e evita abrir sessão sem conferir presenças.

**Independent Test**: Numa sessão Agendada, clicar em "Iniciar chamada" e registrar presenças: o status vira "Chamada" e o contador sobe a cada registro.

**Acceptance Scenarios**:

1. **Given** uma sessão Agendada, **When** a gestão da sessão é aberta, **Then** "Iniciar chamada" é a primeira ação e "Abrir sessão" está desabilitado.
2. **Given** a sessão Agendada, **When** o operador clica em "Iniciar chamada", **Then** o status vira "Chamada", com selo próprio no cabeçalho, e o início da chamada é registrado.
3. **Given** a sessão em Chamada, **When** presenças são registradas, **Then** o número de presentes atualiza em tempo real.
4. **Given** a sessão em Chamada, **When** o operador quer cancelar, **Then** "Cancelar sessão" continua disponível.
5. **Given** a sessão em Chamada, **When** as presenças são registradas, **Then** quem registra é o secretário e/ou o vereador (fluxos já existentes; assunção em research.md).

---

### User Story 2 - Abertura liberada só com quórum (Priority: P1)

"Abrir sessão" só é habilitado quando os presentes atingem o quórum mínimo configurado. Se o quórum cair antes da abertura, o botão volta a ficar desabilitado. Ao passar o mouse sobre o botão desabilitado, aparece quantas presenças faltam.

**Why this priority**: É a regra que dá sentido à etapa.

**Independent Test**: Com quórum mínimo de 11, registrar 10 presenças (botão desabilitado, "faltam 1"), a 11ª (botão habilita) e remover uma (desabilita de novo).

**Acceptance Scenarios**:

1. **Given** presentes abaixo do quórum, **When** o operador passa o mouse em "Abrir sessão", **Then** o botão está desabilitado e informa quantas presenças faltam.
2. **Given** presentes iguais ou acima do quórum, **When** a tela atualiza, **Then** "Abrir sessão" fica habilitado.
3. **Given** quórum atingido, **When** uma presença é retirada e o número cai abaixo do mínimo, **Then** o botão volta a ficar desabilitado.
4. **Given** o operador clica em "Abrir sessão", **When** a sessão abre, **Then** ficam registrados para a ata: início da chamada, presentes no momento da abertura e hora da abertura.
5. **Given** o cálculo do quórum, **When** é feito, **Then** considera só contas ativas (spec 004), inclui a Mesa Diretora e usa `quorumMinimo` configurável / QuorumService (assunção em research.md).

---

### User Story 3 - Painel público mostra a chamada ao vivo (Priority: P2)

Durante a Chamada, o painel público mostra a tela de presença com os contadores ao vivo, o cabeçalho "CHAMADA" (no lugar de "EXPEDIENTE") e o indicador de quórum. Ex.: "Quórum mínimo: 11 · 13 presentes ✓ Atingido".

**Why this priority**: Dá transparência ao público sobre o quórum.

**Independent Test**: Iniciar a chamada com o painel aberto e acompanhar o indicador mudar para "Atingido".

**Acceptance Scenarios**:

1. **Given** a sessão em Chamada, **When** o painel público está aberto, **Then** mostra a tela de presença com cabeçalho "CHAMADA" e indicador de quórum.
2. **Given** a sessão ainda Agendada, **When** o painel é aberto, **Then** não exibe "AO VIVO" (P-06 do documento).
3. **Given** o painel durante a Chamada, **When** exibido, **Then** a Pauta aparece no rodapé (layout da spec 001; assunção em research.md).

---

### Edge Cases

- Quórum não atingido: a sessão permanece em Chamada até o operador abrir ou cancelar manualmente (sem cancelamento/adiamento automático — comportamento provisório, ver Assumptions).
- Vereador inativado durante a Chamada: sai da contagem na hora (spec 004).
- Painel aberto ou recarregado no meio da Chamada: mostra direto a tela de presença com os números atuais.
- Duas pessoas operando a mesma sessão: o botão "Abrir sessão" fica coerente para ambas; a abertura acontece uma vez só.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O ciclo da sessão DEVE ser Agendada → Chamada → Aberta; não DEVE ser possível abrir uma sessão sem passar pela Chamada.
- **FR-002**: O status "Chamada" DEVE ter selo próprio no cabeçalho da gestão da sessão.
- **FR-003**: "Abrir sessão" DEVE ficar desabilitado até o quórum mínimo e mostrar quantas presenças faltam.
- **FR-004**: Se o número de presentes cair abaixo do quórum antes da abertura, "Abrir sessão" DEVE voltar a ficar desabilitado.
- **FR-005**: O sistema DEVE recusar, na origem, a abertura de sessão sem quórum, mesmo por chamada direta.
- **FR-006**: O quórum mínimo DEVE vir de configuração (regimento), não de valor fixo no código.
- **FR-007**: O cálculo DEVE considerar apenas contas ativas e incluir a Mesa Diretora.
- **FR-008**: O painel público DEVE mostrar, durante a Chamada, a tela de presença com contadores, cabeçalho "CHAMADA" e indicador de quórum.
- **FR-009**: O painel NÃO DEVE mostrar "AO VIVO" enquanto a sessão estiver Agendada.
- **FR-010**: O sistema DEVE registrar, para a ata, o início da chamada, os presentes no momento da abertura e a hora da abertura.
- **FR-011**: "Cancelar sessão" DEVE continuar disponível durante a Chamada.

### Key Entities

- **Sessão**: ganha o status "Chamada" e os registros de início da chamada e de abertura.
- **Configuração de quórum**: regra do regimento (fração e base de cálculo), por Câmara.
- **Presença**: registro por vereador; base da contagem em tempo real.
- **Registro de abertura**: lista de presentes no instante da abertura, usada na ata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 sessões abertas sem quórum.
- **SC-002**: O botão "Abrir sessão" reflete o quórum em até 2 segundos após cada registro ou retirada de presença.
- **SC-003**: 100% das sessões abertas têm início da chamada, presentes na abertura e hora da abertura disponíveis para a ata.
- **SC-004**: O público vê no painel se o quórum foi atingido sem nenhuma ação no computador do painel.

## Assumptions

- **Provisório (falta validar):** quórum não atingido não gera cancelamento ou adiamento automático; o operador decide. É o comportamento mais conservador, igual ao de hoje.
- Clarificações resolvidas em research.md (presença secretário+vereador; quórum via config; pauta no rodapé).
- Sessões já abertas ou encerradas antes desta mudança não passam pela Chamada retroativamente.
- O painel da Chamada usa os layouts das specs 001, 002 e 003.
- Depende da spec 004 (só contas ativas) e é a base da spec 018.
