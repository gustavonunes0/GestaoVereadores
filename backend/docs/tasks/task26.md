Task 26 — Registro de Votos

Módulo: `src/legislativo/votacoes`

## Objetivo

Registrar voto individual de parlamentar quando a votação permitir (nominal/secreta).

## Regras

- `VotoParlamentar` pertence a uma `Votacao`.
- Voto referencia um parlamentar (`parlamentarId`).
- Parlamentar **só vota uma vez** por votação (unique `votacaoId + parlamentarId`; alteração via PATCH).
- Parlamentar precisa ter **mandato ativo** na legislatura da sessão.
- Quando `exigePresenca` está ativo na votação (padrão `true`), parlamentar precisa estar presente.
- Valores: **SIM**, **NAO**, **ABSTENCAO**, **PRESENTE**.
- Votação simbólica não aceita registro individual.

## Endpoints

Catálogo:

- `GET /legislative/votacoes/votos/valores` — valores de voto

Operação (via sessão plenária):

- `GET /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/votos` — lista votos
- `GET /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/votos/:votoId` — detalhe
- `POST /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/votos` — registrar (`parlamentarId`, `voto`)
- `PATCH /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/votos/:votoId` — alterar voto

Ao abrir votação, `exigePresenca` pode ser informado em `POST .../votacao` (padrão `true`).

## Critério de aceite

- [x] Voto vinculado à votação e ao parlamentar
- [x] Mandato ativo obrigatório
- [x] Presença validada quando configurada
- [x] Sem voto duplicado por parlamentar/votação
- [x] Valores SIM, NAO, ABSTENCAO e PRESENTE
- [x] View-model de voto com parlamentar e label do valor
