# Data Model: 009

Usa `Materia.dataProtocolo` existente. Sem migration.

| Campo UI (capa) | Fonte |
|-----------------|--------|
| DATA DO PROTOCOLO | `formatDateParts(dataProtocolo).curta` ou `—` se nulo |
| PROTOCOLO Nº (proposição/termo) | `buildProtocoloLabel` (`I - …`) — inalterado |
