# SPEC-006 — Identidade: Tenant, TenantUser, Roles e Guards

**Status:** Aprovada | **Versão:** 1.0
**Módulo:** `src/identidade/`
**Depende de:** TASK-001 Migration M8 (enum TenantUserRole)

---

## Background

O schema atual de `TenantUser` usa três booleans independentes
(`isTenantAdmin`, `isTenantStaff`, `isParliamentarian`) para representar perfis.
Isso tem três problemas:

1. Não reflete os quatro perfis reais do sistema — Admin Staff e Staff são colapsados
   em um único `isTenantStaff`
2. `isParliamentarian` é redundante com a existência de `Parliamentarian` no banco
3. `permissions Json @default("[]")` sem schema definido não protege nada em runtime —
   o guard não consegue verificar permissão sem query extra ao banco

Esta spec substitui os booleans por um `TenantUserRole` enum e define os guards
que aplicam as regras em cada endpoint.

---

## Entidades e seus papéis

### Tenant
Representa uma câmara legislativa (Câmara Municipal de Vereadores ou Câmara dos Deputados).
É o hub de isolamento multi-tenant — quase tudo no sistema é filtrado por `tenantId`.

```prisma
// Sem alteração de campos — apenas contexto
model Tenant {
  id     String       @id @default(uuid())
  name   String
  cnpj   String       @unique
  status TenantStatus @default(ACTIVE)
  // ... campos existentes
}
```

### TenantUser e TenantUserRole

Vincula um `User` (pessoa com login) a um `Tenant` com um papel específico.

**Perfis definidos pelo cliente:**

| Role | Quem é | Resumo de capacidades |
|------|--------|----------------------|
| `ADMIN_STAFF` | Funcionário administrador da câmara | CRUD completo + gerencia pessoas |
| `STAFF` | Funcionário operacional | Cria e opera, não edita/apaga registros nem gerencia pessoas |
| `PARLIAMENTARIAN` | Vereador/Deputado | Cria matérias próprias + vota em sessões |

**Diferença crítica Staff vs Admin Staff:**

| Ação | Admin Staff | Staff |
|------|------------|-------|
| Iniciar sessão | ✅ | ✅ |
| Suspender sessão | ✅ | ✅ |
| Encerrar sessão | ✅ | ✅ |
| Cancelar sessão | ✅ | ✅ |
| Abrir / encerrar votação | ✅ | ✅ |
| Criar agenda | ✅ | ✅ |
| **Editar agenda** | ✅ | ❌ |
| **Apagar agenda** | ✅ | ❌ |
| Criar matéria | ✅ | ✅ |
| Tramitar matéria | ✅ | ✅ |
| **Editar matéria** | ✅ | ❌ |
| **Apagar matéria** | ✅ | ❌ |
| Criar norma/ato | ✅ | ✅ |
| **Editar norma/ato** | ✅ | ❌ |
| **Apagar norma/ato** | ✅ | ❌ |
| **Gerenciar parlamentares** | ✅ | ❌ |
| **Gerenciar autores externos** | ✅ | ❌ |
| **Convidar/desativar usuários** | ✅ | ❌ |

**Capacidade exclusiva do Parlamentar:**

| Ação | Parlamentar |
|------|------------|
| Votar em sessão | ✅ **EXCLUSIVO** |
| Criar matérias | ✅ (apenas as próprias) |
| Ver pauta e agenda | ✅ |
| Qualquer CRUD além de matérias próprias | ❌ |

### Parliamentarian
É um `TenantUser` com `role = PARLIAMENTARIAN` que tem dados legislativos extras
(nome parlamentar, partido, foto, mandatos). Não é uma entidade separada de identidade —
é uma especialização do TenantUser com perfil e dados adicionais.

### AutorExterno
**Não tem acesso ao sistema.** Não tem `User`, não tem `TenantUser`, não tem login.
É uma entidade de dados que representa pessoas físicas, cargos ou órgãos que
assinam matérias como autor/coautor/relator.

Separação crítica:
- `GuestUser` → pessoa com acesso temporário ao sistema (tem login)
- `AutorExterno` → entidade sem acesso que apenas figura em matérias

---

## Schema Prisma — Migration M8

### Novo enum `TenantUserRole`

```prisma
enum TenantUserRole {
  ADMIN_STAFF
  STAFF
  PARLIAMENTARIAN
}
```

### Alterações em `TenantUser`

```prisma
model TenantUser {
  id       String @id @default(uuid())
  tenantId String
  userId   String

  // NOVO — substitui os três booleans
  role TenantUserRole @default(STAFF)

  // REMOVER após migration (manter nullable temporariamente para não quebrar)
  // isTenantAdmin     Boolean @default(false)   ← deprecated
  // isTenantStaff     Boolean @default(false)   ← deprecated
  // isParliamentarian Boolean @default(false)   ← deprecated

  // permissions Json @default("[]")  ← deprecated (substituído pelo role)

  status       TenantUserStatus @default(ACTIVE)
  lastAccessAt DateTime?

  createdAt  DateTime  @default(now())
  createdBy  String?
  modifiedAt DateTime  @updatedAt
  modifiedBy String?
  isRemoved  Boolean   @default(false)
  removedAt  DateTime?

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  parliamentarian Parliamentarian?
  // ... demais relações existentes

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
  @@index([tenantId, role])         // NOVO — queries por role
  @@index([tenantId, isRemoved])
  @@map("tenant_users")
}
```

