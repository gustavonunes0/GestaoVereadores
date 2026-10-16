# Data Model: 017

## StatusSessao

Valores: `AGENDADA | CHAMADA | ABERTA | SUSPENSA | ENCERRADA | CANCELADA`

Transições:
- AGENDADA → CHAMADA | CANCELADA
- CHAMADA → ABERTA | CANCELADA
- ABERTA → SUSPENSA | ENCERRADA
- SUSPENSA → ABERTA | ENCERRADA

## SessaoPlenaria

- `dataInicioChamada DateTime?` — preenchido ao iniciar chamada
- `dataAbertura` — preenchido ao abrir (já existe)
- `quorumMinimo` / `quorumPresente` — já existem

## TipoEventoSessaoHistorico

- Novo: `CHAMADA_INICIADA`
- `SESSAO_ABERTA.metadata` inclui `presentesNaAbertura` / `quorumPresente`
