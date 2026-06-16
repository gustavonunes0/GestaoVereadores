# TASK-002 — Submódulo: Sessões Plenárias

**Spec:** `backend/docs/specs/sessoes/SPEC-002-sessoes.md`
**Depende de:** TASK-001 M4 concluída
**Módulo:** `src/legislativo/sessoes-plenarias/`

---

## Fase 1 — Domain Layer

### T-01 · Enums de domínio
- [ ] `domain/enums/status-sessao.enum.ts` (espelha enum Prisma criado em M4)
  ```ts
  export enum StatusSessao { AGENDADA = 'AGENDADA', ABERTA = 'ABERTA', SUSPENSA = 'SUSPENSA', ENCERRADA = 'ENCERRADA', CANCELADA = 'CANCELADA' }
  ```
- [ ] `domain/enums/status-pauta-item.enum.ts`

### T-02 · Entities de domínio
- [ ] `domain/entities/sessao-plenaria.entity.ts`
  - Campos: `id · tenantId · statusSessao · dataInicio · dataAbertura · dataEncerramento · quorumMinimo · quorumPresente`
  - Método: `podeTransicionarPara(novoStatus: StatusSessao): boolean`
    ```
    AGENDADA → ABERTA | CANCELADA
    ABERTA   → SUSPENSA | ENCERRADA
    SUSPENSA → ABERTA | ENCERRADA
    ```
  - Método: `estaAberta(): boolean`
  - **Zero imports de @prisma/client ou @nestjs/***
- [ ] `domain/entities/pauta-item.entity.ts`
  - Campos: `id · sessaoId · materiaId · ordem · fase · resultado · statusPauta · publicadaEm`
  - Método: `estaPublicada(): boolean`
  - Método: `podeSerRemovido(): boolean` (false se publicada)

### T-03 · Repository contracts (abstract class)
- [ ] `domain/repositories/sessao-plenaria.repository.ts`
  - `findMany(params, tenantId)`, `findById(id, tenantId)`, `create`, `save`, `softDelete`
  - `transicionarStatus(id, novoStatus, dados): Promise<void>` ← transaction interna na infra
- [ ] `domain/repositories/pauta-item.repository.ts`

### T-04 · Domain services
- [ ] `domain/services/ciclo-vida-sessao.service.ts`
  - `validarTransicao(atual, novo): void` — lança `BadRequestException('Transição inválida: ...')` em PT
  - `transicionar(sessaoId, novoStatus, tenantId, userId, observacoes?): Promise<void>`
- [ ] `domain/services/quorum.service.ts`
  - `calcularMinimo(sessaoId, tenantId): Promise<number>` — conta `TenantUser.isParliamentarian === true`
  - `verificarAtual(sessaoId): Promise<number>` — conta `PresencaSessao` com `situacao = PRESENTE`
  - `temQuorum(sessaoId): Promise<boolean>`

---

## Fase 2 — Infra Layer

### T-05 · Mappers
- [ ] `infra/prisma/mappers/sessao-plenaria.mapper.ts` — `toDomain(raw) · toPrisma(entity)`
- [ ] `infra/prisma/mappers/pauta-item.mapper.ts`

### T-06 · Prisma repositories
- [ ] `infra/prisma/prisma-sessao-plenaria.repository.ts`
  - `findById`: `where: { id, tenantId, isRemoved: false }`
  - `softDelete`: `{ isRemoved: true, removedAt: new Date() }`
  - `transicionarStatus`: `prisma.$transaction([update status + timestamp])`
- [ ] `infra/prisma/prisma-pauta-item.repository.ts`

---

## Fase 3 — Application Layer

### T-07 · DTOs
- [ ] `create-sessao.dto.ts` — `tipoSessaoId · dataInicio · sessaoLegislativaId?`
- [ ] `abrir-sessao.dto.ts` — `observacoes?`
- [ ] `encerrar-sessao.dto.ts` — `observacoes?`
- [ ] `suspender-sessao.dto.ts` — `observacoes?`
- [ ] `add-pauta-item.dto.ts` — `materiaId · fase · ordem?`
- [ ] `publicar-pauta.dto.ts` — confirma publicação
- [ ] `registrar-presenca.dto.ts` — `parlamentarId · situacao · justificativa?`

### T-08 · Use Cases
- [ ] `create-sessao.use-case.ts` — cria com `statusSessao: AGENDADA`
- [ ] `list-sessoes.use-case.ts` — filtros: `statusSessao · tipoSessaoId · dataInicio`
- [ ] `get-sessao-by-id.use-case.ts` — inclui pauta e presenças
- [ ] `abrir-sessao.use-case.ts`
  - Verificar `podeTransicionarPara(ABERTA)`
  - Calcular e registrar `quorumPresente`
  - Chamar `sessaoRepo.transicionarStatus()` com `dataAbertura = now()`
- [ ] `suspender-sessao.use-case.ts`
- [ ] `encerrar-sessao.use-case.ts` — encerra pauta também (`StatusPautaItem.ENCERRADA`)
- [ ] `cancelar-sessao.use-case.ts`
- [ ] `add-pauta-item.use-case.ts`
- [ ] `publicar-pauta.use-case.ts` — seta `publicadaEm = now()` para todos os itens RASCUNHO
- [ ] `registrar-presenca.use-case.ts` — verifica `sessao.estaAberta()`
- [ ] `calcular-quorum.use-case.ts`

### T-09 · View Models
- [ ] `sessao.view-model.ts` — nunca expor `tenantId · isRemoved · cicloVidaJson`
- [ ] `pauta-item.view-model.ts`
- [ ] `presenca.view-model.ts`

### T-10 · Controller
- [ ] `controllers/sessoes-plenarias.controller.ts` — todos os endpoints da SPEC-002
- [ ] `@UseGuards(JwtAuthGuard, TenantGuard)` na classe
- [ ] `tenantId` via `@CurrentTenant()` — nunca do body

### T-11 · Módulo
- [ ] `sessoes-plenarias.module.ts` com todos os bindings domain → infra
- [ ] Registrar em `LegislativoModule`

---

## Fase 4 — Testes

### T-12 · Testes
- [ ] `abrir-sessao.use-case.spec.ts` — transição válida, transição inválida (400 PT)
- [ ] `quorum.service.spec.ts` — conta presenças corretamente
- [ ] `publicar-pauta.use-case.spec.ts` — pauta publicada bloqueia remoção
- [ ] Isolamento de tenant (sessão de outro tenant → 404)

---

## Checklist
- [ ] `POST /sessoes-plenarias/:id/abrir` registra `dataAbertura` e `quorumPresente`
- [ ] Transição inválida → 400 em português
- [ ] Pauta publicada → remoção de item → 409
- [ ] Presença em sessão não-aberta → 422
- [ ] `cicloVidaJson` nunca aparece no response
