# TASK-009 — Chamada dos Vereadores, Voto de Qualidade, Orador expandido

**Spec:** `backend/src/docs/specs/sessoes/SPEC-009-expediente-chamada-orador.md`
**Depende de:** nada (TASK-008 recomendado antes da parte (a), não bloqueante)
**Módulo:** `src/legislativo/sessoes-plenarias/` (extensão do que já existe — não é submódulo novo)

> As três partes (a/b/c) são independentes entre si. Podem ser feitas em qualquer ordem ou em
> paralelo por pessoas diferentes.

---

## Parte (a) — Chamada dos Vereadores

### T-01 · DTO
- [x] `reiniciar-chamada.dto.ts` — `{ justificativa: string }`, `@MinLength(3)`

### T-02 · Use cases
- [x] `chamar-vereadores.use-case.ts` — **desvio**: busca `Parliamentarian` por
      `{ tenantId, status: 'ACTIVE', isRemoved: false }` (mesmo filtro de
      `ListActiveParliamentarianUsersUseCase`), **não** escopado pela legislatura vigente da
      sessão (simplificação deliberada — mandatos/legislatura não foram cruzados)
  - Upsert em `PresencaSessao` — preserva quem já tem registro (`createMany` com
    `skipDuplicates: true` só para quem falta), cria os faltantes com `situacao: AUSENTE`
  - Chama `SessaoHistoricoRepository.registrar()` (TASK-008) com `CHAMADA_REALIZADA` — **sem**
    `$transaction` envolvendo o `registrar()` (ver TASK-008 T-03: é melhor-esforço, não atômico
    com a escrita principal; a escrita principal de presença em si roda dentro de operações
    Prisma separadas, não numa única `$transaction` também — simplificação aceita)
- [x] `reiniciar-chamada.use-case.ts`
  - Rejeita se `sessao.statusSessao !== ABERTA`
  - Reset em lote de `PresencaSessao.situacao = AUSENTE` (`updateMany`)
  - Grava `CHAMADA_REINICIADA` com `metadata: { justificativa }`

### T-03 · Controller
- [x] Em `sessoes.controller.ts`, adicionado (com uma adaptação: o emit de realtime usa um
      helper novo `emitPresencaGeralAtualizada()`, não `emitPresencaAtualizada(tenantId, { sessaoId: id })`
      como o exemplo abaixo sugeria — o tipo `PresencaAtualizadaPayload` exige `parliamentarianId`/
      `presentes`/`ausentes`/`temQuorum`, que um evento em lote sem um parlamentar específico não
      tem; o helper novo recalcula quórum e emite com `parliamentarianId: ''` como sinalizador de
      evento agregado):
  ```ts
  @UseGuards(PresidentOrStaffGuard)
  @Post(':id/chamada')
  async chamarVereadoresHandler(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const responsavelId = resolveTenantUserId(req.user as AuthenticatedUser);
    const result = await this.chamarVereadores.execute(tenantId, id, responsavelId);
    this.realtimeGateway.emitPresencaAtualizada(tenantId, { sessaoId: id });
    return result;
  }

  @UseGuards(PresidentOrStaffGuard)
  @Post(':id/chamada/reiniciar')
  async reiniciarChamadaHandler(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReiniciarChamadaDto,
    @Req() req: Request,
  ) {
    const responsavelId = resolveTenantUserId(req.user as AuthenticatedUser);
    const result = await this.reiniciarChamada.execute(tenantId, id, dto, responsavelId);
    this.realtimeGateway.emitPresencaAtualizada(tenantId, { sessaoId: id });
    return result;
  }
  ```
  (nomes de método do gateway a confirmar contra `sessao-realtime.gateway.ts` — reaproveitar o
  emit de presença que já existe, não criar um evento novo)

### T-04 · Testes — **nenhum escrito nesta sessão** (gap real)
- [ ] `chamar-vereadores.use-case.spec.ts` — preserva auto-registro existente, marca demais como AUSENTE
- [ ] `reiniciar-chamada.use-case.spec.ts` — exige justificativa (400 sem ela), só presidente/staff

