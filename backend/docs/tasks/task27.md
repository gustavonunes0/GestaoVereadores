Task 27 — Cálculo de Resultado da Votação

Módulo: `src/legislativo/votacoes`

## Objetivo

Calcular automaticamente o resultado da votação a partir dos votos registrados.

## Regras

- Contar **votosSim**, **votosNao** e **abstencoes** (inclui ABSTENCAO e PRESENTE).
- Calcular resultado comparando sim × não:
  - mais sim → **APROVADO**
  - mais não → **REJEITADO**
  - empate → **EMPATADO**
- **Nominal/secreta:** totais vêm dos votos individuais; não aceita `votosSim`/`votosNao` manual no body.
- **Simbólica:** totais informados na finalização (`votosSim`, `votosNao`, `abstencoes?`).
- Atualizar `PautaItem.resultado` (APROVADO, REJEITADO ou ADIADO em empate).
- Tramitar **Matéria** apenas em APROVADO/REJEITADO.

## Endpoints

Catálogo:

- `GET /legislative/votacoes/resultados/valores` — APROVADO, REJEITADO, EMPATADO

Operação:

- `GET /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/resultado` — preview do cálculo
- `PATCH /legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao/finalizar` — persiste resultado e efeitos

Query/body opcional na simbólica: `votosSim`, `votosNao`, `abstencoes`.

## Critério de aceite

- [x] Contagem de sim, não e abstenções
- [x] Resultado calculado (não informado manualmente em nominal/secreta)
- [x] PautaItem atualizado conforme resultado
- [x] Matéria tramitada quando APROVADO/REJEITADO
- [x] Preview antes de finalizar
