# SCHEMA-AUDIT-001 — Modelos e campos não utilizados no fluxo atual

**Data:** 2026-06-17  
**Escopo:** `backend/prisma/schema.prisma` × backend (`src/`) × frontend (`frontend/src/`)  
**Objetivo:** Validar o que está mapeado mas não participa do fluxo real, para remoção segura em fases.

---

## Metodologia

Para cada `model` do Prisma:

1. **Backend** — busca por `prisma.<model>` em `backend/src` (repositórios, services, guards).
2. **API** — controller registrado em `app.module` / módulos filhos.
3. **Frontend** — rotas em `navigation.ts`, páginas, chamadas em `api/paths.ts`.
4. **Seed** — uso em `prisma/seed.ts` (dados demo podem manter tabelas “mortas” no app).
5. **Classificação** — ver legenda abaixo.

> **Atenção:** tabela populada no seed **não** significa uso no produto. Ex.: `Parlamentar`/`Pessoa` no seed, mas a UI de parlamentares usa `Parliamentarian`.

---

## Legenda de status

| Status | Significado | Ação sugerida |
|--------|-------------|---------------|
| **ATIVO** | Backend + frontend (ou API essencial) | Manter |
| **BACKEND** | Só API interna; sem tela dedicada | Manter; avaliar UI depois |
| **DOMÍNIO** | Só `DominiosService` (lookups) | Manter ou remover se FK nunca preenchida |
| **LEGADO** | Substituído por model EN; ainda referenciado | Migrar consumidores → depois remover |
| **ÓRFÃO** | Zero uso em `src/` (só schema/seed/migration) | Candidato forte à remoção |
| **GAP** | Model existe; fluxo incompleto (UI ou CRUD faltando) | Implementar ou remover |

---

## Resumo executivo

| Categoria | Qtd. models | Observação |
|-----------|-------------|------------|
| Ativos (fluxo principal) | 28 | Núcleo do SIGL |
| Legado em transição (PT → EN) | 9 | Bloqueiam remoção até migração |
| Órfãos (substituídos, sem `prisma.*`) | 7 | Remoção após confirmar dados vazios |
| Só domínios / lookup global | 8 | Muitos sem formulário no frontend |
| GAP de implementação | 3 | `Course`, CRUD `AutorExterno`, `GuestUsers` no FE |
| Auth paralelo | 1 | `Usuario` (SIGL master) vs `User` (câmara) |

**Duplicações estruturais principais:**

```
LEGADO (PT)              →  NOVO (EN)              UI atual
─────────────────────────────────────────────────────────────
Parlamentar + Pessoa     →  Parliamentarian        Parliamentarian ✅
Legislatura              →  Legislature            Legislature ✅
Comissao                 →  Committee              Committee ✅
FrenteParlamentar        →  ParliamentaryFront     ParliamentaryFront ✅
MesaDiretora + CargoMesa →  Board + BoardRole      Board ✅
MateriaCoautor           →  MatterCoauthor         MatterCoauthor ✅
SituacaoSessao (lookup)  →  StatusSessao (enum)    Ambos ⚠️
tramitacaoJson           →  TramitacaoHistorico    Dual-write ⚠️
cicloVidaJson            →  statusSessao + datas   Dual-write ⚠️
GuestUser                →  AutorExterno           AutorExterno (GAP CRUD)
```

---

## Matriz por model

### Identidade e multi-tenant

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `User` | ATIVO | ✅ auth, tenant-users | ✅ login CPF | |
| `Tenant` | ATIVO | ✅ guards, tenants (master) | indireto | |
| `TenantUser` | ATIVO | ✅ auth, usuarios | ✅ `/usuarios` | |
| `Usuario` | LEGADO | ✅ `PrismaSiglUserRepository`, JWT master | ❌ FE só login CPF | Master `admin/admin` no seed; sem tela |
| `GuestUser` | GAP | ✅ módulo `/guest-users` completo | ❌ `guest-users.api.ts` deprecated | Substituído por `AutorExterno`; módulo órfão no FE |
| `ParlamentarianUser` | ATIVO | ✅ auth parlamentar | ✅ portal `/parlamentar` | |

