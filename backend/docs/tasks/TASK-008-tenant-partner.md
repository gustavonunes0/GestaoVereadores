# TASK-008 — TenantPartner e TenantPartnerUser (Backend)

**Spec:** `backend/docs/specs/identidade/SPEC-008-tenant-partner.md`
**ADR:** `backend/docs/decisions/ADR-010-tenant-partner.md`
**Depende de:** TASK-007 (Parliamentarian/ParlamentarianUser) concluída

> Esta task substitui GuestUser e formaliza AutorExterno como TenantPartner.
> Se TASK-001b (materias) já foi implementada usando AutorExterno, precisa
> de patch de renomeação (ver Fase 5).

---

## Fase 1 — Migration M10

### T-01 · Tornar `User.cpf` nullable

⚠️ Esta é uma alteração sensível — `cpf` deixa de ser `NOT NULL`.

- [x] Abrir `backend/prisma/schema.prisma`
- [x] Alterar:
  ```prisma
  // De: cpf String @unique
  // Para:
  cpf String? @unique
  ```
- [x] Rodar: `npx prisma migrate dev --name make_user_cpf_nullable`
  > Feito via migration consolidada `20260618100000_add_tenant_partner_remove_guest_user`
- [x] Verificar que dados existentes não foram afetados (cpf já preenchido permanece)

### T-02 · Criar model `TenantPartner`

- [x] Adicionar ao schema conforme SPEC-008 seção "Novo model TenantPartner"
- [x] Adicionar relação inversa em `Tenant`: `tenantPartners TenantPartner[]`
- [x] Adicionar relação inversa em `TipoAutor`: `tenantPartners TenantPartner[]`
- [x] Rodar: `npx prisma migrate dev --name add_tenant_partner`
  > Feito via migration consolidada

### T-03 · Criar model `TenantPartnerUser`

- [x] Adicionar ao schema conforme SPEC-008 seção "Novo model TenantPartnerUser"
- [x] Adicionar relação inversa em `Tenant`: `tenantPartnerUsers TenantPartnerUser[]`
- [x] Adicionar relação inversa em `User`: `tenantPartnerUser TenantPartnerUser?`
- [x] Rodar: `npx prisma migrate dev --name add_tenant_partner_user`
  > Feito via migration consolidada

### T-04 · Renomear `Autor.autorExternoId` → `Autor.tenantPartnerId`

> Se `AutorExterno` já foi criado por uma sessão anterior (TASK-001 M3),
> esta migration renomeia. Se nunca foi criado, apenas adicionar o campo novo.

- [x] Verificar se `Autor.autorExternoId` existe
- [x] **Se existir:** criar migration de rename
  ```prisma
  model Autor {
    // Remover: autorExternoId String?
    // Adicionar:
    tenantPartnerId String?
    tenantPartner   TenantPartner? @relation(fields: [tenantPartnerId], references: [id])
  }
  ```
- [x] Remover `Autor.guestUserId` do schema (campo e relação)
- [x] Rodar: `npx prisma migrate dev --name rename_autor_externo_to_tenant_partner`
  > Feito via migration consolidada com migração de dados

### T-05 · Migrar dados de `GuestUser` para `TenantPartner`

- [x] Criar SQL de migração de dados
  > Incluído diretamente na migration consolidada (INSERT INTO tenant_partners SELECT ... FROM autores_externos)
- [x] Executar migração
- [x] Verificar: zero `Autor` com `guest_user_id` preenchido após migration
- [x] Auditar manualmente `GuestUser` sem `Autor` vinculado antes de remover

### T-06 · Remover `GuestUser` definitivamente

- [x] Remover model `GuestUser` do schema
- [x] Remover enums `GuestUserType` e `GuestUserStatus`
- [x] Remover relação `Tenant.guestUsers`
- [x] Remover coluna `Autor.guest_user_id` (feito em T-04)
- [x] Rodar: `npx prisma migrate dev --name remove_guest_user`
  > Feito via migration consolidada
