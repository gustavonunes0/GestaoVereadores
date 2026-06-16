# TASK-006 — Identidade: TenantUserRole, Guards e Roles por Endpoint

**Spec:** `backend/docs/specs/identidade/SPEC-006-identidade-roles.md`
**Depende de:** TASK-001 (todas as migrations M1–M7 aplicadas)
**Pode rodar em paralelo com:** TASK-001b, TASK-002, TASK-003, TASK-004, TASK-005
**Módulo:** `src/auth/` + ajustes em todos os controllers

> Esta task deve ser executada ANTES de implementar qualquer controller,
> pois define os guards que todos os outros módulos vão usar.
> Se os controllers já existirem, aplicar os decorators ao final (Fase 4).

---

## Fase 1 — Migration M8: enum TenantUserRole

### T-01 · Adicionar enum e campo `role` em TenantUser

- [ ] Abrir `backend/prisma/schema.prisma`
- [ ] Adicionar o novo enum **antes** de `model TenantUser`:

```prisma
enum TenantUserRole {
  ADMIN_STAFF
  STAFF
  PARLIAMENTARIAN
}
```

- [ ] Em `model TenantUser`, adicionar campo `role` e deprecar booleans:

```prisma
// ADICIONAR:
role TenantUserRole @default(STAFF)

// MANTER POR ORA (tornar nullable para não quebrar):
// Os três campos abaixo continuam existindo durante a transição
// Serão removidos em migration futura após dados migrados
```

- [ ] Adicionar index no model:

```prisma
@@index([tenantId, role])
```

- [ ] Rodar: `npx prisma migrate dev --name add_tenant_user_role`

### T-02 · Seed de migração dos booleans para o enum

- [ ] Criar script `backend/prisma/migrate-roles.sql`:

```sql
-- Executar uma única vez após migration M8
-- Ordem importa: admin primeiro, depois parliamentarian, depois staff

UPDATE tenant_users
SET role = 'ADMIN_STAFF'
WHERE is_tenant_admin = true AND is_removed = false;

UPDATE tenant_users
SET role = 'PARLIAMENTARIAN'
WHERE is_parliamentarian = true
  AND is_tenant_admin = false
  AND is_removed = false;

UPDATE tenant_users
SET role = 'STAFF'
WHERE is_tenant_staff = true
  AND is_tenant_admin = false
  AND is_parliamentarian = false
  AND is_removed = false;

-- Verificar: não deve retornar nenhuma linha
SELECT id, user_id, tenant_id
FROM tenant_users
WHERE role IS NULL AND is_removed = false;
```

- [ ] Executar: `psql $DATABASE_URL < backend/prisma/migrate-roles.sql`
- [ ] Verificar que zero registros ficaram sem role
- [ ] Rodar `npx prisma generate` e `npx tsc --noEmit`

---

## Fase 2 — JWT com role

### T-03 · Atualizar JwtPayload

- [ ] Abrir (ou criar) `src/auth/dto/jwt-payload.dto.ts`:

```typescript
import { TenantUserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;              // userId
  tenantId: string;
  tenantUserId: string;
  role: TenantUserRole;     // NOVO
  parliamentarianId?: string; // preenchido apenas se PARLIAMENTARIAN
  iat: number;
  exp: number;
}
```

### T-04 · Atualizar AuthService.login() para incluir role no token

- [ ] Localizar onde o JWT é gerado em `src/auth/auth.service.ts`
- [ ] Incluir `role` e `parliamentarianId` no payload:

```typescript
// Dentro do método que gera o token (login ou similar)
const tenantUser = await this.prisma.tenantUser.findFirst({
  where: { userId: user.id, tenantId, isRemoved: false },
  include: { parliamentarian: { select: { id: true } } },
});

const payload: JwtPayload = {
  sub: user.id,
  tenantId,
  tenantUserId: tenantUser.id,
  role: tenantUser.role,
  parliamentarianId: tenantUser.parliamentarian?.id,
};

return { access_token: this.jwtService.sign(payload) };
```

### T-05 · Atualizar @CurrentUser() decorator para expor role

- [ ] Verificar `src/auth/decorators/current-user.decorator.ts`
- [ ] Garantir que retorna o `user` com campo `role` e `parliamentarianId`:

```typescript
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
```

---

## Fase 3 — Guards

