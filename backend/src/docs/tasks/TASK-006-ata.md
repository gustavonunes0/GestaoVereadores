# TASK-006 — Ata da Sessão

**Spec:** `backend/src/docs/specs/ata/SPEC-006-ata.md`
**Depende de:** nada para o CRUD; TASK-008 recomendado (não bloqueante) para gravar eventos no histórico
**Módulo novo:** `src/legislativo/sessoes-plenarias/ata/`

> **Status: implementado e compilando (`tsc --noEmit` limpo, `jest` sem regressão).** Não houve
> teste manual end-to-end (servidor não foi subido para chamar os endpoints via HTTP) — o que
> está marcado `[x]` reflete existência/correção do código, não verificação em runtime, exceto
> onde anotado.

---

## Fase 1 — Domain Layer

### T-01 · Migration
- [x] Adicionar enum `StatusAta` e model `Ata` no `schema.prisma` (ver SPEC-006 para DDL completo)
- [x] Adicionar `ataReferenciadaId String?` + relação em `PautaItem`
- [x] Adicionar relação inversa `ata Ata?` em `SessaoPlenaria`, `atas Ata[]` em `Tenant`
- [x] `npx prisma migrate dev --name add_ata_sessao` (rodada como parte de uma migration combinada:
      `add_sessao_historico_ata_orador_expandido`, junto com TASK-008 e TASK-009c)
- [x] `npx prisma generate`