### Parlamentares e estrutura da câmara (modelo novo EN)

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `Parliamentarian` | ATIVO | ✅ `parlamentares/` | ✅ `/camara/parlamentares` | |
| `ParliamentarianMandate` | ATIVO | ✅ mandatos | ✅ mandato parlamentar | |
| `Legislature` | ATIVO | ✅ `legislaturas/` | ✅ `LegislaturasPage`, `LegislaturaContext` | Fora do menu lateral; rota `/camara/legislaturas` |
| `PoliticalParty` | ATIVO | ✅ partidos | indireto (filiacao) | |
| `Committee` | ATIVO | ✅ comissoes | ✅ `/camara/comissoes` | Não usa `TipoComissao` |
| `CommitteeMember` | ATIVO | ✅ | ✅ | |
| `ParliamentaryFront` | ATIVO | ✅ frentes | ✅ `/camara/frentes` | |
| `ParliamentaryFrontMember` | ATIVO | ✅ | ✅ | |
| `Board` | ATIVO | ✅ mesa-diretora | ✅ `/camara/mesa-diretora` | |
| `BoardRole` | ATIVO | ✅ (substitui `CargoMesa` na API) | ✅ | `CreateCargoMesaUseCase` grava em `BoardRole` |
| `BoardMember` | ATIVO | ✅ | ✅ | |

### Parlamentares e estrutura (modelo legado PT)

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `Pessoa` | LEGADO | seed + `relatorios` (presença) | ❌ | FK de `Parlamentar` |
| `Parlamentar` | LEGADO | votacoes, sessoes (quórum/voto), materias (count), relatorios | ❌ | UI não usa; seed cria vereadores demo |
| `ParlamentarMandato` | LEGADO | votacoes, sessoes | ❌ | |
| `Legislatura` | LEGADO | relatorios (+ bridge com `Legislature`) | indireto | `resolveLegislaturaId` converte IDs |
| `Comissao` | ÓRFÃO | ❌ | ❌ | Substituído por `Committee` |
| `ComissaoMembro` | ÓRFÃO | ❌ | ❌ | |
| `TipoComissao` | DOMÍNIO | só `DominiosService` | ❌ (tipo no `useDominios`, sem tela) | `Committee` não tem FK |
| `FrenteParlamentar` | ÓRFÃO | ❌ | ❌ | Substituído por `ParliamentaryFront` |
| `FrenteMembro` | ÓRFÃO | ❌ | ❌ | |
| `MesaDiretora` | ÓRFÃO | ❌ | ❌ | Substituído por `Board` |
| `MesaDiretoraMembro` | ÓRFÃO | ❌ | ❌ | |
| `CargoMesa` | DOMÍNIO | só `DominiosService` | ❌ | API mesa usa `BoardRole` |

### Processo legislativo

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `Materia` | ATIVO | ✅ materias | ✅ `/materias` | Vários FKs de lookup pouco usados (ver seção campos) |
| `MatterCoauthor` | ATIVO | ✅ | indireto | Modelo atual de coautoria |
| `MateriaCoautor` | ÓRFÃO | ❌ | ❌ | Legado; FK `Parlamentar` |
| `Autor` | ATIVO | ✅ materias | indireto | Polimórfico (4 FKs opcionais) |
| `AutorExterno` | GAP | ✅ read (`findMany`) + uso em autoria | ✅ `AutoresPage` | **Sem CRUD backend** — FE chama `/identidade/autores-externos` inexistente |
| `MateriaAutor` | ATIVO | ✅ | indireto | Autores adicionais |
| `MateriaRepresentante` | ATIVO | ✅ | indireto | |
| `TramitacaoHistorico` | ATIVO | ✅ append-only | ✅ `MateriaVerDialog` | |
| `PublicacaoOficial` | ATIVO | ✅ create + mapper | API path existe | Pouca UI dedicada |
| `TipoMateria` | ATIVO | ✅ | ✅ | |
| `SessaoPlenaria` | ATIVO | ✅ sessoes | ✅ `/sessoes` | Ainda escreve `cicloVidaJson` |
| `SessaoLegislativa` | LEGADO | seed, relatorios, FK sessão | indireto filtros | Sem CRUD próprio |
| `PautaItem` | ATIVO | ✅ sessoes | ✅ | |
| `Votacao` | ATIVO | ✅ votacoes | ✅ | |
| `VotoParlamentar` | ATIVO | ✅ | indireto | FK `parlamentarId` (legado) |
| `PresencaSessao` | ATIVO | ✅ sessoes | indireto | FK `parlamentarId` + `pessoa` em relatório |
| `AgendaLegislativa` | ATIVO | ✅ agenda | ✅ `/agenda` | |
| `Norma` | ATIVO | ✅ normas | ✅ `/normas-juridicas` | |
| `Ato` | ATIVO | ✅ atos | ✅ `/atos-administrativos` | Verificar `tenantId` no model |

