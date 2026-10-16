# Research: 018

## Decision: Sem item selecionado após abrir

**Decision**: Tela de espera “Sessão aberta · Aguardando pauta” até o operador selecionar um item (não auto-selecionar o primeiro).

**Rationale**: Evita exibir matéria errada; operador conduz explicitamente.

## Decision: Após encerrar votação

**Decision**: Manter resultado por ~25s (já existente) e depois voltar à tela da matéria atual (item persistido).

**Rationale**: Comportamento atual do painel; menor diff.

## Decision: Persistência `pautaItemAtualId`

**Decision**: Campo opcional em `SessaoPlenaria` + POST set-item-atual + exposição no painel-publico + socket `sessao:item-painel`. Seleção na Pauta chama API e BroadcastChannel.

**Rationale**: FR-008; painel sem JWT recupera via getPainelPublico.
