# SPEC-008 — Histórico de Sessão (auditoria / "Log")

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/sessoes-plenarias/` (novo subdiretório `historico/`)
**API prefix:** `/api/legislative/sessoes-plenarias/:id/historico`
**Depende de:** nada (schema atual já tem tudo que os eventos precisam referenciar)
**Prioridade:** P0 — base para SPEC-006 (Ata) e para paridade com o "Log" do concorrente
**Decisão relacionada:** ADR-009

---

## Background

`relatorio_sessao.md` (reconhecimento do IntGest) mapeou um item de menu "Log" em
`/sessao/192/sessao/log` — quebrado (500) no concorrente, mas confirma que a funcionalidade é
esperada em um sistema de gestão legislativa: uma trilha auditável do que aconteceu numa sessão.

Hoje o projeto não tem isso. `legado.md` (auditoria TASK-11) já documentou o problema:
`cicloVidaJson` é escrito em toda transição de `SessaoPlenaria`
([prisma-sessao-plenaria.repository.ts:333-346](../../../legislativo/sessoes-plenarias/infra/prisma/prisma-sessao-plenaria.repository.ts)),
mas é JSON livre, não é lido por nenhum código novo, e não cobre eventos que não são transição de
`statusSessao` (mudança de fase, abertura/encerramento de votação, presença, pedido de palavra).
Não existe para `SessaoPlenaria` o equivalente ao `TramitacaoHistorico` que existe para `Materia`
(ADR-001).

## O que já existe no schema (não recriar)

```prisma
model SessaoPlenaria {
  statusSessao StatusSessao @default(AGENDADA)  // AGENDADA ABERTA SUSPENSA ENCERRADA CANCELADA
  faseAtual    FaseSessao   @default(NAO_INICIADA) // NAO_INICIADA EXPEDIENTE ORDEM_DO_DIA EXPLICACOES_PESSOAIS ENCERRADA
  dataAbertura / dataEncerramento / dataSuspensao DateTime?
  responsavelAberturaId String?
}
```

Todos os use cases que hoje mudam esses campos já existem e estão ativos em
`sessoes.controller.ts` (`abrirSessaoHandler`, `suspenderSessaoHandler`, `encerrarSessaoHandler`,
`setFaseHandler`, `abrirVotacaoHandler`, `finalizarVotacaoHandler`/`encerrarVotacaoHandler`,
handlers de presença e de `PedidoPalavra`). **Este spec não cria nenhum use case novo de negócio —
só adiciona o registro de histórico dentro dos que já existem.**

## Novo model

```prisma
enum TipoEventoSessaoHistorico {
  SESSAO_ABERTA
  SESSAO_SUSPENSA
  SESSAO_ENCERRADA
  SESSAO_CANCELADA
  FASE_ALTERADA
  CHAMADA_REALIZADA
  CHAMADA_REINICIADA
  PRESENCA_REGISTRADA
  VOTACAO_ABERTA
  VOTACAO_ENCERRADA
  PEDIDO_PALAVRA_CRIADO
  PEDIDO_PALAVRA_RESPONDIDO
  ATA_GERADA
  ATA_APROVADA
  MENSAGEM_PAINEL_EXIBIDA   // reservado — se ADR de templates de mensagem (ver Fluxo_Sessao doc) avançar
}

