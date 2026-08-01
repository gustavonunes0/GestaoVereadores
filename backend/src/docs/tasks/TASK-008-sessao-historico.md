# TASK-008 — Histórico de Sessão (auditoria / "Log")

**Spec:** `backend/src/docs/specs/auditoria/SPEC-008-sessao-historico.md`
**Depende de:** nada — pode começar imediatamente
**Bloqueia (parcialmente):** qualidade da geração automática de rascunho em TASK-006 (Ata)
**Módulo:** `src/legislativo/sessao-historico/` (⚠️ **não** `sessoes-plenarias/historico/` como
planejado originalmente — ver nota T-05/T-10)

> Diferente de TASK-002 (que criava um submódulo inteiro do zero), aqui a maior parte do sistema
> **já existe e está em produção**. Não recriar `abrirSessaoHandler`, `setFaseHandler`,
> `AbrirVotacaoUseCase` etc. — eles já funcionam. Esta task só adiciona uma gravação de histórico
> dentro de repositories que já existem.

> **Status: implementado, com um desvio arquitetural importante** — ver nota antes de T-05.

---

## Fase 1 — Domain Layer

### T-01 · Migration
- [x] Adicionar enum `TipoEventoSessaoHistorico` e model `SessaoHistorico` no `schema.prisma`
      (ver SPEC-008 para o DDL completo)
- [x] Adicionar relação inversa `historico SessaoHistorico[]` em `SessaoPlenaria`
- [x] `npx prisma migrate dev --name add_sessao_historico` (rodada como parte da migration combinada
      `add_sessao_historico_ata_orador_expandido`, junto com TASK-006 e TASK-009c)
- [x] `npx prisma generate`