---

## Parte (b) — Voto de qualidade — ✅ CONCLUÍDO

**Correção já aplicada.** A investigação mostrou que a feature completa já existia (DTO, use
case, view model, e a UI do frontend em `FecharVotacaoDialog.tsx` já com checkbox e envio do
campo) — não era uma feature ausente, era um bug de propagação em 3 pontos. Ver ADR-011
(revisado) para o raciocínio completo. Não criar a lógica de "buscar automaticamente o voto do
presidente" que uma versão anterior deste documento descrevia — o design real (presidente declara
explicitamente via `dto.votoQualidade` ao encerrar) já está em produção e não deve ser trocado
sem pedido explícito.

- [x] `encerrar-votacao.use-case.ts` — `execute()` agora retorna `votoQualidade` (antes calculava
      internamente mas não devolvia)
- [x] `sessoes.controller.ts` `finalizarVotacaoHandler` — lê `vm.votoQualidade ?? false` em vez
      do literal `false`
- [x] `sessoes.controller.ts` `encerrarVotacaoHandler` — lê `result.votoQualidade` em vez do
      literal `false`
- [x] `npx tsc --noEmit` limpo após a mudança; `encerrar-votacao.use-case.spec.ts` não faz
      asserção de igualdade exata de objeto, não quebrou com o campo novo

### T-07 · Testes (pendente — não executado nesta sessão)
- [ ] Teste de integração: fechar votação empatada com `votoQualidade: true` e conferir que o
      evento `votacao:encerrada` do WebSocket carrega `votoQualidade: true` (hoje só a resposta
      HTTP direta era coberta por teste; o gap era justamente no broadcast)

---

## Parte (c) — Orador expandido

### T-08 · Migration
- [x] Adicionar `tema String?`, `fase FaseSessao?`, `tempoConcedidoSegundos Int?` em `PedidoPalavra`
- [x] `npx prisma migrate dev` (parte da migration combinada com TASK-006/TASK-008)
- [x] `npx prisma generate`

### T-09 · DTO e use cases
- [x] `pedir-palavra.dto.ts` — `tema?: string` opcional (novo arquivo — antes o endpoint não tinha DTO de body nenhum)
- [x] Use case de criação de pedido: preenche `fase` automaticamente com `sessao.faseAtual`
- [x] Use case de resposta (conceder): aceita `tempoConcedidoSegundos?` no DTO de resposta

### T-10 · View model
- [x] `pedido-palavra.view-model.ts` — inclui `tema`, `fase`, `tempoConcedidoSegundos` no `toHttp()`

### T-11 · Testes — **nenhum escrito nesta sessão** (gap real; os specs existentes de
pedir-palavra/responder-pedido-palavra foram só ajustados para injetar o novo construtor, não
ganharam casos novos para os campos)
- [ ] Pedido criado durante `EXPEDIENTE` grava `fase: EXPEDIENTE` automaticamente
- [ ] Conceder com `tempoConcedidoSegundos: 180` persiste e aparece no view model

---

## Checklist
- [ ] `POST /:id/chamada` idempotente para quem já auto-registrou presença — implementado, não testado ao vivo
- [ ] `POST /:id/chamada/reiniciar` sem `justificativa` → 400 — validação via `class-validator` (padrão já usado e comprovado em todo o projeto), não testado ao vivo neste endpoint específico
- [x] Empate com presidente votante decide o resultado corretamente — já existia antes desta sessão de trabalho; suite de testes de `encerrar-votacao` não regrediu
- [x] Nenhum `votoQualidade: false` hardcoded restante em `sessoes.controller.ts` — confirmado por leitura
- [x] `PedidoPalavra` novo aceita `tema`/`fase`/`tempoConcedidoSegundos` sem quebrar pedidos antigos — campos opcionais, `tsc`/`jest` sem regressão
