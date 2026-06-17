# TASK-007 — Parlamentares: Migration M9, ParlamentarianUser e Guards

**Spec:** `backend/docs/specs/parlamentares/SPEC-007-parliamentarian-user.md`
**ADR:** `backend/docs/decisions/ADR-009-parliamentarian-user.md`
**Depende de:** TASK-006 (TenantUserRole migration M8) concluída

> Esta task redefine a identidade do parlamentar no sistema.
> Executar antes de qualquer implementação de tela de parlamentar.

---

## Fase 1 — Migration M9

### T-01 · Adicionar enum `ParlamentarianUserStatus` e model `ParlamentarianUser`

- [ ] Abrir `backend/prisma/schema.prisma`
- [ ] Adicionar enum:

```prisma
enum ParlamentarianUserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

- [ ] Adicionar model `ParlamentarianUser` após `Parliamentarian`:

```prisma
model ParlamentarianUser {
  id                String @id @default(uuid())
  tenantId          String
  parliamentarianId String @unique
  userId            String @unique

  status       ParlamentarianUserStatus @default(ACTIVE)
  lastAccessAt DateTime?

  isRemoved Boolean   @default(false)
  removedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tenant          Tenant          @relation(fields: [tenantId], references: [id])
  parliamentarian Parliamentarian @relation(fields: [parliamentarianId], references: [id])
  user            User            @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("parliamentarian_users")
}
```

- [ ] Adicionar relação inversa em `User`:
```prisma
parliamentarianUser ParlamentarianUser?
```

- [ ] Adicionar relação inversa em `Tenant`:
```prisma
parliamentarianUsers ParlamentarianUser[]
```

### T-02 · Tornar `tenantUserId` nullable em `Parliamentarian`

⚠️ Não remover ainda — manter nullable durante a migração de dados.

```prisma
model Parliamentarian {
  // Alterar de:
  tenantUserId String @unique
  // Para:
  tenantUserId String? // nullable durante transição
}
```

- [ ] Alterar `tenantUserId` para `String?` em `Parliamentarian`
- [ ] Rodar: `npx prisma migrate dev --name add_parliamentarian_user_nullable_tenantuser`

### T-03 · Executar migração de dados

- [ ] Criar script `backend/prisma/migrate-parliamentarian-users.sql`:

```sql
-- 1. Para cada TenantUser com role = PARLIAMENTARIAN que tem Parliamentarian:
--    criar ParlamentarianUser correspondente
INSERT INTO parliamentarian_users (
  id, tenant_id, parliamentarian_id, user_id, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  tu.tenant_id,
  p.id,
  tu.user_id,
  'ACTIVE',
  NOW(),
  NOW()
FROM tenant_users tu
JOIN parliamentarians p ON p.tenant_user_id = tu.id
WHERE tu.role = 'PARLIAMENTARIAN'
  AND tu.is_removed = false
ON CONFLICT (parliamentarian_id) DO NOTHING;

-- 2. Verificar resultado
SELECT
  COUNT(*) AS parliamentarian_users_criados
FROM parliamentarian_users;

-- 3. Soft-delete os TenantUsers que eram parlamentares
UPDATE tenant_users
SET is_removed = true, removed_at = NOW()
WHERE role = 'PARLIAMENTARIAN'
  AND is_removed = false;

-- 4. Verificar isolamento
SELECT COUNT(*) FROM tenant_users WHERE role = 'PARLIAMENTARIAN' AND is_removed = false;
-- Deve retornar 0

-- 5. Nullificar tenantUserId nos Parliamentarians já migrados
UPDATE parliamentarians p
SET tenant_user_id = NULL
FROM parliamentarian_users pu
WHERE pu.parliamentarian_id = p.id;
```

- [ ] Executar: `psql $DATABASE_URL -f backend/prisma/migrate-parliamentarian-users.sql`
- [ ] Verificar contagens antes de continuar

### T-04 · Remover `tenantUserId` de `Parliamentarian` (após dados migrados)

- [ ] Confirmar que todos os `Parliamentarian` têm `tenantUserId = NULL`
  ```sql
  SELECT COUNT(*) FROM parliamentarians WHERE tenant_user_id IS NOT NULL;
  -- Deve retornar 0
  ```
- [ ] Remover campo do schema:
  ```prisma
  // Remover estas linhas de Parliamentarian:
  // tenantUserId String?
  // tenantUser   TenantUser? @relation(...)
  ```
- [ ] Remover relação inversa em `TenantUser`:
  ```prisma
  // Remover de TenantUser:
  // parliamentarian Parliamentarian?
  ```
- [ ] Rodar: `npx prisma migrate dev --name remove_parliamentarian_tenant_user_id`

### T-05 · Remover `PARLIAMENTARIAN` do enum `TenantUserRole`

- [ ] Confirmar que zero TenantUsers têm `role = PARLIAMENTARIAN` e `isRemoved = false`
- [ ] Alterar enum:
  ```prisma
  enum TenantUserRole {
    ADMIN_STAFF
    STAFF
    // PARLIAMENTARIAN removido
  }
  ```
- [ ] Rodar: `npx prisma migrate dev --name remove_parliamentarian_from_tenant_role`
- [ ] Rodar: `npx prisma generate && npx tsc --noEmit`

---

## Fase 2 — JWT com sessionType

### T-06 · Atualizar `src/auth/dto/jwt-payload.dto.ts`

```ts
import { TenantUserRole } from '@prisma/client';

export interface StaffJwtPayload {
  sessionType: 'staff';
  sub: string;
  tenantId: string;
  tenantUserId: string;
  role: TenantUserRole; // ADMIN_STAFF | STAFF
}

export interface ParlamentarianJwtPayload {
  sessionType: 'parliamentarian';
  sub: string;
  tenantId: string;
  parliamentarianUserId: string;
  parliamentarianId: string;
  parliamentaryName: string;
}

export type JwtPayload = StaffJwtPayload | ParlamentarianJwtPayload;

// Type guards
export function isStaffSession(p: JwtPayload): p is StaffJwtPayload {
  return p.sessionType === 'staff';
}

export function isParlamentarianSession(p: JwtPayload): p is ParlamentarianJwtPayload {
  return p.sessionType === 'parliamentarian';
}
```

### T-07 · Atualizar `AuthService.login()`

- [ ] Implementar lógica de dois caminhos conforme SPEC-007 seção "Lógica de login"
- [ ] Verificar `ParlamentarianUser` primeiro
- [ ] Fallback para `TenantUser`
- [ ] Lançar `UnauthorizedException('CPF ou senha incorretos')` se não encontrar nenhum
- [ ] Retornar `{ access_token, sessionType }` na response

### T-08 · Atualizar `AuthService.me()`

```ts
async me(payload: JwtPayload): Promise<AuthUser> {
  if (isStaffSession(payload)) {
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { id: payload.tenantUserId, isRemoved: false },
      include: { user: true },
    });
    // montar resposta de staff
  }

  if (isParlamentarianSession(payload)) {
    const parlUser = await this.prisma.parliamentarianUser.findFirst({
      where: { id: payload.parliamentarianUserId, isRemoved: false },
      include: { user: true, parliamentarian: true },
    });
    // montar resposta de parlamentar
  }
}
```

---

## Fase 3 — Guards

### T-09 · Criar `src/auth/guards/staff.guard.ts`

```ts
@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (!isStaffSession(user)) {
      throw new ForbiddenException('Acesso restrito a servidores da câmara');
    }
    return true;
  }
}
```

### T-10 · Criar `src/auth/guards/parliamentarian.guard.ts`

```ts
@Injectable()
export class ParlamentarianGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (!isParlamentarianSession(user)) {
      throw new ForbiddenException('Acesso restrito a parlamentares');
    }
    return true;
  }
}
```

### T-11 · Atualizar `RolesGuard` para checar sessionType

- [ ] Adicionar verificação: se `sessionType !== 'staff'` → ForbiddenException
- [ ] `RolesGuard` nunca deve ser aplicado a rotas de parlamentar

### T-12 · Atualizar decorators em `guard-combos.ts` ou equivalente

```ts
// Agora os combos de guards são explícitos por tipo de sessão:
export const STAFF_GUARDS = [JwtAuthGuard, TenantGuard, StaffGuard];
export const ADMIN_GUARDS  = [JwtAuthGuard, TenantGuard, StaffGuard, RolesGuard];
export const PARLAMENTAR_GUARDS = [JwtAuthGuard, TenantGuard, ParlamentarianGuard];