### Lookups globais / domínios

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `Ano` | ATIVO | dominios + normas/materias | ✅ normas, materias | |
| `TipoAutor` | ATIVO | dominios + Autor | ✅ autores | |
| `TipoSessao` | ATIVO | dominios + sessoes | ✅ sessoes | |
| `SituacaoSessao` | LEGADO | dominios + sessoes (create legacy) | ✅ filtros sessão | Duplica `StatusSessao` enum na mesma entidade |
| `TipoNorma` | ATIVO | dominios + normas | ✅ | |
| `EsferaFederacao` | ATIVO | dominios + normas | ✅ | |
| `IdentificadorNorma` | ATIVO | dominios + normas | ✅ | |
| `TipoAto` | ATIVO | dominios + atos | ✅ | |
| `ClassificacaoAto` | ATIVO | dominios + atos | ✅ | |
| `TipoListagem` | DOMÍNIO | só dominios | ❌ | FK em `Materia`; sem formulário |
| `Tematica` | DOMÍNIO | só dominios | ❌ | FK em `Materia`; DTO aceita, UI não |
| `OrigemMateria` | DOMÍNIO | só dominios | ❌ | Idem |
| `LocalOrigemExterna` | DOMÍNIO | só dominios | ❌ | Idem |
| `StatusTramitacao` | DOMÍNIO | dominios + include materia | só leitura cards | Não editável na UI |
| `UnidadeTramitacao` | DOMÍNIO | dominios + include materia | só leitura cards | Não editável na UI |

### Outros

| Model | Status | Backend | Frontend | Notas |
|-------|--------|---------|----------|-------|
| `Course` | ÓRFÃO | ❌ | ❌ | Modelo de exemplo; zero referências em `src/` |

---

## Campos JSON e enums duplicados (dentro de models ativos)

| Campo / enum | Status | Onde ainda escreve | Substituto | Remoção |
|--------------|--------|-------------------|------------|---------|
| `Materia.tramitacaoJson` | LEGADO | `prisma-materia.repository` (dual-write) | `TramitacaoHistorico` | Parar write → depois drop coluna |
| `SessaoPlenaria.cicloVidaJson` | LEGADO | `prisma-sessao-plenaria.repository` | `statusSessao` + timestamps | Idem |
| `SituacaoSessao` (tabela) | LEGADO | create sessão, filtros | `StatusSessao` enum | Unificar após migração de dados |
| `Materia.primeiroAutorId` / `relatorId` | LEGADO | repository materias | `authorParliamentarianId` / `rapporteurParliamentarianId` | Migrar FKs |
| `VotoParlamentar.parlamentarId` | LEGADO | votacoes | `parliamentarianId` (falta no schema) | TASK votacoes |
| `PresencaSessao.parlamentarId` | LEGADO | sessoes | idem | TASK sessoes |

---

## FKs de `Materia` pouco ou nunca usadas na UI

Presentes no schema e DTOs; **sem campo nos formulários** do frontend:

- `tematicaId`, `origemId`, `tipoListagemId`, `localOrigemExternaId`
- `unidadeTramitacaoDestinoId`, `statusTramitacaoId` (apenas exibição em listagem)
- `primeiroAutorId`, `relatorId` (legado; novo fluxo usa `Parliamentarian`)

**Decisão pendente:** implementar telas, remover FKs, ou manter para importação futura.

---

## Inconsistências encontradas (não são “órfãos”, mas bloqueiam limpeza)

1. **AutorExterno sem CRUD** — `AutoresPage` chama `POST/PATCH/DELETE /identidade/autores-externos`; backend só expõe `GET /legislative/materias/autores-externos` (lista). Model usado na leitura, fluxo de cadastro quebrado.
2. **Dois parlamentos no seed** — `Parliamentarian` (API UI) vs `Parlamentar`+`Pessoa` (demo legado para votos/relatórios).
3. **Dois modelos de legislatura** — `Legislature` na UI; `Legislatura`+`SessaoLegislativa` em relatórios e FK de `SessaoPlenaria`.
4. **`Course` no schema** — relação em `Tenant.courses`; nunca implementado (candidato remoção imediata).
5. **`GuestUsers` backend ativo** — frontend migrou para AutorExterno; módulo duplicado conceitualmente.

---

## Regra do projeto (CLAUDE.md)

> **Nunca remover models legados** (`Parlamentar`, `Legislatura`, `Comissao`, `MateriaCoautor`…) sem migração explícita.

Este audit **não autoriza drop direto**. A remoção exige:

1. Migrar todos os consumidores (relatórios, votos, presença, seed).
2. Migration de dados PT → EN onde aplicável.
3. Atualizar `CLAUDE.md` e ADRs.
4. Nunca alterar migrations já aplicadas — só novas migrations forward.

---

## Plano de remoção sugerido (TASK-SCHEMA-CLEANUP)

### Fase 0 — Documentação e inventário de dados (1 dia)

