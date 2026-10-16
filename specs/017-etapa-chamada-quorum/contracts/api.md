# Contract API: 017

## POST `/legislative/sessoes-plenarias/:id/iniciar-chamada`

- Auth: staff+
- Pré: `statusSessao === AGENDADA`
- Efeito: `CHAMADA`, `dataInicioChamada=now`, histórico `CHAMADA_INICIADA`
- Erro PT-BR se transição inválida

## POST `/legislative/sessoes-plenarias/:id/abrir`

- Pré: `statusSessao === CHAMADA` (ou `SUSPENSA` para retomar)
- Recusa sem quórum (exceto modoTeste com ≥1 presente)
- Metadata ata: presentes + hora abertura

## GET painel-publico

- Em `CHAMADA`: presença + `temQuorum` + label fase CHAMADA; sem "AO VIVO" em AGENDADA
