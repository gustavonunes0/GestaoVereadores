# Research: 004

## Decision: FR-008 — status do mandato/parlamentar

**Decision**: Usar `Parliamentarian.status` (`ACTIVE`/`INACTIVE`), não `ParlamentarianUser.status`.

**Rationale**: Alinha à regra já embarcada em `assertParlamentarAtivo` / `semOcupantesInativos` e ao BUG-11 opção A (status legislativo).

**Alternatives considered**: Filtrar só conta de acesso — rejeitado (divergiria do código e do quórum).

## Decision: FR-009 — voto antes da inativação

**Decision**: Voto registrado antes da inativação **continua valendo**. Só votações abertas depois excluem o inativo.

**Rationale**: Premissa do documento de bugs; histórico legal preservado.

## Decision: FR-005/006 — sem `inactivatedAt`

**Decision**: Não criar migration. Sessões ao vivo filtram pelo status atual; elenco congelado de sessões encerradas permanece intacto (histórico aproximado). Gap de “sessão encerrada depois da inativação mas sem timestamp” fica como follow-up.

**Rationale**: Schema sem campo de histórico; inventar migration fora do escopo mínimo.

**Follow-up**: Modelo de histórico de status (inactivatedAt/reactivatedAt) + filtro temporal para atas/relatórios.
