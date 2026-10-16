# Research: 009

## Decision: Prefixo "I -" não pertence ao campo de data

**Decision**: Manter `I - DDMM####/AAAA` apenas em campos de **número de protocolo** (`PROTOCOLO Nº`, termo "protocolado sob o nº"). O rótulo **DATA DO PROTOCOLO** usa só `DD/MM/AAAA`.

**Rationale**: Nos modelos oficiais e scripts de comparação, `dataProtocoloLabel` é o número; `dataProtocoloCurta` já é a data. O bug é binding errado na capa (`dataProtocoloLabel` no campo de data).

**Alternatives considered**: Remover "I -" globalmente — rejeitado (quebra PROTOCOLO Nº nos modelos).

## Decision: Sem data de protocolo → "—"

**Decision**: Se `Materia.dataProtocolo` for nulo, o valor do campo DATA DO PROTOCOLO na capa é `—`. Demais datas do PDF (autuação/proposição) continuam com `createdAt` como fallback operacional.

**Rationale**: FR-005 — não inventar data de protocolo.
