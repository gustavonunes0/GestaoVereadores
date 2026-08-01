# SPEC-009 — Chamada dos Vereadores, Voto de Qualidade e Orador expandido

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/sessoes-plenarias/` (extensão do controller/domínio existentes)
**Depende de:** nada para (a) e (b); TASK-008 recomendado (não bloqueante) para (a)
**Prioridade:** P1 — paridade operacional com o wizard do Painel de Controle do concorrente
**Decisões relacionadas:** ADR-011 (voto de qualidade)

Três melhorias empacotadas juntas porque tocam o mesmo módulo e podem ser feitas por qualquer
ordem entre si (não há dependência entre a, b, c).

---

## (a) Chamada dos Vereadores formalizada

### Background
`Fluxo_Sessao_Pauta_Votacao_REVISADO.md` (seção 2.1) e `relatorio_sessao.md` (o wizard do
Painel de Controle do IntGest, passo "CHAMADA DOS VEREADORES" com badge "EXECUTADO" e botão
"REINICIAR CHAMADA") confirmam: chamada é uma **ação distinta** de simplesmente registrar
presença item a item. Hoje `PresencaSessao` só existe como estado atual por parlamentar
(`@@unique([sessaoId, parliamentarianId])`) — não há um "evento de chamada" que grave, de uma vez,
o estado de todos os parlamentares da legislatura vigente.

### Decisão
Não criar model novo. `PresencaSessao` já é suficiente como destino de dados. Criar um use case
dedicado:

- `ChamarVereadoresUseCase` (`POST /:id/chamada`): busca todos os `Parliamentarian` ativos da
  legislatura vigente da sessão, faz **upsert em lote** em `PresencaSessao` (quem já tinha
  auto-registrado presença via `POST /:id/minha-presenca` mantém `situacao`; os demais entram como
  `AUSENTE` até serem corrigidos manualmente pelo staff/presidente), e grava evento
  `CHAMADA_REALIZADA` no `SessaoHistorico` (TASK-008) com `metadata: { totalPresentes, totalAusentes }`.
- `ReiniciarChamadaUseCase` (`POST /:id/chamada/reiniciar`): só permitido para
  `PresidentOrStaffGuard`, exige `justificativa` no body (mesmo padrão de reabertura de etapa
  documentado em outros specs), reseta todas as `PresencaSessao` da sessão para `AUSENTE` e grava
  `CHAMADA_REINICIADA` com a justificativa em `metadata`.

### Endpoints

| Método | Rota | Guard | Use case |
|---|---|---|---|
| POST | `/legislative/sessoes-plenarias/:id/chamada` | `PresidentOrStaffGuard` | `ChamarVereadoresUseCase` |
| POST | `/legislative/sessoes-plenarias/:id/chamada/reiniciar` | `PresidentOrStaffGuard` | `ReiniciarChamadaUseCase` |

DTO `reiniciar-chamada.dto.ts`: `{ justificativa: string }` (obrigatório, min 3 caracteres).

Emitir evento realtime `presenca:atualizada` (já existe no gateway) após a chamada em lote, para
que o painel/TV atualize o mapa de cadeiras (`PlenarioMapa`) sem refresh manual.

---

## (b) Voto de qualidade — ✅ CONCLUÍDO (era bug de propagação, não feature ausente)

Ver ADR-011 (revisado) para o histórico completo. **Correção já aplicada nesta sessão de
trabalho** — registrado aqui só para rastreabilidade, não é mais pendência:

- O mecanismo completo já existia: `EncerrarVotacaoDto.votoQualidade?: boolean`,
  `EncerrarVotacaoUseCase` decidindo o resultado a partir dele, `VotacaoViewModel.toHttp()`
  expondo o campo, e o frontend (`FecharVotacaoDialog.tsx`) já com checkbox e envio do valor.
- O único bug real: `EncerrarVotacaoUseCase.execute()` não incluía `votoQualidade` no objeto
  retornado, e `sessoes.controller.ts` (`finalizarVotacaoHandler`/`encerrarVotacaoHandler`)
  hardcodava `false` no payload emitido ao realtime gateway em vez de ler o valor já calculado —
  isso fazia o broadcast ao vivo (painel/TV, outros clientes conectados) mostrar sempre
  `votoQualidade: false`, mesmo quando o presidente explicitamente exerceu o voto de qualidade.
- Corrigido: `encerrar-votacao.use-case.ts` retorna `votoQualidade`; os dois handlers do
  controller leem esse valor em vez do literal `false`.

Nenhum endpoint novo, nenhuma migration, nenhuma mudança de contrato de API.

---

## (c) Orador expandido (além do PedidoPalavra atual)

### Background
`PedidoPalavra` hoje (schema, model existente) cobre uma fila simples:
`AGUARDANDO → CONCEDIDO/NEGADO → ENCERRADO`, com `duracaoSegundos`. O IntGest mostra algo mais
rico: um painel de "Oradores" com cronômetro visível, inscrição por tema, e a distinção entre
orador do Expediente (com tempo próprio) e orador durante a Ordem do Dia.

### Decisão — extensão aditiva, sem quebrar o que existe
Adicionar campos **opcionais** em `PedidoPalavra` (nenhum dos que já existem muda de tipo/sentido):

```prisma
model PedidoPalavra {
  // ...campos existentes, sem alteração...
  tema                 String?        // NOVO — assunto declarado pelo parlamentar, opcional
  fase                 FaseSessao?    // NOVO — em qual fase foi solicitado (EXPEDIENTE | ORDEM_DO_DIA | ...)
  tempoConcedidoSegundos Int?         // NOVO — tempo definido pelo presidente ao conceder (distinto de duracaoSegundos, que é o tempo efetivamente usado)
}
```

- `tempoConcedidoSegundos` é definido no momento de `CONCEDIDO` (parâmetro do endpoint que já
  existe de responder pedido de palavra); `duracaoSegundos` continua sendo o tempo real
  decorrido/usado, calculado ao encerrar (`ENCERRADO`).
- `fase` é preenchido automaticamente com `sessao.faseAtual` no momento da criação do pedido — não
  requer input do usuário.
- Frontend usa `tempoConcedidoSegundos` para desenhar o cronômetro regressivo (ver TASK-F09) —
  hoje não há cronômetro na UI porque não há tempo concedido armazenado, só a duração final.

**Não criar `OradorInscricao` como model separado.** Um model novo duplicaria
`sessaoId`/`parliamentarianId`/status que `PedidoPalavra` já tem, e a distinção Expediente vs.
Ordem do Dia é só um filtro por `fase`, não uma entidade diferente. Revisitar esta decisão só se
surgir um requisito que `PedidoPalavra` genuinamente não comporte (ex.: múltiplos oradores
inscritos simultaneamente com ordem de fila numerada explícita — hoje a ordem é implícita pela
ordem de criação/`criadoEm`).

### Migration

```
npx prisma migrate dev --name add_tema_fase_tempo_concedido_pedido_palavra
```

Todos os três campos novos são opcionais — migration não quebra dados existentes.

---

## Gathering Results

- [ ] `POST /:id/chamada` cria/atualiza `PresencaSessao` para todos os parlamentares ativos da legislatura vigente
- [ ] `POST /:id/chamada/reiniciar` exige `justificativa`, só `PresidentOrStaffGuard`, reseta presenças
- [ ] Chamada e reinício geram evento em `SessaoHistorico` (TASK-008)
- [ ] Votação empatada com presidente votante → `resultado` decidido pelo voto dele, `votoQualidade: true`
- [ ] Votação empatada sem presidente votante → `resultado: EMPATADO`, `votoQualidade: false`
- [ ] `PedidoPalavra` aceita `tema` e `fase` opcionais na criação; `tempoConcedidoSegundos` preenchido ao conceder
