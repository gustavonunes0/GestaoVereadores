# TASK-008 — Portal Institucional da Câmara

**Spec:** `backend/docs/specs/portal/SPEC-008-portal-institucional.md`
**Módulo backend:** `src/portal/`
**Frontend staff:** `frontend/src/pages/PortalInstitucionalPage.tsx`
**Frontend público:** `frontend/src/pages/portal/`
**Estimativa MVP (fases 0–2):** 3–4 sprints

---

## Ordem de execução

```
TASK-008-0  SPEC + migration + fix multi-tenant público
     ↓
TASK-008-1  Módulo portal (config API + resolver)
     ↓
TASK-008-2  PortalInstitucionalPage (config UI)
     ↓
TASK-008-3  PublicPortalLayout + Home + Vereadores
     ↓
TASK-008-4  Agenda + Normas públicas
     ↓
TASK-008-5  Mesa + Comissões + transmissão
     ↓
TASK-008-6  Matérias/pauta pública (schema se necessário)
```

---

## Fase 0 — Fundação (bloqueante)

### T-00 · Migration
- [ ] Adicionar `portalSlug String? @unique` em `Tenant`
- [ ] `npx prisma migrate dev --name portal_slug`
- [ ] Seed: `portalSlug` de exemplo no tenant demo (`camara-demo`)

### T-01 · PortalTenantResolver
- [ ] `domain/services/portal-tenant-resolver.service.ts`
  - `resolveBySlug(slug): Promise<{ tenantId, config }>`
  - 404 se tenant removido, slug inexistente ou `settings.portal.ativo === false`
- [ ] Testes unitários do resolver

### T-02 · Hotfix multi-tenant — Agenda
- [ ] `findPublic` passa a receber `tenantId`
- [ ] Novo endpoint `GET /api/public/:slug/agenda` ou migrar o existente
- [ ] Deprecar `GET /api/legislative/agenda-legislativa/public` sem tenant (documentar)

### T-03 · Hotfix multi-tenant — Normas
- [ ] `findPublic` passa a receber `tenantId`
- [ ] Novo endpoint `GET /api/public/:slug/normas`
- [ ] Deprecar `GET /api/normas/public` sem tenant

### T-04 · CORS
- [ ] Confirmar origem do frontend Vercel nas rotas públicas (mesmo domínio SPA)

**Critério de aceite Fase 0:** `GET /api/public/camara-demo/agenda` retorna apenas eventos daquele tenant com `publicoExterno: true`.

---

## Fase 1 — Módulo portal + API config (backend)

### T-05 · Domain
- [ ] `domain/entities/portal-config.entity.ts` — validação de slug e settings
- [ ] `domain/repositories/portal-config.repository.ts` (abstract)
- [ ] Tipos `PortalSettings` em `domain/` (sem Prisma)

### T-06 · Infra
- [ ] `infra/prisma/prisma-portal-config.repository.ts`
- [ ] Ler/escrever `Tenant.portalSlug` + merge em `Tenant.settings.portal`

### T-07 · Use cases
- [ ] `GetPortalConfigUseCase` (tenantId do JWT)
- [ ] `UpdatePortalConfigUseCase` (valida slug único, merge settings)
- [ ] `GetPortalPreviewUrlUseCase`

### T-08 · Controller staff
- [ ] `portal-config.controller.ts`
  - `GET /api/portal/config`
  - `PATCH /api/portal/config`
  - `GET /api/portal/config/preview-url`
- [ ] Guards: `JwtAuthGuard`, `TenantGuard`, role `ADMIN_STAFF`
- [ ] DTOs com class-validator
- [ ] View models sem campos internos

### T-09 · Registrar módulo
- [ ] `portal.module.ts` + import em `app.module.ts`

---

## Fase 1 — UI config (frontend staff)

### T-10 · API client
- [ ] `frontend/src/api/portal/portal-config.api.ts`
- [ ] Tipos `PortalSettings`, `PortalConfigViewModel`