// Uso nos controllers:
// @UseGuards(...STAFF_GUARDS)   → ADMIN_STAFF e STAFF
// @UseGuards(...ADMIN_GUARDS) + @Roles(TenantUserRole.ADMIN_STAFF)  → só Admin
// @UseGuards(...PARLAMENTAR_GUARDS) → só parlamentar
```

### T-13 · Atualizar `src/auth/guards/index.ts`

```ts
export { JwtAuthGuard } from './jwt-auth.guard';
export { TenantGuard } from './tenant.guard';
export { StaffGuard } from './staff.guard';
export { ParlamentarianGuard } from './parliamentarian.guard';
export { RolesGuard } from './roles.guard';
```

---

## Fase 4 — Use Cases de acesso

### T-14 · Criar `GrantParlamentarianAccessUseCase`

```ts
// src/legislativo/parlamentares/application/use-cases/grant-parliamentarian-access.use-case.ts
@Injectable()
export class GrantParlamentarianAccessUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(parliamentarianId: string, userId: string, tenantId: string) {
    // Verificar que Parliamentarian pertence ao tenant
    const parl = await this.prisma.parliamentarian.findFirst({
      where: { id: parliamentarianId, tenantId, isRemoved: false },
    });
    if (!parl) throw new NotFoundException('Parlamentar não encontrado');

    // Verificar se já tem acesso
    const existing = await this.prisma.parliamentarianUser.findFirst({
      where: { parliamentarianId, isRemoved: false },
    });
    if (existing) {
      throw new ConflictException('Parlamentar já possui acesso ao sistema');
    }

