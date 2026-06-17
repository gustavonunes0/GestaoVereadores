
# PROMPT — Parlamentares: ParlamentarianUser e sessionType

---

## PROMPT BACKEND (rodar primeiro em `backend/`)

```
Leia antes de começar:
1. CLAUDE.md (raiz do projeto)
2. backend/docs/decisions/ADR-009-parliamentarian-user.md
3. backend/docs/specs/parlamentares/SPEC-007-parliamentarian-user.md
4. backend/docs/tasks/TASK-007-parliamentarian-user.md

Confirme que entendeu antes de executar:

MUDANÇA FUNDAMENTAL:
- Parliamentarian passa a ser ligado diretamente ao Tenant — não ao TenantUser
- Um parlamentar pode NÃO ter acesso ao sistema (sem ParlamentarianUser)
- ParlamentarianUser é criado separadamente quando o parlamentar recebe login
- TenantUser passa a representar APENAS servidores (Admin Staff, Staff)
- TenantUserRole perde o valor PARLIAMENTARIAN

TRÊS ENTIDADES DISTINTAS:
- Parliamentarian → ator legislativo (vereador/deputado), ligado ao Tenant
- ParlamentarianUser → acesso ao sistema, liga Parliamentarian ao User
- TenantUser → servidor da câmara (Admin Staff, Staff)

JWT COM DOIS TIPOS:
- sessionType: 'staff' → StaffJwtPayload com role
- sessionType: 'parliamentarian' → ParlamentarianJwtPayload com parliamentarianId

DOIS GUARDS SEPARADOS:
- StaffGuard → verifica sessionType === 'staff'
- ParlamentarianGuard → verifica sessionType === 'parliamentarian'
- RolesGuard só funciona para sessão staff

NÃO execute nada ainda. Aguarde minha confirmação do resumo.

---

Após confirmação, execute em ordem ESTRITA:

FASE 1 — Migration M9 em 3 passos (T-01 a T-05):
  Passo 1: Adicionar ParlamentarianUser + tornar tenantUserId nullable em Parliamentarian
    → npx prisma migrate dev --name add_parliamentarian_user_nullable_tenantuser
  Passo 2: Executar script SQL de migração de dados
    → psql $DATABASE_URL -f backend/prisma/migrate-parliamentarian-users.sql
    → Verificar contagens antes de continuar
  Passo 3: Remover tenantUserId de Parliamentarian + remover PARLIAMENTARIAN do enum
    → npx prisma migrate dev --name remove_parliamentarian_tenant_user_id
    → npx prisma migrate dev --name remove_parliamentarian_from_tenant_role
  Após cada migration: npx prisma generate && npx tsc --noEmit

FASE 2 — JWT com sessionType (T-06 a T-08):
  - Atualizar jwt-payload.dto.ts com StaffJwtPayload e ParlamentarianJwtPayload
  - Atualizar AuthService.login() com dois caminhos
  - Atualizar AuthService.me() para os dois tipos

FASE 3 — Guards (T-09 a T-13):
  - Criar staff.guard.ts
  - Criar parliamentarian.guard.ts
  - Atualizar roles.guard.ts para verificar sessionType === 'staff'
  - Atualizar guard-combos

FASE 4 — Use Cases (T-14 a T-16):
  - GrantParlamentarianAccessUseCase
  - RevokeParlamentarianAccessUseCase
  - GetParlamentarianProfileUseCase

FASE 5 — Controller (T-17):
  - Atualizar ParlamentaresController com novos endpoints e guards

FASE 6 — Testes (T-18 a T-20):
  - auth.service.spec.ts: dois tipos de login
  - guards specs
  - isolamento de tenant

AO FINAL:
  - Marcar todos T-01 a T-20 como [x]
  - npx tsc --noEmit → zero erros
  - npx jest → todos passando
  - Verificar: zero TenantUser com role=PARLIAMENTARIAN e isRemoved=false

REGRAS:
  - Nunca remover campo NOT NULL sem antes tornar nullable e migrar dados
  - ForbiddenException sempre com mensagem em português
  - StaffGuard e ParlamentarianGuard são mutuamente exclusivos
  - RolesGuard lança erro se sessionType !== 'staff'
```

---

## PROMPT FRONTEND (rodar após backend concluído)

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. backend/docs/specs/parlamentares/SPEC-007-parliamentarian-user.md
3. frontend/docs/tasks/TASK-FE-007-parliamentarian-user.md

Confirme que entendeu:

MUDANÇA NOS TIPOS:
- AuthUser vira union type: StaffUser | ParlamentarianUser
- Type guards: isStaffUser() e isParlamentarianUser()
- Nunca comparar strings de role diretamente — usar type guards

SESSIONTYPE:
- 'staff' → StaffUser com role (ADMIN_STAFF | STAFF)
- 'parliamentarian' → ParlamentarianUser com parliamentarianId
- O backend retorna sessionType na response de login

GUARDS DE ROTA:
- StaffRoute usa isParlamentarianUser(user) para redirecionar parlamentar
- ParlamentarRoute usa !isParlamentarianUser(user) para redirecionar staff
- AdminRoute usa isStaffUser(user) && user.role === 'ADMIN_STAFF'

LAYOUT DO PARLAMENTAR:
- Exibe parliamentaryName (não name) em destaque no header
- Avatar com inicial do nome parlamentar quando sem foto
- "Perfil" no nav começa expandido com 3 sub-rotas

API DO PARLAMENTAR:
- parlamentaresApi.meuPerfil() → GET /legislative/parlamentares/me/perfil
- Backend usa parlamentarianId do JWT — frontend não passa o ID

Execute em ordem:
  FASE 1: Atualizar types/auth.ts (T-01)
  FASE 2: Atualizar AuthContext (T-02 a T-03)
  FASE 3: Atualizar guards de rota (T-04 a T-06)
  FASE 4: Atualizar usePermissions (T-07)
  FASE 5: Atualizar ParlamentarLayout (T-08)
  FASE 6: Atualizar ParlamentarPerfilPage e API (T-09 a T-10)

AO FINAL:
  - npm run build → zero erros TypeScript
  - Verificar: grep -r "role === 'PARLIAMENTARIAN'" src/ → zero resultados
  - Verificar: isStaffUser e isParlamentarianUser usados nos guards
```