- [x] Rodar: `npx prisma generate && npx tsc --noEmit`
  > `npx tsc --noEmit` → zero erros ✅

---

## Fase 2 — Domain Layer

### T-07 · Criar `PartnerCredentialsService`

- [x] Criar `src/identidade/tenant-partners/domain/services/partner-credentials.service.ts`
- [x] Implementar `generateRandomPassword()` — 15 caracteres via `crypto.randomBytes(12).toString('base64').slice(0, 15)`
- [x] Hashing via `PASSWORD_HASHER` injetado no `CreateTenantPartnerUseCase` (mesmo padrão do sistema)
- [x] **Nunca logar ou retornar a senha gerada em nenhum response**

### T-08 · Criar entities de domínio

- [x] `src/identidade/tenant-partners/domain/entities/tenant-partner.entity.ts`
- [x] `src/identidade/tenant-partners/domain/entities/tenant-partner-user.entity.ts`
- [x] Zero imports de `@prisma/client` ou `@nestjs/*`

### T-09 · Criar repository contracts

- [x] `src/identidade/tenant-partners/domain/repositories/tenant-partner.repository.ts` (abstract class)
- [x] `src/identidade/tenant-partners/domain/repositories/tenant-partner-user.repository.ts` (abstract class)

---

## Fase 3 — Infra Layer

### T-10 · Criar Prisma repositories

- [x] `src/identidade/tenant-partners/infra/prisma/prisma-tenant-partner.repository.ts`
  - `findById`: `where: { id, tenantId, isRemoved: false }` ✅
  - `softDelete`: nunca `.delete()` ✅
  - Inclui `tipoAutor` via `include` em todas as queries (tipoAutor retornado no ViewModel) ✅
- [x] `src/identidade/tenant-partners/infra/prisma/prisma-tenant-partner-user.repository.ts`
- [ ] Mappers em `infra/prisma/mappers/` — lógica de mapeamento está inline no repositório (sem arquivo separado)

---

## Fase 4 — Application Layer

### T-11 · Criar DTOs

- [x] `create-tenant-partner.dto.ts` — `cpf` opcional
- [x] `update-tenant-partner.dto.ts` — todos os campos opcionais

### T-12 · Criar `CreateTenantPartnerUseCase`

- [x] Implementar conforme SPEC-008 seção "CreateTenantPartnerUseCase"
- [x] Gerar `User` com senha aleatória via `PartnerCredentialsService`
- [x] Gerar email placeholder se ausente: `partner-{uuid}@no-access.local`
- [x] Criar `TenantPartner` e `TenantPartnerUser` (User criado + TenantPartnerUser vinculado)
- [x] **Nunca retornar a senha gerada no response**

### T-13 · Criar demais Use Cases

- [x] `ListTenantPartnersUseCase` — filtro por `tipoAutorId`
- [x] `GetTenantPartnerByIdUseCase`
- [x] `UpdateTenantPartnerUseCase` — atualiza apenas `TenantPartner`, nunca toca `User`/senha
- [x] `RemoveTenantPartnerUseCase` — soft delete em `TenantPartner` E `TenantPartnerUser`

### T-14 · Criar View Model

- [x] `tenant-partner.view-model.ts` implementado
- [x] Retorna `tipoAutor: { id, nome, idNegocio }` (objeto completo, não apenas ID)
- [x] Nunca expõe: `userId`, `tenantPartnerUserId`, senha ou qualquer dado de `User`

### T-15 · Criar Controller

- [x] Registrar rota com prefixo `/identidade/tenant-partners`
- [x] Confirmar que `create`, `update` e `remove` aceitam tanto `ADMIN_STAFF`
      quanto `STAFF` — usa `@TenantRoles(...STAFF_AND_ABOVE)` em todos os endpoints de escrita ✅

---

## Fase 5 — Patch de renomeação (SE TASK-001b já foi implementada)

> Se o módulo de Matérias já foi implementado usando `AutorExterno`
> (nome anterior), aplicar este patch de renomeação.

### T-16 · Renomear referências no código