    return this.prisma.parliamentarianUser.create({
      data: { tenantId, parliamentarianId, userId, status: 'ACTIVE' },
    });
  }
}
```

### T-15 · Criar `RevokeParlamentarianAccessUseCase`

```ts
async execute(parliamentarianId: string, tenantId: string) {
  const parlUser = await this.prisma.parliamentarianUser.findFirst({
    where: { parliamentarianId, tenantId, isRemoved: false },
  });
  if (!parlUser) throw new NotFoundException('Parlamentar não possui acesso ativo');

  return this.prisma.parliamentarianUser.update({
    where: { id: parlUser.id },
    data: { status: 'INACTIVE' },
  });
}
```

### T-16 · Criar `GetParlamentarianProfileUseCase`

```ts
// Usado pela view do parlamentar logado — pega dados do JWT
async execute(parliamentarianId: string, tenantId: string) {
  const parl = await this.prisma.parliamentarian.findFirst({
    where: { id: parliamentarianId, tenantId, isRemoved: false },
    include: {
      politicalParty: true,
      mandates: {
        where: { isRemoved: false },
        orderBy: { startedAt: 'desc' },
      },
      committeeMembers: {
        where: { isRemoved: false },
        include: { committee: true },
      },
      parliamentaryFrontMembers: {
        where: { isRemoved: false },
        include: { front: true },
      },
    },
  });
  if (!parl) throw new NotFoundException('Parlamentar não encontrado');
  return parl;
}
```

---

## Fase 5 — Controller atualizado

### T-17 · Atualizar `ParlamentaresController`

```ts
@Controller('parlamentares')
export class ParlamentaresController {
  // Rotas para STAFF (servidores da câmara)
  @Get()
  @UseGuards(...STAFF_GUARDS)
  findAll(@CurrentTenant() tenantId: string) { ... }

  @Post()
  @UseGuards(...ADMIN_GUARDS)
  @Roles(TenantUserRole.ADMIN_STAFF)
  create(@Body() dto: CreateParlamentarianDto, @CurrentTenant() tenantId: string) { ... }

  // Conceder/revogar acesso — apenas Admin Staff
  @Post(':id/acesso')
  @UseGuards(...ADMIN_GUARDS)
  @Roles(TenantUserRole.ADMIN_STAFF)
  grantAccess(@Param('id') id: string, @Body() dto: GrantAccessDto, @CurrentTenant() tenantId: string) { ... }

  @Delete(':id/acesso')
  @UseGuards(...ADMIN_GUARDS)
  @Roles(TenantUserRole.ADMIN_STAFF)
  revokeAccess(@Param('id') id: string, @CurrentTenant() tenantId: string) { ... }

  // Rota para o PARLAMENTAR ver o próprio perfil
  @Get('me/perfil')
  @UseGuards(...PARLAMENTAR_GUARDS)
  myProfile(@CurrentUser() user: ParlamentarianJwtPayload) {
    return this.getProfileUseCase.execute(user.parliamentarianId, user.tenantId);
  }
}
```

---

## Fase 6 — Testes

### T-18 · Testes de autenticação

- [ ] `auth.service.spec.ts`:
  - Login com CPF de ParlamentarianUser → retorna `sessionType: 'parliamentarian'`
  - Login com CPF de TenantUser → retorna `sessionType: 'staff'`
  - Login com CPF sem vínculo → `UnauthorizedException`
  - Login com `ParlamentarianUser.status = INACTIVE` → `UnauthorizedException`

### T-19 · Testes de guards

- [ ] `StaffGuard` bloqueia sessão de parlamentar → ForbiddenException PT
- [ ] `ParlamentarianGuard` bloqueia sessão de staff → ForbiddenException PT
- [ ] `RolesGuard` com `sessionType = 'parliamentarian'` → ForbiddenException

### T-20 · Testes de isolamento

- [ ] `Parliamentarian` de tenant A não acessível pelo tenant B
- [ ] `ParlamentarianUser` só pode ver perfil do próprio parlamentar

---

## Checklist final

- [ ] `npx tsc --noEmit` — zero erros após todas as migrations
- [ ] `ParlamentarianUser` existe no banco com dados migrados
- [ ] Zero `TenantUser` com `role = PARLIAMENTARIAN` e `isRemoved = false`
- [ ] `Parliamentarian` não tem campo `tenantUserId`
- [ ] `TenantUserRole` não tem `PARLIAMENTARIAN`
- [ ] Login de parlamentar → JWT com `sessionType: 'parliamentarian'`
- [ ] Login de servidor → JWT com `sessionType: 'staff'`
- [ ] `StaffGuard` e `ParlamentarianGuard` criados e registrados
- [ ] `GET /legislative/parlamentares/me/perfil` funciona com token de parlamentar
- [ ] `POST /legislative/parlamentares` bloqueado para parlamentar logado (403)

---

## ⚠️ Nota para o Claude Code

O campo `tenantUserId` em `Parliamentarian` deve ser removido em **duas migrations**:
1. Primeiro tornar nullable (T-02)
2. Executar dados (T-03)
3. Depois remover fisicamente (T-04)

Nunca remover um campo NOT NULL diretamente sem antes torná-lo nullable
e migrar os dados. Isso quebraria o banco em produção.
