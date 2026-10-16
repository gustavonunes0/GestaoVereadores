# Research: 017

## Decision: Quem registra presença

**Decision**: Secretário (fluxo manual atual em PresencaPanel); check-in do vereador permanece como está se já existir. Não bloquear um dos lados.

**Rationale**: Menor risco; Câmara pode validar depois.

## Decision: Regra de quórum

**Decision**: Reutilizar `quorumMinimo` da sessão / `QuorumService` (maioria absoluta padrão: floor(n/2)+1 sobre membros ativos + Mesa). Sem hardcode de Baturité.

**Rationale**: FR-006 já pede configuração; código atual cobre.

## Decision: Pauta no painel durante Chamada

**Decision**: Manter layout das specs 001–003 (presença + faixa de pauta no rodapé). Cabeçalho da fase: "CHAMADA".

**Rationale**: Spec assumptions; evita regressão.

## Decision: Ciclo Agendada → Chamada → Aberta

**Decision**: Novo `StatusSessao.CHAMADA`; `dataInicioChamada`; abertura só a partir de CHAMADA; histórico `CHAMADA_INICIADA` + `SESSAO_ABERTA` com presentes.

**Alternatives**: Reusar fase sem novo status (rejeitado — FR-001/FR-002 pedem status e selo próprios).
