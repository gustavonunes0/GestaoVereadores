Task 20 — Autores, Coautores e Relator

Módulo:
src/legislativo/materias

Objetivo:
Organizar autoria de matérias legislativas.

Regras:
- Autor principal pode ser **parlamentar** (`Parliamentarian`) ou **externo** (`GuestUser` via registro `Autor`).
- Coautores devem ser parlamentares no MVP (`matter_coauthors`).
- Relator deve ser parlamentar (`rapporteurParliamentarianId`).
- Autor parlamentar e externo são mutuamente exclusivos na matéria.

Modelo (migration `20260531160000_matter_authorship`):
- `Materia.authorParliamentarianId` → autor parlamentar
- `Materia.autorId` + `Autor.guestUserId` → autor externo
- `Materia.rapporteurParliamentarianId` → relator
- `matter_coauthors` → coautores parlamentares

Endpoints:
- `GET /legislative/materias/:id/autoria` — visão consolidada da autoria
- `PUT /legislative/materias/:id/autoria/autor-parlamentar` — `{ parliamentarianId }`
- `PUT /legislative/materias/:id/autoria/autor-externo` — `{ guestUserId, tipoAutorId? }`
- `POST /legislative/materias/:id/autoria/coautores` — `{ parliamentarianId }`
- `DELETE /legislative/materias/:id/autoria/coautores/:coauthorId`
- `PUT /legislative/materias/:id/autoria/relator` — `{ parliamentarianId }`

Critério de aceite:
- Matéria consegue registrar autor parlamentar e autor externo (exclusivos).
- Coautores e relator validados como parlamentares da Câmara.
