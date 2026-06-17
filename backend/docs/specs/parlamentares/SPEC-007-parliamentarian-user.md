# SPEC-007 — Módulo Parlamentares: Parliamentarian e ParlamentarianUser

**Status:** Aprovada | **Versão:** 1.0
**Bounded context:** `src/legislativo/parlamentares/`
**ADR de referência:** `docs/decisions/ADR-009-parliamentarian-user.md`
**Depende de:** TASK-001 Migration M9

---

## Background

O modelo anterior amarrava `Parliamentarian` a `TenantUser` via `tenantUserId`.
Isso impedia cadastrar parlamentares sem acesso ao sistema e misturava
a identidade de servidores com a de parlamentares.

O novo modelo separa claramente três entidades:

| Entidade | O que é | Tem login? |
|----------|---------|------------|
| `Tenant` | A câmara | — |
| `Parliamentarian` | O vereador/deputado como ator legislativo | Não obrigatório |
| `ParlamentarianUser` | O acesso do parlamentar ao sistema | Sim (via User) |
| `TenantUser` | Servidor da câmara (Admin Staff, Staff) | Sim (via User) |

---

## Schema Prisma — Migration M9

### Alterações em `Parliamentarian`

```prisma
model Parliamentarian {
  id               String  @id @default(uuid())
  tenantId         String  // ligado ao tenant — NÃO ao TenantUser
  politicalPartyId String?

  // Dados legislativos
  parliamentaryName String
  officeNumber      String?
  photoUrl          String?
  biography         String? @db.Text
  status            ParliamentarianStatus @default(ACTIVE)

  isRemoved Boolean   @default(false)
  removedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relações
  tenant              Tenant               @relation(fields: [tenantId], references: [id])
  politicalParty      PoliticalParty?      @relation(fields: [politicalPartyId], references: [id])
  parliamentarianUser ParlamentarianUser?  // opcional — só existe se tiver acesso

  // Relações legislativas (inalteradas)
  mandates                       ParliamentarianMandate[]
  boardMembers                   BoardMember[]
  committeeMembers               CommitteeMember[]
  parliamentaryFrontMembers      ParliamentaryFrontMember[]
  coordinatedParliamentaryFronts ParliamentaryFront[]       @relation("FrontCoordinator")
  authoredMatters                Materia[]                  @relation("MatterAuthor")
  rapporteurMatters              Materia[]                  @relation("MatterRapporteur")
  matterCoauthorships            MatterCoauthor[]
  autores                        Autor[]

  // REMOVIDO: tenantUserId String @unique
  // REMOVIDO: tenantUser   TenantUser

  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, politicalPartyId])
  @@index([tenantId, isRemoved])
  @@map("parliamentarians")
}
```

### Novo model `ParlamentarianUser`

```prisma
enum ParlamentarianUserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model ParlamentarianUser {
  id                String @id @default(uuid())
  tenantId          String
  parliamentarianId String @unique  // 1 parlamentar → 0 ou 1 ParlamentarianUser
  userId            String @unique  // 1 user → 0 ou 1 ParlamentarianUser

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

### Alterações em `TenantUser`

```prisma
// Remover relação com Parliamentarian:
// parliamentarian Parliamentarian?   ← REMOVER esta linha

// Remover PARLIAMENTARIAN do enum:
enum TenantUserRole {
  ADMIN_STAFF
  STAFF
  // PARLIAMENTARIAN  ← REMOVIDO
}
```

### Alterações em `User`

```prisma
// Adicionar relação inversa:
parliamentarianUser ParlamentarianUser?
```

### Estratégia de migração dos dados existentes

```sql
-- Passo 1: Identificar TenantUsers com role = PARLIAMENTARIAN
-- que têm Parliamentarian vinculado
SELECT
  tu.id AS tenant_user_id,
  tu.user_id,
  tu.tenant_id,
  p.id AS parliamentarian_id
FROM tenant_users tu
JOIN parliamentarians p ON p.tenant_user_id = tu.id
WHERE tu.role = 'PARLIAMENTARIAN'
  AND tu.is_removed = false;

-- Passo 2: Criar ParlamentarianUser para cada um
INSERT INTO parliamentarian_users (id, tenant_id, parliamentarian_id, user_id, status, created_at, updated_at)
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
  AND tu.is_removed = false;

-- Passo 3: Remover esses TenantUsers (servidores, não parlamentares)
UPDATE tenant_users
SET is_removed = true, removed_at = NOW()
WHERE role = 'PARLIAMENTARIAN';

-- Passo 4: Verificar — ParlamentarianUser deve ter mesmo count que TenantUsers removidos
SELECT COUNT(*) FROM parliamentarian_users;
SELECT COUNT(*) FROM tenant_users WHERE role = 'PARLIAMENTARIAN' AND is_removed = true;
```

---

## JWT — dois tipos de sessão

O mesmo endpoint `POST /auth/login` (CPF + senha) retorna JWTs diferentes
conforme o tipo de usuário encontrado:

```ts
// Sessão de servidor (TenantUser)
interface StaffJwtPayload {
  sessionType: 'staff'
  sub: string           // userId
  tenantId: string
  tenantUserId: string
  role: 'ADMIN_STAFF' | 'STAFF'
  iat: number
  exp: number
}

// Sessão de parlamentar (ParlamentarianUser)
interface ParlamentarianJwtPayload {
  sessionType: 'parliamentarian'
  sub: string           // userId
  tenantId: string
  parliamentarianUserId: string
  parliamentarianId: string
  parliamentaryName: string
  iat: number
  exp: number
}

