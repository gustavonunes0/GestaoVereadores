# Research: 010

## Decision: Remover fecho do texto digitado na geração (não avisar no editor)

**Decision**: FR-002 → strip automático de "Nestes Termos" / "Pede e Aguarda Deferimento" (variações de caixa/pontuação) em ementa e justificativa ao montar o HTML; o template continua emitindo o fecho uma vez.

**Rationale**: Documento oficial fica correto sem exigir UX nova no editor; origem da duplicação é texto + template (ambos).

**Alternatives considered**: Aviso no editor — fora do escopo mínimo; só corrigir template — não cobre texto já digitado.