### T-11 · PortalInstitucionalPage
- [ ] Substituir placeholder por formulário com `TabView`:
  - **Geral:** slug, título, sobre, contato, ativo/inativo
  - **Aparência:** logo (Tenant.logo), banner URL, cores
  - **Seções:** toggles das seções do portal
  - **Legislatura:** dropdown legislaturas
  - **Preview:** link + botão abrir portal
- [ ] `PageHeader`, toast, loading states
- [ ] Validação de slug no client (espelhar backend)

**Critério de aceite Fase 1:** admin salva config e obtém URL `/portal/:slug`.

---

## Fase 2 — API pública (backend)

### T-12 · Controller público
- [ ] `portal-public.controller.ts` — `@Public()` `@SkipTenant()`
- [ ] `GET /api/public/:slug/config`
- [ ] `GET /api/public/:slug/vereadores`
- [ ] `GET /api/public/:slug/vereadores/:id`
- [ ] `GET /api/public/:slug/agenda`
- [ ] `GET /api/public/:slug/normas`

### T-13 · Use cases públicos
- [ ] Cada use case resolve tenant via slug e delega aos repositórios existentes
- [ ] View models públicos enxutos (sem tenantId)

### T-14 · Testes
- [ ] Isolamento: tenant A não vê dados do tenant B
- [ ] Portal inativo retorna 404

---

## Fase 2 — Portal público (frontend)

### T-15 · Rotas e layout
- [ ] `PublicPortalLayout.tsx` — header, menu seções ativas, footer
- [ ] Rotas em `App.tsx` **fora** de `StaffRoute` / `ProtectedRoute`
- [ ] `frontend/src/api/public/` — client sem Authorization header

### T-16 · Páginas
- [ ] `PortalHomePage.tsx` — `/portal/:slug`
- [ ] `PortalVereadoresPage.tsx` — lista
- [ ] `PortalVereadorDetailPage.tsx` — perfil
- [ ] `PortalAgendaPage.tsx`
- [ ] `PortalNormasPage.tsx`
- [ ] `PortalContatoPage.tsx`

### T-17 · UX
- [ ] 404 amigável se slug inválido ou portal inativo
- [ ] Cores do tenant (`settings.portal.cores`) via CSS variables
- [ ] Responsivo mobile

**Critério de aceite Fase 2:** cidadão acessa portal sem login; vê vereadores e agenda pública.

---

## Fase 3 — Conteúdo legislativo

### T-18 · Mesa diretora
- [ ] `GET /api/public/:slug/mesa-diretora`
- [ ] Página `/portal/:slug/mesa-diretora` (se seção ativa)

### T-19 · Comissões
- [ ] `GET /api/public/:slug/comissoes`
- [ ] Página `/portal/:slug/comissoes`

### T-20 · Transmissão
- [ ] Destaque na home: próximo evento com `linkTransmissao`
- [ ] Seção transmissão se `settings.portal.secoes.transmissao`

### T-21 · Matérias / pauta pública
- [ ] Definir flag ou status de publicação (SPEC adicional se migration)
- [ ] Endpoints e páginas correspondentes

---

## Fase 4 — Backlog

- [ ] Model `PortalPagina` + CMS
- [ ] SEO (`react-helmet` / meta por tenant)
- [ ] Domínio customizado por tenant
- [ ] Analytics / widget embed
- [ ] Upload de banner (S3/R2)

---

## Comandos úteis

```bash
cd backend
npx prisma migrate dev --name portal_slug
npx prisma generate
npx jest --testPathPattern=portal
npx tsc --noEmit

cd ../frontend
npm run build
```

---

## Checklist antes de merge

- [ ] Nenhum endpoint público sem filtro `tenantId`
- [ ] View models públicos sem campos sensíveis
- [ ] Mensagens de erro em PT-BR
- [ ] `vercel.json` SPA rewrite cobre `/portal/*`
- [ ] Seed com tenant demo e `portalSlug` para teste manual