### T-02 · Enum e entity
- [x] `domain/enums/status-ata.enum.ts`
- [x] `domain/entities/ata.entity.ts`
  - Método: `podeSerEditada(): boolean` → `status === RASCUNHO`
  - Método: `podeSerAprovada(): boolean` → `status === RASCUNHO`
  - **Zero imports de @prisma/client ou @nestjs/*** confirmado

### T-03 · Repository contract
- [x] `domain/repositories/ata.repository.ts` — **assinatura diferente da especificada**:
      `findBySessaoId(id, tenantId)`, `findById(id, tenantId)`, `create(dados)`, `update(id, dados)`.
      Não existe `save`/`softDelete` — Ata não tem fluxo de remoção nesta v1 (não foi pedido).

### T-04 · Domain service — template do rascunho
- [x] `domain/services/ata-template.service.ts`
  - `montar(dados: AtaTemplateDados): string` — monta HTML com identificação, presidente,
    presença (nome + partido + situação) e matérias com resultado
  - **Desvio:** não reaproveita o include de `GetSessaoByIdUseCase` — `gerar-rascunho-ata.use-case.ts`
    monta uma query Prisma própria (mesa diretora vem do model novo `Board`/`BoardMember`, não do
    `MesaDiretora` legado, que está morto no código real — ver `legado.md`)

---

## Fase 2 — Infra Layer

### T-05 · Mapper e repository
- [ ] `infra/prisma/mappers/ata.mapper.ts` — **não criado como arquivo separado**; a função
      `toEntity()` está inline em `prisma-ata.repository.ts`, mesmo padrão de
      `prisma-pedido-palavra.repository.ts` (não há pasta `mappers/` nesse módulo)
- [x] `infra/prisma/prisma-ata.repository.ts`
  - `findBySessaoId`: `where: { sessaoPlenariaId, tenantId, isRemoved: false }`
  - Sem `softDelete` (ver nota do T-03)

---

## Fase 3 — Application Layer

### T-06 · DTOs
- [ ] `gerar-rascunho-ata.dto.ts` — **não criado**: o endpoint não recebe `@Body()`, corpo vazio
      não precisou de DTO
- [x] `update-ata.dto.ts` — `{ conteudo: string }`
- [ ] `aprovar-ata.dto.ts` — **não criado**, mesmo motivo do `gerar-rascunho-ata.dto.ts`

### T-07 · Erros de aplicação
- [x] `ata.errors.ts`:
  - `AtaSessaoNaoEncerradaError` — "Ata só pode ser gerada após a sessão ser encerrada"
  - `AtaJaExisteError` — "Já existe uma ata para esta sessão"
  - `AtaNaoEncontradaError` — "Ata não encontrada"
  - `AtaImutavelAposAprovacaoError` — "Ata aprovada não pode ser editada"

### T-08 · Use Cases
- [x] `gerar-rascunho-ata.use-case.ts`
  - Verifica `sessao.statusSessao === ENCERRADA` (senão `AtaSessaoNaoEncerradaError`)
  - Verifica que não existe Ata para a sessão (senão `AtaJaExisteError`)
  - Chama `AtaTemplateService.montar()`, cria `Ata` com `status: RASCUNHO`, `geradaAutomaticamente: true`
  - Grava `ATA_GERADA` no `SessaoHistorico` (TASK-008 concluída)
- [x] `get-ata-by-sessao.use-case.ts`
- [x] `update-ata.use-case.ts` — verifica `ata.podeSerEditada()` (senão `AtaImutavelAposAprovacaoError`)
- [x] `aprovar-ata.use-case.ts`
  - Verifica `ata.podeSerAprovada()`
  - `status → APROVADA`, `aprovadaEm = now()`, `aprovadaPorId = userId`
  - Grava `ATA_APROVADA` no `SessaoHistorico`

### T-09 · View Model
- [x] `ata.view-model.ts` — `toHttp()` conforme SPEC-006 (nunca expor `tenantId`/`isRemoved`/`removedAt`)

### T-10 · Controller
- [x] Adicionar rotas em `sessoes.controller.ts` (seguir o padrão existente do módulo — pauta,
      votação e presença já vivem no mesmo controller; não criar `AtaController` separado a menos
      que o arquivo já esteja grande demais para revisão — se sim, criar
      `application/controllers/ata.controller.ts` com `@Controller('legislative/sessoes-plenarias/:id/ata')`)
  ```ts
  @TenantRoles(...STAFF_AND_ABOVE)
  @Get(':id/ata')
  getAtaHandler(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.getAtaBySessao.execute(tenantId, id);
  }

  @TenantRoles(...STAFF_AND_ABOVE)
  @Post(':id/ata/gerar-rascunho')
  gerarRascunhoHandler(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.gerarRascunhoAta.execute(tenantId, id);
  }

  @TenantRoles(...STAFF_AND_ABOVE)
  @Patch(':id/ata')
  updateAtaHandler(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAtaDto,
  ) {
    return this.updateAta.execute(tenantId, id, dto);
  }

  @UseGuards(PresidentOrStaffGuard)
  @Post(':id/ata/aprovar')
  aprovarAtaHandler(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const responsavelId = resolveTenantUserId(req.user as AuthenticatedUser);
    return this.aprovarAta.execute(tenantId, id, responsavelId);
  }
  ```

### T-11 · Módulo
- [x] Registrar bindings (`AtaRepository → PrismaAtaRepository`) no módulo de sessões plenárias

---

## Fase 4 — Testes

### T-12 · Testes — **nenhum escrito nesta sessão** (gap real, não fazer de conta que existe)
- [ ] `gerar-rascunho-ata.use-case.spec.ts` — 422 se sessão não encerrada, 409 se ata já existe
- [ ] `ata-template.service.spec.ts` — conteúdo gerado contém presença e matérias corretas
- [ ] `update-ata.use-case.spec.ts` — 409 se ata aprovada
- [ ] `aprovar-ata.use-case.spec.ts` — grava `aprovadaEm`/`aprovadaPorId`
- [ ] Isolamento de tenant: ata de sessão de outro tenant → 404

---

## Checklist
> Itens abaixo descrevem comportamento em runtime — verificados por leitura de código e
> compilação (`tsc`/`jest`), **não** por chamada HTTP real (nenhum servidor foi iniciado).
- [ ] `POST /:id/ata/gerar-rascunho` só funciona com sessão `ENCERRADA` — implementado, não testado ao vivo
- [ ] Segunda chamada de gerar-rascunho → 409 — implementado, não testado ao vivo
- [ ] Rascunho contém dados reais da sessão (presença, mesa, matérias, votos) — implementado, não testado ao vivo
- [ ] Ata aprovada não pode ser editada via `PATCH` — implementado, não testado ao vivo
- [x] `tenantId`/`isRemoved`/`removedAt` nunca aparecem no response — confirmado por leitura de `ata.view-model.ts`
