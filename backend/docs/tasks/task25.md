Task 25 — Base de Votação

Módulo: `src/legislativo/votacoes`

## Objetivo

Criar e gerenciar votação vinculada a item de pauta em sessão plenária válida.

## Regras

- `Votacao` pertence a um `PautaItem` (relação 1:1 no MVP).
- Item de pauta precisa estar em sessão **EM_ANDAMENTO** e matéria na pauta.
- Um item de pauta possui no máximo **uma votação principal**.
- Tipos: **NOMINAL**, **SIMBOLICA** e **SECRETA**.
- Abertura exige quorum quando o tipo de sessão exige.
- Voto individual só em nominal/secreta; simbólica finaliza com totais informados.
- Votação secreta oculta votos individuais na resposta HTTP.

## Endpoints

Catálogo:

- `GET /legislative/votacoes/tipos` — tipos de votação

Operação (via sessão plenária, sempre com `pautaItemId`):

- `GET /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao`
- `POST /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao` — abrir (`tipoVotacao`)
- `POST /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/votos` — registrar voto
- `PATCH /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/finalizar` — encerrar

## Critério de aceite

- [x] Votação sempre vinculada a item de pauta (sem votação solta)
- [x] Sessão válida e matéria na pauta antes de abrir
- [x] Uma votação principal por item (unique `pautaItemId`)
- [x] Tipos nominal, simbólica e secreta
- [x] View-model com tipo, totais, resultado e flags de operação