export type JwtPayload = StaffJwtPayload | ParlamentarianJwtPayload;
```

### Lógica de login no `AuthService`

```ts
async login(cpf: string, password: string): Promise<LoginResponse> {
  // 1. Encontrar User pelo CPF
  const user = await this.userRepo.findByCpf(cpf);
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new UnauthorizedException('CPF ou senha incorretos');
  }

  // 2. Verificar se é ParlamentarianUser
  const parlUser = await this.prisma.parliamentarianUser.findFirst({
    where: { userId: user.id, isRemoved: false, status: 'ACTIVE' },
    include: { parliamentarian: true },
  });

  if (parlUser) {
    const payload: ParlamentarianJwtPayload = {
      sessionType: 'parliamentarian',
      sub: user.id,
      tenantId: parlUser.tenantId,
      parliamentarianUserId: parlUser.id,
      parliamentarianId: parlUser.parliamentarianId,
      parliamentaryName: parlUser.parliamentarian.parliamentaryName,
    };
    return { access_token: this.jwt.sign(payload), sessionType: 'parliamentarian' };
  }

  // 3. Verificar se é TenantUser (servidor)
  const tenantUser = await this.prisma.tenantUser.findFirst({
    where: { userId: user.id, isRemoved: false, status: 'ACTIVE' },
  });

  if (tenantUser) {
    const payload: StaffJwtPayload = {
      sessionType: 'staff',
      sub: user.id,
      tenantId: tenantUser.tenantId,
      tenantUserId: tenantUser.id,
      role: tenantUser.role,
    };
    return { access_token: this.jwt.sign(payload), sessionType: 'staff' };
  }

  throw new UnauthorizedException('Usuário sem acesso ao sistema');
}
```

---

## Guards

### `TenantGuard` — extrai tenantId do JWT (inalterado)

```ts
// Funciona para ambos os tipos de sessão
const tenantId = request.user.tenantId; // presente em StaffJwtPayload e ParlamentarianJwtPayload
```

### `StaffGuard` — apenas para servidores

```ts
@Injectable()
export class StaffGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (user.sessionType !== 'staff') {
      throw new ForbiddenException('Acesso restrito a servidores da câmara');
    }
    return true;
  }
}
```

### `ParlamentarianGuard` — apenas para parlamentares

```ts
@Injectable()
export class ParlamentarianGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (user.sessionType !== 'parliamentarian') {
      throw new ForbiddenException('Acesso restrito a parlamentares');
    }
    return true;
  }
}
```

### `RolesGuard` — só faz sentido para sessão staff

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantUserRole[]>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const user: JwtPayload = ctx.switchToHttp().getRequest().user;

    // Parlamentar nunca passa por RolesGuard — usar ParlamentarianGuard para eles
    if (user.sessionType !== 'staff') {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }

    if (!requiredRoles.includes((user as StaffJwtPayload).role)) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }

    return true;
  }
}
```

---

## Use Cases novos

### `CreateParlamentarianUseCase`
- Cria `Parliamentarian` com `tenantId` — sem `tenantUserId`
- Não cria `ParlamentarianUser` — feito separadamente

### `GrantParlamentarianAccessUseCase`
- Recebe `parliamentarianId` + `userId` (ou CPF para criar/vincular User)
- Cria `ParlamentarianUser`
- Apenas `ADMIN_STAFF` pode executar

### `RevokeParlamentarianAccessUseCase`
- Seta `ParlamentarianUser.status = INACTIVE`
- Não remove o `Parliamentarian` (continua existindo como ator legislativo)

### `GetParlamentarianProfileUseCase`
- Busca `Parliamentarian` com mandatos, comissões, frentes
- Usado pela view do Parlamentar (`/parlamentar/perfil`)

---

## Endpoints novos/alterados

### `legislativo/parlamentares`

| Método | Rota | Use Case | Roles |
|--------|------|----------|-------|
| GET | `/legislative/parlamentares` | ListParlamentariansUseCase | STAFF_AND_ABOVE |
| GET | `/legislative/parlamentares/:id` | GetParlamentarianByIdUseCase | STAFF_AND_ABOVE |
| POST | `/legislative/parlamentares` | CreateParlamentarianUseCase | ADMIN_ONLY |
| PATCH | `/legislative/parlamentares/:id` | UpdateParlamentarianUseCase | ADMIN_ONLY |
| DELETE | `/legislative/parlamentares/:id` | RemoveParlamentarianUseCase | ADMIN_ONLY |
| POST | `/legislative/parlamentares/:id/acesso` | GrantParlamentarianAccessUseCase | ADMIN_ONLY |
| DELETE | `/legislative/parlamentares/:id/acesso` | RevokeParlamentarianAccessUseCase | ADMIN_ONLY |
| GET | `/legislative/parlamentares/me/perfil` | GetParlamentarianProfileUseCase | ParlamentarianGuard |

---

## Gathering Results

- [ ] `Parliamentarian` criado sem `userId` → funciona
- [ ] `Parliamentarian` sem `ParlamentarianUser` → não aparece no login
- [ ] `GrantParlamentarianAccess` cria `ParlamentarianUser` e o parlamentar passa a logar
- [ ] `RevokeParlamentarianAccess` → parlamentar não consegue mais logar (401)
- [ ] Login de parlamentar retorna JWT com `sessionType: 'parliamentarian'`
- [ ] Login de servidor retorna JWT com `sessionType: 'staff'`
- [ ] `StaffGuard` bloqueia parlamentar com 403
- [ ] `ParlamentarianGuard` bloqueia servidor com 403
- [ ] `TenantUser` não tem mais relação com `Parliamentarian`
- [ ] `TenantUserRole` não tem mais `PARLIAMENTARIAN`