**Estratégia de migração dos booleans para o enum:**

```sql
-- Rodar antes de tornar role NOT NULL
UPDATE tenant_users SET role = 'ADMIN_STAFF'    WHERE is_tenant_admin = true;
UPDATE tenant_users SET role = 'PARLIAMENTARIAN' WHERE is_parliamentarian = true AND is_tenant_admin = false;
UPDATE tenant_users SET role = 'STAFF'           WHERE is_tenant_staff = true AND is_tenant_admin = false AND is_parliamentarian = false;
-- Verificar se sobrou algum sem role mapeado:
SELECT COUNT(*) FROM tenant_users WHERE role IS NULL;
```

---

## JWT Payload

O payload do JWT deve incluir `role` para que os guards não precisem consultar o banco
em cada request:

```typescript
// src/auth/dto/jwt-payload.dto.ts
export interface JwtPayload {
  sub: string;           // userId
  tenantId: string;
  tenantUserId: string;
  role: TenantUserRole;  // NOVO — incluído no token
  parliamentarianId?: string; // preenchido apenas se role = PARLIAMENTARIAN
  iat: number;
  exp: number;
}
```

O `AuthService.login()` deve incluir `role` e `parliamentarianId` ao gerar o token.

---

## Guards e Decorators

### Estrutura de arquivos

```
src/auth/
├── guards/
│   ├── jwt-auth.guard.ts          ← já existe — verifica token válido
│   ├── tenant.guard.ts            ← já existe — extrai tenantId do JWT
│   ├── roles.guard.ts             ← NOVO — verifica TenantUserRole
│   └── ownership.guard.ts         ← NOVO — verifica se recurso pertence ao tenant
├── decorators/
│   ├── current-tenant.decorator.ts  ← já existe
│   ├── current-user.decorator.ts    ← já existe
│   └── roles.decorator.ts           ← NOVO — @Roles(...)
└── auth.module.ts
```

### `roles.decorator.ts`

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TenantUserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### `roles.guard.ts`

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantUserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sem @Roles() → rota protegida por JwtAuthGuard apenas (qualquer role autenticado)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }

    return true;
  }
}
```

### `ownership.guard.ts` — verifica que o recurso pertence ao tenant

```typescript
// src/auth/guards/ownership.guard.ts
// Usado como guard adicional em endpoints que precisam verificar
// que o id do recurso na rota pertence ao tenantId do JWT
import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Implementação no use case via tenantId — este guard é opcional
    // A proteção primária é sempre o filtro { tenantId, isRemoved: false } no repositório
    return true;
  }
}
```

---

## Uso dos guards e decorators nos controllers

### Padrão de uso

```typescript
// Qualquer usuário autenticado do tenant pode acessar
@Get()
@UseGuards(JwtAuthGuard, TenantGuard)
findAll() {}

// Apenas Admin Staff e Staff
@Post()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF)
create() {}

// Apenas Admin Staff
@Delete(':id')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(TenantUserRole.ADMIN_STAFF)
remove() {}

