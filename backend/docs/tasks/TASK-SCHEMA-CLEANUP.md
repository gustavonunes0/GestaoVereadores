# TASK-SCHEMA-CLEANUP — Remoção de schema não utilizado

**Audit:** `backend/docs/architecture/SCHEMA-AUDIT-001-unused-models.md`  
**Regra:** nunca dropar models legados sem migrar consumidores (ver `CLAUDE.md`).

---

## Fase 0 — Inventário

- [x] Executar queries de contagem das tabelas órfãs no banco (ver audit)
- [x] Registrar resultado neste arquivo (data + ambiente)

### Resultado contagem

```
Ambiente: Vercel Postgres (2026-06-17)

courses:              tabela já inexistente no banco
Comissao:             0
FrenteParlamentar:    0
MesaDiretora:         0
MateriaCoautor:       0
Parlamentar:          3  (seed legado — NÃO remover ainda)
Parliamentarian:      1
guest_users:          (verificar manualmente)
autores_externos:     (verificar manualmente)
```

Script: `backend/scripts/count-orphan-tables.mjs`

---

## Fase 1 — Remoção imediata (baixo risco)

### T-01 · Remover `Course`
- [x] Confirmar contagem = 0 (tabela já ausente no banco)
- [x] Remover model `Course`, enum `CourseStatus`, relação `Tenant.courses`
- [x] Migration `20260617140000_remove_unused_course`
- [x] `npx prisma generate`

### T-02 · Alinhar AutorExterno (GAP)
- [x] Módulo `identidade/autores-externos` — CRUD `/api/identidade/autores-externos`
- [x] Endpoint `GET :id/materias`
- [x] Remover `guest-users.api.ts` deprecated do frontend
- [ ] Decidir: manter ou remover módulo `guest-users` no backend

---

## Fase 2 — Seed e dados demo

### T-03 · Seed unificado
- [ ] Criar vereadores em `Parliamentarian` + `ParliamentarianMandate`
- [ ] Parar criação de `Pessoa` / `Parlamentar` / `ParlamentarMandato` no seed
- [ ] Vincular votos/presença demo ao modelo novo (quando Fase 3 pronta)

---

## Fase 3 — Migrar consumidores legado PT

### T-04 · Relatórios
- [ ] `relatorios.service.ts` usar `Legislature` + `Parliamentarian`
- [ ] Remover `resolveLegislaturaId` bridge para `Legislatura`

### T-05 · Votações
- [ ] `prisma-votacao.repository.ts` → `Parliamentarian` / `ParliamentarianMandate`
- [ ] Migration: `VotoParlamentar.parliamentarianId` (se ainda não existir)

### T-06 · Sessões plenárias
- [ ] Presença e quórum → `Parliamentarian`
- [ ] Avaliar substituir `sessaoLegislativaId` por `legislatureId` direto

### T-07 · Matérias
- [ ] Remover `prisma.parlamentar.count` → `parliamentarian.count`
- [ ] Parar dual-write `tramitacaoJson` (só `TramitacaoHistorico`)

### T-08 · Sessões — ciclo de vida
- [ ] Parar dual-write `cicloVidaJson`
- [ ] Unificar `SituacaoSessao` (lookup) com `StatusSessao` (enum)

---

## Fase 4 — Drop models órfãos (após Fase 3)

Ordem (respeitar FKs):

- [ ] `MateriaCoautor`
- [ ] `ComissaoMembro` → `Comissao`
- [ ] `TipoComissao` (se sem uso)
- [ ] `FrenteMembro` → `FrenteParlamentar`
- [ ] `MesaDiretoraMembro` → `MesaDiretora`
- [ ] `CargoMesa`
- [ ] `ParlamentarMandato` → `Parlamentar` → `Pessoa`
- [ ] `SessaoLegislativa` → `Legislatura`

Cada drop:
- [ ] `rg "prisma\.<model>" backend/src` vazio
- [ ] Nova migration
- [ ] ADR de remoção

---

## Fase 5 — Lookups globais de matéria

Decisão de negócio: implementar UI ou remover FKs.

- [ ] `TipoListagem`
- [ ] `Tematica`
- [ ] `OrigemMateria`
- [ ] `LocalOrigemExterna`
- [ ] `StatusTramitacao` (substituir por enum `StatusMateria`?)
- [ ] `UnidadeTramitacao`

---

## Fase 6 — Auth `Usuario` (SIGL master)

- [ ] Documentar se mantém sistema dual (`Usuario` master + `User` tenant)
- [ ] Se unificar: plano de migração separado

---

## Critério de conclusão

- [ ] Audit atualizado com status final de cada model
- [ ] `CLAUDE.md` schema section revisada
- [ ] Zero models órfãos com relação em `Tenant` sem uso