model SessaoHistorico {
  id             String                     @id @default(uuid())
  sessaoId       String
  sessao         SessaoPlenaria             @relation(fields: [sessaoId], references: [id], onDelete: Cascade)
  tipoEvento     TipoEventoSessaoHistorico
  dataHora       DateTime                   @default(now())
  responsavelId  String?
  responsavel    TenantUser?                @relation(fields: [responsavelId], references: [id])
  descricao      String?                    // texto pronto para exibição, em pt-BR
  metadataJson   Json?                      // dados específicos do evento (ex.: { faseAnterior, faseNova })

  @@index([sessaoId, dataHora])
  @@index([sessaoId, tipoEvento])
  @@map("sessao_historico")
}
```

> Adicionar relação inversa em `SessaoPlenaria`: `historico SessaoHistorico[]`.
> `SessaoHistorico` é **append-only** — igual regra 8 do CLAUDE.md para `TramitacaoHistorico`.
> Nunca recebe update.

## Estrutura de arquivos do submódulo

```
src/legislativo/sessoes-plenarias/
├── historico/
│   ├── domain/
│   │   ├── entities/sessao-historico.entity.ts
│   │   ├── enums/tipo-evento-sessao-historico.enum.ts
│   │   └── repositories/sessao-historico.repository.ts   ← abstract class
│   ├── infra/prisma/
│   │   ├── prisma-sessao-historico.repository.ts
│   │   └── mappers/sessao-historico.mapper.ts
│   └── application/
│       ├── use-cases/list-sessao-historico.use-case.ts   ← único use case novo (leitura)
│       └── view-models/sessao-historico.view-model.ts
```

Escrita: **não é um use case próprio**. É uma chamada a
`SessaoHistoricoRepository.registrar(...)` feita **dentro da mesma transaction** dos repositories
que já existem (`PrismaSessaoPlenariaRepository`, `PrismaVotacaoRepository`,
`PrismaPresencaRepository`, `PrismaPedidoPalavraRepository`) — mesmo padrão do ADR-001
(`tramitar()` grava `Materia` + `TramitacaoHistorico` numa única `$transaction`). Nunca no use
case, sempre no repository.

## Onde adicionar a escrita (mapear, não recriar)

| Evento | Repository/método que já existe | Arquivo |
|---|---|---|
| `SESSAO_ABERTA` / `SUSPENSA` / `ENCERRADA` / `CANCELADA` | `executarCicloVida()` (já escreve `cicloVidaJson` — adicionar histórico na mesma transaction) | `prisma-sessao-plenaria.repository.ts:333-346` |
| `FASE_ALTERADA` | handler `setFaseHandler` / repository de fase | `sessoes.controller.ts` (setFase) |
| `VOTACAO_ABERTA` | `AbrirVotacaoUseCase` / repository de votação | `sessoes.controller.ts:abrirVotacaoHandler` |
| `VOTACAO_ENCERRADA` | `FinalizarVotacaoUseCase`/`EncerrarVotacaoUseCase` | `sessoes.controller.ts:668-701` |
| `PRESENCA_REGISTRADA` | repository de presença | handlers de presença em `sessoes.controller.ts` |
| `PEDIDO_PALAVRA_CRIADO`/`RESPONDIDO` | repository de `PedidoPalavra` | handlers `pedirPalavra`/`responderPedidoPalavra` |
| `CHAMADA_REALIZADA`/`REINICIADA` | novo use case da SPEC-009 (Chamada dos Vereadores) | ver `SPEC-009` |
| `ATA_GERADA`/`APROVADA` | novos use cases da SPEC-006 | ver `SPEC-006` |

## Endpoint novo

| Método | Rota | Guard | Use case |
|---|---|---|---|
| GET | `/legislative/sessoes-plenarias/:id/historico` | `STAFF_AND_ABOVE` (auditoria é ferramenta administrativa, não pública) | `ListSessaoHistoricoUseCase` |

Query params: `tipoEvento?`, `page`, `limit` (paginação padrão do projeto, igual `ListMateriasUseCase`).

## View model — campos expostos

```json
{
  "id": "uuid",
  "tipoEvento": { "value": "VOTACAO_ENCERRADA", "label": "Votação encerrada" },
  "dataHora": "2026-07-28T17:32:00Z",
  "responsavel": { "id": "...", "nome": "..." },
  "descricao": "Votação da matéria PLOE 23/2026 encerrada — resultado APROVADO",
  "metadata": { "pautaItemId": "...", "resultado": "APROVADO" }
}
```

**Nunca expor:** `tenantId` (herdado da sessão, não duplicar), IDs internos crus sem rótulo.

## Regras de domínio

- `SessaoHistorico` nunca recebe `UPDATE` nem `DELETE` — só `INSERT` (mesma regra 8 do CLAUDE.md
  aplicada a `TramitacaoHistorico`).
- `metadataJson` é livre por tipo de evento, mas cada tipo deve ter um formato estável e
  documentado no `sessao-historico.view-model.ts` (não um blob genérico sem contrato).
- `cicloVidaJson` continua sendo escrito (regra 6 — não remover legado) mas passa a ser
  redundante para leitura; não migrar dados históricos antigos de `cicloVidaJson` para
  `SessaoHistorico` (fora de escopo — histórico novo começa a valer a partir do deploy desta spec).

## Gathering Results

- [ ] Toda transição de `statusSessao` grava um `SessaoHistorico` na mesma transaction
- [ ] Abrir/encerrar votação grava histórico com `metadataJson` incluindo `pautaItemId` e resultado
- [ ] `GET /:id/historico` retorna paginado, ordenado por `dataHora desc`
- [ ] `SessaoHistorico` nunca aparece com `UPDATE` em nenhum repository (revisão de código)
- [ ] Isolamento de tenant: histórico de sessão de outro tenant → 404 (via `sessaoId` já filtrado por tenant no join)