### T-02 · Enum e entity de domínio
- [x] `domain/enums/tipo-evento-sessao-historico.enum.ts` — espelha o enum Prisma
- [x] `domain/entities/sessao-historico.entity.ts` — campos: `id · sessaoId · tipoEvento · dataHora · responsavelId · responsavelNome · descricao · metadata`
  - **Zero imports de @prisma/client ou @nestjs/*** confirmado

### T-03 · Repository contract — **implementado diferente do especificado**
- [x] `domain/repositories/sessao-historico.repository.ts` (abstract class), mas com:
  ```ts
  export abstract class SessaoHistoricoRepository {
    abstract registrar(dados: RegistrarHistoricoDados): Promise<void>;
    abstract findMany(sessaoId, tenantId, params): Promise<{ data: SessaoHistoricoEntity[]; total: number }>;
  }
  ```
  **Não existe `registrarNaTransacao(tx, dados)`** recebendo um `Prisma.TransactionClient` — isso
  exigiria a `Prisma` type no contrato do domínio (viola regra 1: domain nunca importa
  `@prisma/client`) e acoplaria fortemente todos os call-sites ao client de transaction de quem
  chama. Em vez disso, `registrar()` é **melhor-esforço**: faz seu próprio `create()` e nunca
  lança — erros de gravação de histórico são logados (`Logger.warn`) e engolidos, para nunca
  derrubar a operação de negócio que originou o evento (abrir sessão, encerrar votação etc.).
  **Trade-off aceito conscientemente:** não há atomicidade garantida entre a escrita principal e
  o registro de histórico (se a query principal committar e o `registrar()` falhar logo em
  seguida, o evento não aparece no histórico, mas a operação de negócio não é revertida). Para um
  log de auditoria "nice to have" isso é aceitável; **revisitar se o histórico virar fonte de
  verdade de algo crítico no futuro.**

---

## Fase 2 — Infra Layer

### T-04 · Mapper e repository Prisma
- [ ] `infra/prisma/mappers/sessao-historico.mapper.ts` — **não criado como arquivo separado**;
      `toEntity()` está inline em `prisma-sessao-historico.repository.ts`
- [x] `infra/prisma/prisma-sessao-historico.repository.ts`
  - `findMany`: `where: { sessaoId, sessao: { tenantId } }` — filtro de tenant explícito, via join
  - `registrar`: `this.prisma.sessaoHistorico.create({...})` direto (ver nota do T-03 — sem `tx`)

### T-05 · Integrar nos pontos de escrita — **feito na camada de use case, não na de repository/infra**

> **Desvio arquitetural importante.** O plano original pedia para integrar dentro dos métodos dos
> repositories Prisma (`prisma-sessao-plenaria.repository.ts`, `prisma-votacao.repository.ts`
> etc.), usando `executarCicloVida()` como o ponto de transição de status. Investigando o código
> descobri que **`executarCicloVida()` é o caminho legado/genérico** (`POST /:id/ciclo-vida`) —
> quem os quatro botões reais da UI chamam (`abrir`/`suspender`/`encerrar`/`cancelar`) é
> `SessaoPlenariaRepository.transicionarStatus()`, chamado a partir de 4 use cases dedicados
> (`AbrirSessaoUseCase` etc.), **não** de `executarCicloVida()`. Integrar no lugar certo (os 4 use
> cases) em vez do lugar especificado (o método genérico legado) foi uma escolha deliberada —
> senão o histórico ficaria cego para o fluxo que a UI de fato usa. Pelo mesmo motivo, os eventos
> de votação/presença/pedido de palavra foram registrados nos **use cases** das respectivas
> feature (`AbrirVotacaoUseCase`, `EncerrarVotacaoUseCase`, `RegistrarPresencaUseCase`,
> `PedirPalavraUseCase`, `ResponderPedidoPalavraUseCase`), não dentro dos repositories Prisma.
> Isso também exigiu criar `SessaoHistoricoModule` como módulo próprio (`legislativo/sessao-historico/`,
> não aninhado em `sessoes-plenarias/historico/`), importado tanto por `SessoesPlenariasModule`
> quanto por `VotacoesModule` — evita dependência circular entre os dois.

- [x] Transições de status da sessão — `AbrirSessaoUseCase` (`SESSAO_ABERTA`),
      `SuspenderSessaoUseCase` (`SESSAO_SUSPENSA`), `EncerrarSessaoUseCase` (`SESSAO_ENCERRADA`),
      `CancelarSessaoUseCase` (`SESSAO_CANCELADA`). `cicloVidaJson` continua sendo escrito por
      `transicionarStatus()` — não removido (regra 6). **O endpoint legado genérico
      `POST /:id/ciclo-vida` (`executarCicloVida()`) não foi instrumentado** — se algum cliente
      ainda usar esse caminho em vez dos 4 endpoints específicos, essas transições não aparecem
      no histórico.
- [x] Mudança de fase — `SetFaseSessaoUseCase`, evento `FASE_ALTERADA` com
      `metadata: { faseAnterior, faseNova }`
- [x] Votação — `AbrirVotacaoUseCase` (`VOTACAO_ABERTA`), `EncerrarVotacaoUseCase`
      (`VOTACAO_ENCERRADA` com `metadata: { pautaItemId, resultado, votosSim, votosNao, abstencoes, votoQualidade }`)
- [x] Presença — `RegistrarPresencaUseCase`, evento `PRESENCA_REGISTRADA` com
      `metadata: { parliamentarianId, situacao }`
- [x] Pedido de palavra — `PedirPalavraUseCase` (`PEDIDO_PALAVRA_CRIADO`),
      `ResponderPedidoPalavraUseCase` (`PEDIDO_PALAVRA_RESPONDIDO`)

> Os eventos `CHAMADA_REALIZADA`/`CHAMADA_REINICIADA` e `ATA_GERADA`/`ATA_APROVADA` são
> registrados pelas próprias tasks que os criam (TASK-009 e TASK-006), não aqui — esta task só
> precisa expor o `SessaoHistoricoRepository` para que essas outras tasks o consumam.

---

## Fase 3 — Application Layer

### T-06 · DTO
- [x] `list-sessao-historico-query.dto.ts` — `tipoEvento?`, `page`, `limit` (via `PaginationQueryDto` compartilhado)

### T-07 · Use case
- [x] `list-sessao-historico.use-case.ts`

### T-08 · View Model
- [x] `sessao-historico.view-model.ts` — `toHttp()` conforme exemplo JSON da SPEC-008

### T-09 · Controller
- [x] Adicionar rota em `sessoes.controller.ts` (não criar controller novo — este módulo já
      concentra sessão/pauta/votação/presença no mesmo controller, seguir o padrão existente):
  ```ts
  @TenantRoles(...STAFF_AND_ABOVE)
  @Get(':id/historico')
  async listHistoricoHandler(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListSessaoHistoricoQueryDto,
  ) {
    return this.listSessaoHistorico.execute(tenantId, id, query);
  }
  ```

### T-10 · Módulo
- [x] Registrado via `SessaoHistoricoModule` próprio (não dentro de `SessoesPlenariasModule` —
      ver nota do T-05), importado por `SessoesPlenariasModule` **e** `VotacoesModule`
- [x] Injetado nos use cases listados em T-05 (via construtor — não nos repositories Prisma)

---

## Fase 4 — Testes

### T-11 · Testes — **nenhum escrito nesta sessão** (gap real)
- [ ] `list-sessao-historico.use-case.spec.ts` — filtro por `tipoEvento`, paginação
- [ ] Teste de integração: abrir sessão → `GET /:id/historico` retorna evento `SESSAO_ABERTA`
- [ ] Teste de integração: encerrar votação → histórico contém `metadata.resultado` correto
- [ ] Isolamento de tenant: histórico de sessão de outro tenant → 404

---

## Checklist
- [x] `SessaoHistorico` nunca recebe `UPDATE` (confirmado por leitura — repository só tem `registrar`/`findMany`)
- [ ] Toda transição de `statusSessao` aparece em `GET /:id/historico` — **cobre os 4 use cases
      específicos** (abrir/suspender/encerrar/cancelar); o endpoint genérico legado
      `/ciclo-vida` (`executarCicloVida()`) não foi instrumentado
- [x] `cicloVidaJson` continua sendo escrito (não removido)
- [x] `GET /:id/historico` ordenado por `dataHora desc`, paginado