// Apenas Parlamentar (votar)
@Post(':id/votos')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(TenantUserRole.PARLIAMENTARIAN)
registrarVoto() {}
```

### Mapa de roles por endpoint por módulo

#### `legislativo/sessoes-plenarias`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /sessoes-plenarias` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `GET /sessoes-plenarias/:id` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /sessoes-plenarias` | ADMIN_STAFF |
| `PATCH /sessoes-plenarias/:id` | ADMIN_STAFF |
| `DELETE /sessoes-plenarias/:id` | ADMIN_STAFF |
| `POST /sessoes-plenarias/:id/abrir` | ADMIN_STAFF, STAFF |
| `POST /sessoes-plenarias/:id/suspender` | ADMIN_STAFF, STAFF |
| `POST /sessoes-plenarias/:id/encerrar` | ADMIN_STAFF, STAFF |
| `POST /sessoes-plenarias/:id/cancelar` | ADMIN_STAFF, STAFF |
| `GET /sessoes-plenarias/:id/quorum` | ADMIN_STAFF, STAFF |
| `POST /sessoes-plenarias/:id/pauta` | ADMIN_STAFF, STAFF |
| `PATCH /sessoes-plenarias/:id/pauta/publicar` | ADMIN_STAFF, STAFF |
| `POST /sessoes-plenarias/:id/presencas` | ADMIN_STAFF, STAFF |

#### `legislativo/votacoes`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /votacoes` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `GET /votacoes/:id` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /votacoes` (abrir) | ADMIN_STAFF, STAFF |
| `POST /votacoes/:id/votos` | **PARLIAMENTARIAN** exclusivo |
| `POST /votacoes/:id/encerrar` | ADMIN_STAFF, STAFF |

#### `legislativo/materias`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /materias` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `GET /materias/:id` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /materias` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `PATCH /materias/:id` | **ADMIN_STAFF** apenas |
| `DELETE /materias/:id` | **ADMIN_STAFF** apenas |
| `POST /materias/:id/tramitar` | ADMIN_STAFF, STAFF |
| `POST /materias/:id/autores` | ADMIN_STAFF, STAFF |
| `DELETE /materias/:id/autores/:aId` | **ADMIN_STAFF** apenas |
| `POST /materias/:id/publicacoes` | ADMIN_STAFF, STAFF |

#### `legislativo/agenda-legislativa`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /agenda` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /agenda` | ADMIN_STAFF, STAFF |
| `PATCH /agenda/:id` | **ADMIN_STAFF** apenas |
| `DELETE /agenda/:id` | **ADMIN_STAFF** apenas |
| `GET /public/agenda` | público (sem guard) |

#### `controle-juridico/normas`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /normas` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /normas` | ADMIN_STAFF, STAFF |
| `PATCH /normas/:id` | **ADMIN_STAFF** apenas |
| `DELETE /normas/:id` | **ADMIN_STAFF** apenas |
| `POST /normas/:id/sancao` | **ADMIN_STAFF** apenas |
| `POST /normas/:id/veto` | **ADMIN_STAFF** apenas |
| `POST /normas/:id/promulgacao` | **ADMIN_STAFF** apenas |
| `POST /normas/:id/publicacao` | ADMIN_STAFF, STAFF |
| `POST /normas/:id/revogar` | **ADMIN_STAFF** apenas |
| `GET /public/normas` | público (sem guard) |

#### `atos-administrativos`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /atos` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /atos` | ADMIN_STAFF, STAFF |
| `PATCH /atos/:id` | **ADMIN_STAFF** apenas |
| `DELETE /atos/:id` | **ADMIN_STAFF** apenas |

#### `legislativo/parlamentares`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /parlamentares` | ADMIN_STAFF, STAFF, PARLIAMENTARIAN |
| `POST /parlamentares` | **ADMIN_STAFF** apenas |
| `PATCH /parlamentares/:id` | **ADMIN_STAFF** apenas |
| `DELETE /parlamentares/:id` | **ADMIN_STAFF** apenas |

#### `identidade/autores-externos`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /autores-externos` | ADMIN_STAFF, STAFF (para usar como autor) |
| `POST /autores-externos` | **ADMIN_STAFF** apenas |
| `PATCH /autores-externos/:id` | **ADMIN_STAFF** apenas |
| `DELETE /autores-externos/:id` | **ADMIN_STAFF** apenas |

#### `identidade/usuarios`

| Endpoint | Roles permitidos |
|----------|-----------------|
| `GET /usuarios` | **ADMIN_STAFF** apenas |
| `POST /usuarios/convidar` | **ADMIN_STAFF** apenas |
| `PATCH /usuarios/:id/desativar` | **ADMIN_STAFF** apenas |

---

## Parlamentar — regra especial de autoria de matéria

Quando `role = PARLIAMENTARIAN` cria uma matéria, o `authorParliamentarianId` é
preenchido automaticamente com o `parliamentarianId` do JWT — não aceito do body:

```typescript
// CreateMateriaUseCase — trecho relevante
async execute(dto: CreateMateriaDto, tenantId: string, user: JwtPayload) {
  let authorParliamentarianId: string | undefined;

  if (user.role === TenantUserRole.PARLIAMENTARIAN) {
    // Parlamentar só pode criar matéria em seu próprio nome
    authorParliamentarianId = user.parliamentarianId;
  } else {
    // Admin Staff e Staff podem especificar o autor no body
    authorParliamentarianId = dto.authorParliamentarianId;
  }
  // ...
}
```

---

## GuestUser — depreciação parcial

Após `AutorExterno` ser criado (Migration M3), o tipo `EXTERNAL_AUTHOR` de `GuestUser`
deve ser depreciado. `GuestUser` continua existindo **apenas** para casos de acesso
temporário ao sistema por pessoas externas (ex: palestrante que precisa ver a pauta de
uma sessão específica).

Não remover o model `GuestUser` — manter para compatibilidade com `Autor.guestUserId`.

---

## Gathering Results

- [ ] `role` presente no JWT sem query extra ao banco
- [ ] Staff consegue encerrar sessão → 200
- [ ] Staff tenta `PATCH /materias/:id` → 403 com mensagem em português
- [ ] Parlamentar tenta `DELETE /materias/:id` → 403
- [ ] Parlamentar cria matéria → `authorParliamentarianId` preenchido automaticamente do JWT
- [ ] Parlamentar tenta votar → 200
- [ ] Staff tenta votar → 403
- [ ] Endpoint público `/public/normas` → 200 sem token
- [ ] Tenant A não acessa recursos do tenant B → 404 (não 403)
