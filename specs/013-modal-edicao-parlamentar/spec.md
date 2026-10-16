# Feature Specification: Edição do parlamentar — modal ampliado em duas colunas

**Feature Branch**: `013-modal-edicao-parlamentar`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "BUG-13 de docs/bugs-e-features-sessao-baturite.md — O modal de edição do parlamentar é estreito e longo, com todas as seções numa coluna e rolagem interna."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Editar com tudo à vista (Priority: P1)

O formulário de edição abre maior (80–90% da tela), em duas colunas:
- **Esquerda:** Conta de acesso (CPF, e-mail, senha, vínculo) + Identificação (nome, foto, partido, gabinete).
- **Direita:** Mandato (legislatura, condição, período) + "Em exercício no lugar de um titular".

**Why this priority**: Campos relacionados ficam juntos e a edição fica mais rápida e com menos erro.

**Independent Test**: Abrir "Editar" de um suplente em 1920×1080 e conferir as duas colunas sem rolagem.

**Acceptance Scenarios**:

1. **Given** um parlamentar, **When** "Editar" é aberto em 1920×1080, **Then** o formulário aparece em duas colunas, sem rolagem ou com rolagem mínima.
2. **Given** a mesma tela em 1366×768, **When** aberta, **Then** as seções continuam agrupadas por assunto.
3. **Given** o formulário, **When** o usuário rola (se precisar), **Then** os botões Cancelar e Salvar ficam sempre visíveis no rodapé.

---

### User Story 2 - Regras do formulário mantidas (Priority: P1)

Validações, campos obrigatórios e o bloco condicional de suplência continuam iguais.

**Why this priority**: O redesenho não pode afrouxar validações.

**Independent Test**: Tentar salvar sem campos obrigatórios e alternar a condição entre Titular e Suplente.

**Acceptance Scenarios**:

1. **Given** a condição "Suplente", **When** selecionada, **Then** o bloco "Em exercício no lugar de um titular" aparece em destaque.
2. **Given** a condição "Titular", **When** selecionada, **Then** o bloco não aparece.
3. **Given** campos obrigatórios vazios, **When** o usuário clica em Salvar, **Then** as validações atuais são exibidas.

---

### Edge Cases

- Erro de validação numa coluna que está fora da área visível: o formulário leva o usuário até o primeiro campo com erro.
- Cancelar com alterações não salvas: segue o comportamento atual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O formulário de edição DEVE ocupar 80–90% da tela (ou equivalente em página/painel lateral).
- **FR-002**: Os campos DEVEM ser organizados em duas colunas, conforme a divisão da User Story 1.
- **FR-003**: Cancelar e Salvar DEVEM ficar sempre visíveis no rodapé.
- **FR-004**: O bloco "Em exercício no lugar de um titular" DEVE aparecer em destaque e só para a condição Suplente.
- **FR-005**: Validações e campos obrigatórios atuais DEVEM continuar funcionando.
- **FR-006**: O padrão visual DEVE ser o mesmo do detalhe (spec 012).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 1920×1080, a edição de um suplente cabe na tela sem rolagem ou com rolagem mínima.
- **SC-002**: 100% das validações existentes continuam disparando no novo layout.

## Assumptions

- Formato (modal maior, página ou painel lateral) definido no plano, alinhado à spec 012.
