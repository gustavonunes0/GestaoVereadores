# Data Model: 018

## SessaoPlenaria

- `pautaItemAtualId String?` — FK opcional para `PautaItem` da mesma sessão

## Etapa do painel (derivada)

- CHAMADA → tela presença
- ABERTA sem item → espera
- ABERTA com item → matéria
- Votação aberta → votação (prioridade)
- Votação encerrada → resultado (~25s) → matéria
