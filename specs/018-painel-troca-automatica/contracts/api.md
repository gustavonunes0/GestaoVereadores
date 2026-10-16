# Contract API: 018

## POST `/legislative/sessoes-plenarias/:id/pauta-item-atual`

Body: `{ "pautaItemId": "<uuid>|null" }`  
Efeito: atualiza `pautaItemAtualId`; emite `sessao:item-painel`.

## GET painel-publico

Inclui `pautaItemAtualId` e dados mínimos do item atual quando houver.
