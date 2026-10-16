# Research: 007

## Decision: Template já cobre FR-001–006

**Decision**: Manter layout atual (capa AUTORIA + assinaturas flex wrap).

**Rationale**: Specs/tests já validam coautor na capa e nas assinaturas.

## Decision: Regenerar no use-case de coautoria

**Decision**: Após add/remove coautor, chamar `GenerateMateriaTextoOriginalPdfUseCase` (falha de PDF não reverte a coautoria).

**Rationale**: FR-007; edição via dialog já regenerava, API avulsa não.
