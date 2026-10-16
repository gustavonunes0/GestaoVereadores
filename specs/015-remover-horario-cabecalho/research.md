# Research: 015

## Decision: Escopo do FR-004 — só cabeçalho da gestão

**Decision**: Alterar apenas o subtítulo do detalhe/gestão da sessão (`sessaoDetalheSubtitulo` + render no cabeçalho). Listagem de sessões, painel público e documentos (ata/convocação/relatório) **não** mudam.

**Rationale**: Spec Assumptions e pedido BUG-15; menor superfície. Clarification do FR-004 resolvida por assunção até validação da Câmara.

**Alternatives considered**: Remover horário também da listagem e do painel (adiado até validação).

## Decision: Helper sem HH:mm; ocultar `<p>` vazio

**Decision**: `sessaoDetalheSubtitulo` retorna só `mensagem` (ou `''`). Em `SessaoDetalhePage`, renderizar `.lex-sessao-header__sub` somente se houver texto — evita espaço vazio (FR-002).