### T-06 · Criar `roles.decorator.ts`

- [ ] Criar `src/auth/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TenantUserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
```

### T-07 · Criar `roles.guard.ts`

- [ ] Criar `src/auth/guards/roles.guard.ts`:

```typescript
import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../dto/jwt-payload.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<TenantUserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user: JwtPayload = context.switchToHttp().getRequest().user;

    if (!user?.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta ação',
      );
    }

    return true;
  }
}
```

### T-08 · Registrar RolesGuard globalmente no AppModule

- [ ] Abrir `src/app.module.ts`
- [ ] Adicionar `RolesGuard` como provider global **apenas como provider**, não como APP_GUARD
  (manter o padrão atual de aplicar guards por controller para ser explícito):

```typescript
// NÃO registrar como APP_GUARD — aplicar por controller com @UseGuards()
// Apenas exportar do AuthModule para injeção nos módulos filhos:
providers: [RolesGuard],
exports: [RolesGuard],
```

### T-09 · Criar helper de guards reutilizável

- [ ] Criar `src/auth/guards/index.ts` para facilitar importação:

```typescript
export { JwtAuthGuard } from './jwt-auth.guard';
export { TenantGuard } from './tenant.guard';
export { RolesGuard } from './roles.guard';
```

- [ ] Criar constantes de combinação de guards frequentes:

```typescript
// src/auth/guards/guard-combos.ts
import { TenantUserRole } from '@prisma/client';

// Atalhos para uso nos controllers:
export const STAFF_AND_ABOVE = [
  TenantUserRole.ADMIN_STAFF,
  TenantUserRole.STAFF,
];

export const ADMIN_ONLY = [TenantUserRole.ADMIN_STAFF];

export const ALL_AUTHENTICATED = [
  TenantUserRole.ADMIN_STAFF,
  TenantUserRole.STAFF,
  TenantUserRole.PARLIAMENTARIAN,
];

export const PARLIAMENTARIAN_ONLY = [TenantUserRole.PARLIAMENTARIAN];
```

---

## Fase 4 — Aplicar Roles nos Controllers

> Aplicar em cada controller existente/criado conforme a tabela da SPEC-006.
> Padrão de import:

```typescript
import { Roles } from '@/auth/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { STAFF_AND_ABOVE, ADMIN_ONLY, ALL_AUTHENTICATED, PARLIAMENTARIAN_ONLY }
  from '@/auth/guards/guard-combos';
import { TenantUserRole } from '@prisma/client';
```

### T-10 · `sessoes-plenarias.controller.ts`

- [ ] `GET /` e `GET /:id` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...ADMIN_ONLY)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/abrir` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/suspender` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/encerrar` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/cancelar` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/pauta` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `PATCH /:id/pauta/publicar` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/presencas` → `@Roles(...STAFF_AND_ABOVE)`

### T-11 · `votacoes.controller.ts`

- [ ] `GET /` e `GET /:id` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` (abrir) → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/votos` → `@Roles(...PARLIAMENTARIAN_ONLY)`
- [ ] `POST /:id/encerrar` → `@Roles(...STAFF_AND_ABOVE)`

### T-12 · `materias.controller.ts`

- [ ] `GET /` e `GET /:id` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/tramitar` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/autores` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `DELETE /:id/autores/:aId` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/publicacoes` → `@Roles(...STAFF_AND_ABOVE)`

### T-13 · `agenda-legislativa.controller.ts`

- [ ] `GET /` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `GET /public/agenda` → **sem guard** (público)

### T-14 · `normas.controller.ts`

- [ ] `GET /` e `GET /:id` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/sancao` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/veto` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/promulgacao` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /:id/publicacao` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `POST /:id/revogar` → `@Roles(...ADMIN_ONLY)`
- [ ] `GET /public/normas` → **sem guard** (público)

### T-15 · `atos.controller.ts`

- [ ] `GET /` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...STAFF_AND_ABOVE)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`

### T-16 · `parlamentares.controller.ts`

- [ ] `GET /` → `@Roles(...ALL_AUTHENTICATED)`
- [ ] `POST /` → `@Roles(...ADMIN_ONLY)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`

### T-17 · `autores-externos.controller.ts`