- [ ] Rodar queries de contagem por tabela órfã em produção/staging.
- [ ] Confirmar com negócio quais lookups de matéria são necessários.

```sql
-- Exemplo: tabelas órfãs candidatas
SELECT 'Course' AS t, COUNT(*) FROM "Course"
UNION ALL SELECT 'Comissao', COUNT(*) FROM "Comissao"
UNION ALL SELECT 'FrenteParlamentar', COUNT(*) FROM "FrenteParlamentar"
UNION ALL SELECT 'MesaDiretora', COUNT(*) FROM "MesaDiretora"
UNION ALL SELECT 'MateriaCoautor', COUNT(*) FROM "MateriaCoautor";
```

### Fase 1 — Remoção segura imediata

| Item | Pré-requisito |
|------|----------------|
| `Course` + `CourseStatus` + relação `Tenant.courses` | Contagem = 0 |
| Módulo `guest-users` (se AutorExterno CRUD existir) | FE + BE alinhados |
| `frontend/src/api/guest-users.api.ts` | Já deprecated |

### Fase 2 — Completar GAPs antes de remover legado

| Item | Entrega |
|------|---------|
| CRUD `AutorExterno` | Controller `identidade/autores-externos` ou corrigir paths FE |
| Migrar seed | Criar `Parliamentarian` demo; parar de criar `Parlamentar`/`Pessoa` |
| Votos e presença | Usar `parliamentarianId` em `VotoParlamentar` / `PresencaSessao` |

### Fase 3 — Migrar consumidores do legado PT

| Consumidor atual | Models legados | Migrar para |
|------------------|----------------|-------------|
| `relatorios.service.ts` | `Legislatura`, `SessaoLegislativa`, `Parlamentar` | `Legislature`, `Parliamentarian` |
| `prisma-votacao.repository.ts` | `Parlamentar`, `ParlamentarMandato` | `Parliamentarian`, `ParliamentarianMandate` |
| `prisma-sessao-plenaria.repository.ts` | idem | idem |
| `prisma-materia.repository.ts` | `parlamentar.count` | `parliamentarian.count` |

### Fase 4 — Drop models órfãos (após Fase 3 + contagem 0)

Ordem sugerida (respeitar FKs):

1. `MateriaCoautor`
2. `ComissaoMembro` → `Comissao` → `TipoComissao` (se `Committee` não referenciar)
3. `FrenteMembro` → `FrenteParlamentar`
4. `MesaDiretoraMembro` → `MesaDiretora` → `CargoMesa`
5. `ParlamentarMandato` → `Parlamentar` → `Pessoa`
6. `SessaoLegislativa` → `Legislatura` (quando relatórios e sessões não dependerem)

### Fase 5 — Limpar campos e enums

1. Parar dual-write em `tramitacaoJson` / `cicloVidaJson`
2. Remover colunas JSON após período de observação
3. Unificar `SituacaoSessao` (tabela) com `StatusSessao` (enum)
4. Remover FKs legadas em `Materia` (`primeiroAutorId`, `relatorId`)
5. Avaliar drop de lookups globais não usados (`TipoListagem`, `Tematica`, etc.)

### Fase 6 — Auth SIGL (`Usuario`)

- Decidir se master SIGL permanece separado de `User`
- Se unificar: migrar `Usuario` → `User` com flag master; senão documentar como admin de plataforma

---

## Checklist antes de cada DROP

- [ ] `rg "prisma\.<model>" backend/src` retorna vazio
- [ ] Nenhuma FK ativa de models que permanecem
- [ ] Seed atualizado
- [ ] Testes passando (`jest`, `tsc --noEmit`)
- [ ] Nova migration `drop_*` (nunca editar migration antiga)
- [ ] ADR de remoção registrado

---

## Comandos úteis para revalidar

```bash
# Uso de um model no backend
rg "prisma\.comissao" backend/src

# Models no schema
rg "^model " backend/prisma/schema.prisma

# Rotas frontend
rg "route:" frontend/src/app/navigation.ts
```

---

## Próximo passo recomendado

1. Executar queries de contagem (Fase 0) no banco de staging/produção.  
2. Abrir **TASK-SCHEMA-CLEANUP-001** com escopo Fase 1 (`Course`) + fix CRUD `AutorExterno`.  
3. Só então agendar remoção dos models legados PT (Fase 4).

---

## Referências

- `CLAUDE.md` — regra 6 (não remover legados sem migração)
- `backend/docs/decisions/ADR-001-008.md` — `tramitacaoJson`, `cicloVidaJson`, `AutorExterno`
- `backend/docs/specs/materias/SPEC-001-materias.md`
- `backend/docs/specs/sessoes/SPEC-002-sessoes.md`