- [x] `autor-resolver.service.ts` — `AutorExternoData` → `PartnerData`, `autorExterno` → `partner`
- [x] `AutorResolverService.validar()` — já usa `tenantPartnerId`
- [x] `resolverNomeCompleto()` — renomeado para usar `TenantPartner`
- [x] `SetAutorExternoDto` → `SetTenantPartnerDto`
- [x] `SetMatterAutorExternoUseCase` → `SetMatterTenantPartnerUseCase`
- [x] `ListAutoresExternosUseCase` → `ListTenantPartnersForMatterUseCase`
- [x] `AutorExternoListItem` → `TenantPartnerListItem`
- [x] `GuestUserNotFoundForMatterError` → `TenantPartnerNotFoundForMatterError`
- [x] `setAutorExterno()` (repositório) → `setTenantPartner()`
- [x] `listAutoresExternos()` (repositório) → `listTenantPartners()`
- [x] `tiposAutorExterno` (dominios.service.ts) → `tiposPartner`
- [x] Rota `GET /legislative/materias/autores-externos` → `GET /legislative/materias/tenant-partners`
- [x] Módulo guest-users (`backend/src/identidade/guest-users/`) removido completamente

```bash
# Verificação após renomear
grep -r "AutorExterno\|autorExternoId\|GuestUser\|guestUserId" backend/src/
# Retorna: zero resultados ✅
```

---

## Fase 6 — Bloqueio de Login (AuthService)

### T-17 · Implementar `isPartnerOnlyUser()` no `AuthService`

- [x] `isPartnerOnlyUser()` declarado em `CamaraAuthRepository` (abstract)
- [x] `isPartnerOnlyUser()` implementado em `PrismaCamaraAuthRepository`
  - Verifica se userId tem `TenantPartnerUser` mas **não** tem `TenantUser` nem `ParlamentarianUser`
- [x] Chamado em `LoginCamaraUseCase.execute()` **antes** de validar senha
- [x] Lança `InvalidCredentialsError` com mensagem genérica — idêntica à de CPF não encontrado

### T-18 · Bloquear recuperação de senha (se endpoint existir)

- [x] `POST /auth/forgot-password` **não existe** no projeto — requisito não aplicável ✅

---

## Fase 7 — Testes

### T-19 · Testes de domínio

- [x] `create-tenant-partner.use-case.spec.ts`
  - Cria sem CPF → sucesso ✅
  - Cria com CPF → sucesso ✅
  - Senha gerada nunca aparece no retorno ✅
- [x] `login-camara.use-case.spec.ts`
  - Login com CPF de `TenantPartnerUser` puro → `InvalidCredentialsError` ✅
  - Login com CPF de usuário que é Partner E também TenantUser → sucesso ✅
  - Verificado que `passwordHasher.compare` não é chamado quando bloqueio ocorre ✅

### T-20 · Teste de migração

- [x] `tenant-partner-migration.spec.ts` — verifica schema.prisma em runtime
  - model GuestUser não existe mais ✅
  - enum GuestUserType e GuestUserStatus não existem mais ✅
  - Autor não tem campo guestUserId ✅
  - Autor tem campo tenantPartnerId ✅
  - TenantPartner e TenantPartnerUser existem no schema ✅

---

## Checklist final

- [x] `User.cpf` é nullable no schema
- [x] `TenantPartner` e `TenantPartnerUser` criados e funcionando
- [x] `GuestUser` removido completamente (schema, banco, código)
- [x] `Autor.tenantPartnerId` substitui `autorExternoId` e `guestUserId`
- [x] Criar Partner sem CPF → funciona (CPF é opcional no DTO)
- [x] Senha do Partner nunca exposta em nenhum response
- [x] Login com CPF de Partner puro → 401 com mensagem genérica
- [x] `grep -r "GuestUser\|AutorExterno" backend/src/` → zero resultados ✅
- [x] `npx tsc --noEmit` passando (zero erros) ✅
- [x] `npx jest` passando — 12 testes T-19/T-20 escritos e passando ✅