- [ ] `GET /` → `@Roles(...STAFF_AND_ABOVE)` (staff precisa para selecionar autores)
- [ ] `POST /` → `@Roles(...ADMIN_ONLY)`
- [ ] `PATCH /:id` → `@Roles(...ADMIN_ONLY)`
- [ ] `DELETE /:id` → `@Roles(...ADMIN_ONLY)`

### T-18 · `usuarios.controller.ts`

- [ ] `GET /` → `@Roles(...ADMIN_ONLY)`
- [ ] `POST /convidar` → `@Roles(...ADMIN_ONLY)`
- [ ] `PATCH /:id/desativar` → `@Roles(...ADMIN_ONLY)`

---

## Fase 5 — Lógica especial do Parlamentar ao criar matéria

### T-19 · Ajustar CreateMateriaUseCase para autoria automática

- [ ] Localizar `create-materia.use-case.ts`
- [ ] Adicionar lógica de autoria automática:

```typescript
async execute(dto: CreateMateriaDto, tenantId: string, user: JwtPayload) {
  let authorParliamentarianId: string | undefined;

  if (user.role === TenantUserRole.PARLIAMENTARIAN) {
    if (!user.parliamentarianId) {
      throw new UnprocessableEntityException(
        'Usuário parlamentar sem parlamentarianId no token — contate o administrador'
      );
    }
    // Parlamentar só pode criar matéria em seu próprio nome
    authorParliamentarianId = user.parliamentarianId;
  } else {
    // Admin Staff e Staff podem especificar o autor via body
    authorParliamentarianId = dto.authorParliamentarianId;
  }

  // ... resto da criação
}
```

---

## Fase 6 — Testes

### T-20 · Testes do RolesGuard

- [ ] `src/auth/guards/roles.guard.spec.ts`:

```typescript
describe('RolesGuard', () => {
  it('permite acesso quando não há @Roles() no endpoint', () => {
    // reflector retorna undefined → canActivate = true
  });

  it('permite ADMIN_STAFF em endpoint com @Roles(ADMIN_STAFF, STAFF)', () => {});

  it('permite STAFF em endpoint com @Roles(ADMIN_STAFF, STAFF)', () => {});

  it('rejeita PARLIAMENTARIAN em endpoint com @Roles(ADMIN_STAFF)', () => {
    // deve lançar ForbiddenException com mensagem em português
  });

  it('rejeita STAFF em endpoint com @Roles(PARLIAMENTARIAN_ONLY)', () => {});

  it('permite PARLIAMENTARIAN em POST /votacoes/:id/votos', () => {});
});
```

### T-21 · Testes de integração por perfil

- [ ] Staff tenta `PATCH /materias/:id` → 403
- [ ] Staff tenta `POST /materias` → 201
- [ ] Staff tenta `POST /sessoes-plenarias/:id/encerrar` → 200
- [ ] Parlamentar tenta `DELETE /materias/:id` → 403
- [ ] Parlamentar cria matéria → `authorParliamentarianId` = `user.parliamentarianId` do token
- [ ] Parlamentar tenta votar → 200
- [ ] Staff tenta votar → 403

---

## Checklist final

- [ ] `role` presente no JWT — verificar com `jwt.io`
- [ ] `npx tsc --noEmit` — zero erros após aplicar todos os decorators
- [ ] Zero registros sem `role` no banco após T-02
- [ ] ForbiddenException retorna mensagem em português: "Você não tem permissão..."
- [ ] Resposta para tenant errado é 404 (não 403) — isolamento de tenant
- [ ] Endpoints públicos (`/public/normas`, `/public/agenda`) retornam 200 sem token
- [ ] `npx jest --testPathPattern=auth` passando

---

## Notas para o Claude Code

- `RolesGuard` lê o `role` do JWT — não faz query ao banco
- A sequência correta de guards é sempre: `JwtAuthGuard` → `TenantGuard` → `RolesGuard`
- `JwtAuthGuard` autentica e injeta `user` no request
- `TenantGuard` extrai e valida `tenantId` do `user`
- `RolesGuard` verifica `user.role` contra os roles do `@Roles()` decorator
- Nunca usar `isTenantAdmin` / `isTenantStaff` / `isParliamentarian` em código novo
- O isolamento por tenant (404 para recurso de outro tenant) é feito no repositório
  via `where: { id, tenantId, isRemoved: false }` — não no guard
