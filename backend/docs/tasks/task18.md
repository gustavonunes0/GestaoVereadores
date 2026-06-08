Task 18 — Membros de Frentes Parlamentares

Módulo:
src/legislativo/frentes-parlamentares

Objetivo:
Gerenciar membros das frentes parlamentares suprapartidárias.

Regras:
- Membro da frente sempre é Parlamentar da mesma Câmara (tenant).
- Frente permite parlamentares de partidos diferentes (suprapartidária).
- Frente pode ter coordenador/presidente (`coordinatorParliamentarianId`).
- Coordenador deve integrar a lista de membros.
- Um parlamentar não pode ser duplicado na mesma frente.
- Partido político não restringe adesão à frente.

Endpoints:
- `POST /legislative/frentes-parlamentares/:id/membros` — adiciona membro (`setAsCoordinator` opcional).
- `DELETE /legislative/frentes-parlamentares/:id/membros/:membroId` — remove membro (limpa coordenador se aplicável).

Validação ao adicionar membro:
1. Buscar frente por id + tenantId.
2. Buscar parlamentar por id + tenantId.
3. Impedir parlamentar duplicado na mesma frente.
4. Opcionalmente definir como coordenador via `setAsCoordinator`.

Critério de aceite:
- Frente possui lista de membros suprapartidários (partidos visíveis na resposta).
- É possível designar coordenador entre os membros.
- Duplicata de parlamentar na mesma frente é rejeitada.
