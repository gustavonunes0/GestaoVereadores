# SPEC-008 — TenantPartner e TenantPartnerUser

**Status:** Aprovada | **Versão:** 1.0
**ADR de referência:** `docs/decisions/ADR-010-tenant-partner.md`
**Substitui:** `GuestUser` (removido) e `AutorExterno` (proposto em SPEC-001, nunca implementado)
**Depende de:** TASK-007 (Parliamentarian/ParlamentarianUser) concluída — mesmo padrão arquitetural

---

## Background

Autor Externo é qualquer pessoa ou instituição que assina matérias (autor,
coautor, relator) sem fazer parte do corpo de servidores ou parlamentares da
câmara. Exemplos: Prefeito, Procurador, OAB, sindicatos, membros da comunidade
civil.

A plataforma trata esse papel como um **Partner** — por analogia ao padrão já
estabelecido com `Parliamentarian`/`ParlamentarianUser`, mas com uma diferença
estrutural definitiva: **o Partner nunca acessa a plataforma.**

---

## Schema Prisma — Migration M10

### Remover `GuestUser`

```prisma
// REMOVER completamente o model GuestUser e o enum GuestUserType/GuestUserStatus
// Antes de remover, verificar se há dados a migrar (ver seção Migração de Dados)
```

### Alterar `User.cpf` para nullable

```prisma
model User {
  id           String  @id @default(uuid())
  firstName    String
  lastName     String
  cpf          String? @unique   // ALTERADO: era String @unique, agora nullable
  email        String  @unique
  passwordHash String
  profilePicture String?
  createdAt    DateTime @default(now())
  createdBy    String?
  modifiedAt   DateTime @updatedAt
  modifiedBy   String?
  isRemoved    Boolean  @default(false)

  tenantUsers         TenantUser[]
  parliamentarianUser ParlamentarianUser?
  tenantPartnerUser   TenantPartnerUser?   // NOVO
}
```

> ⚠️ **Validação de obrigatoriedade de CPF é responsabilidade da camada de
> aplicação**, não do schema. DTOs de criação de `TenantUser` e
> `ParlamentarianUser` exigem `cpf` via `@IsNotEmpty()`. DTOs de criação de
> `TenantPartnerUser` tornam `cpf` opcional.

### Novo model `TenantPartner`

```prisma
model TenantPartner {
  id          String    @id @default(uuid())
  tenantId    String
  tipoAutorId String

  nome        String     // nome da pessoa OU nome da entidade
  cargo       String?    // ex: "Secretário de Educação"
  instituicao String?    // ex: "Prefeitura Municipal"
  cpf         String?    // opcional — pode ser pessoa física ou jurídica
  email       String?
  telefone    String?
  registro    String?    // OAB, CRM etc.
  partido     String?    // para representantes políticos externos
  uf          String?    // para Deputado Federal

  isRemoved Boolean   @default(false)
  removedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  tipoAutor         TipoAutor          @relation(fields: [tipoAutorId], references: [id])
  tenantPartnerUser TenantPartnerUser? // opcional — ver seção abaixo

  autores Autor[]   // matérias onde figura como autor/coautor/relator

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("tenant_partners")
}
```

### Novo model `TenantPartnerUser`

```prisma
model TenantPartnerUser {
  id              String @id @default(uuid())
  tenantId        String
  tenantPartnerId String @unique
  userId          String @unique

  // Sem campo "status" de ACTIVE/INACTIVE — não há sessão a gerenciar
  // Sem lastAccessAt — nunca acessa

  isRemoved Boolean   @default(false)
  removedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  tenant        Tenant        @relation(fields: [tenantId], references: [id])
  tenantPartner TenantPartner @relation(fields: [tenantPartnerId], references: [id])
  user          User          @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("tenant_partner_users")
}
```

### Alterar `Autor` — renomear FK

```prisma
model Autor {
  id                String  @id @default(uuid())
  tenantId          String
  tipoAutorId       String
  parlamentarId     String?           // legado PT
  parliamentarianId String?           // novo EN
  tenantPartnerId   String?           // RENOMEADO de autorExternoId
  // guestUserId String?              // REMOVIDO

  tenant          Tenant           @relation(fields: [tenantId], references: [id])
  tipoAutor       TipoAutor        @relation(fields: [tipoAutorId], references: [id])
  parlamentar     Parlamentar?     @relation(fields: [parlamentarId], references: [id])
  parliamentarian Parliamentarian? @relation(fields: [parliamentarianId], references: [id])
  tenantPartner   TenantPartner?   @relation(fields: [tenantPartnerId], references: [id])
  materias        Materia[]

  @@map("autores")
}
```

### Relações inversas em `Tenant`

```prisma
// Remover:
// guestUsers GuestUser[]

// Adicionar:
tenantPartners     TenantPartner[]
tenantPartnerUsers TenantPartnerUser[]
```

---

## Migração de dados — GuestUser → TenantPartner

```sql
-- Passo 1: Para cada GuestUser que é referenciado em Autor (papel de autor externo),
-- criar TenantPartner correspondente
INSERT INTO tenant_partners (
  id, tenant_id, tipo_autor_id, nome, cpf, email, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  gu.tenant_id,
  -- mapear para um TipoAutor padrão se não houver granularidade --
  (SELECT id FROM tipos_autor WHERE tenant_id = gu.tenant_id AND nome = 'Sociedade' LIMIT 1),
  gu.full_name,
  gu.cpf,
  gu.email,
  NOW(),
  NOW()
FROM guest_users gu
WHERE gu.is_removed = false
  AND EXISTS (SELECT 1 FROM autores a WHERE a.guest_user_id = gu.id);

-- Passo 2: Atualizar Autor.tenant_partner_id apontando para os TenantPartner criados
-- (requer join por correlação nome+tenant — revisar manualmente se houver duplicatas)
UPDATE autores a
SET tenant_partner_id = tp.id
FROM guest_users gu
JOIN tenant_partners tp ON tp.nome = gu.full_name AND tp.tenant_id = gu.tenant_id
WHERE a.guest_user_id = gu.id;

-- Passo 3: Verificar que todos os Autor com guest_user_id agora têm tenant_partner_id
SELECT COUNT(*) FROM autores WHERE guest_user_id IS NOT NULL AND tenant_partner_id IS NULL;
-- Deve retornar 0 antes de continuar

-- Passo 4: Remover coluna guest_user_id de Autor (migration separada)
-- Passo 5: Remover tabela guest_users (migration separada)
```

⚠️ **Antes de rodar em produção:** auditar manualmente os `GuestUser` que não
têm `Autor` vinculado — decidir se descartam ou se precisam de outro destino
(ex: pessoa que só teve acesso temporário sem nunca assinar matéria).

---

## Geração de credenciais do Partner

### `PartnerCredentialsService`

```ts
// src/identidade/domain/services/partner-credentials.service.ts
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

export class PartnerCredentialsService {
  generateRandomPassword(): string {
    return randomBytes(12).toString('base64').slice(0, 15);
  }

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
```

### `CreateTenantPartnerUseCase` — cria Partner + User + TenantPartnerUser

```ts
// application/use-cases/create-tenant-partner.use-case.ts
@Injectable()
export class CreateTenantPartnerUseCase {
  constructor(
    private readonly tenantPartnerRepo: TenantPartnerRepository,
    private readonly userRepo: UserRepository,
    private readonly credentialsService: PartnerCredentialsService,
  ) {}

  async execute(dto: CreateTenantPartnerDto, tenantId: string) {
    // 1. Criar User "fantasma" — sem acesso real
    const randomPassword = this.credentialsService.generateRandomPassword();
    const passwordHash = await this.credentialsService.hashPassword(randomPassword);

    const user = await this.userRepo.create({
      firstName: dto.nome.split(' ')[0],
      lastName: dto.nome.split(' ').slice(1).join(' ') || '-',
      cpf: dto.cpf ?? null,        // opcional
      email: dto.email ?? `partner-${randomUUID()}@no-access.local`, // placeholder se ausente
      passwordHash,
    });

    // 2. Criar TenantPartner (dados do autor externo)
    const partner = await this.tenantPartnerRepo.create({
      tenantId,
      tipoAutorId: dto.tipoAutorId,
      nome: dto.nome,
      cargo: dto.cargo,
      instituicao: dto.instituicao,
      cpf: dto.cpf,
      email: dto.email,
      telefone: dto.telefone,
      registro: dto.registro,
      partido: dto.partido,
      uf: dto.uf,
    });

    // 3. Criar TenantPartnerUser (vínculo de identidade, sem acesso)
    await this.tenantPartnerUserRepo.create({
      tenantId,
      tenantPartnerId: partner.id,
      userId: user.id,
    });

    return partner;
  }
}
```

**Nota:** o `email` placeholder (`partner-{uuid}@no-access.local`) é necessário
porque `User.email` é `@unique` e `NOT NULL` no schema atual. Se o Partner não
tiver email real, gera-se um inválido por design — nunca usado para envio.

---

## Bloqueio de login — `AuthService`

```ts
// auth.service.ts
async login(cpf: string, password: string): Promise<LoginResponse> {
  const user = await this.userRepo.findByCpf(cpf);
  if (!user) {
    throw new UnauthorizedException('CPF ou senha incorretos');
  }

  // Bloqueio explícito: usuário que é EXCLUSIVAMENTE partner nunca loga
  const partnerOnly = await this.isPartnerOnlyUser(user.id);
  if (partnerOnly) {
    throw new UnauthorizedException('CPF ou senha incorretos');
  }

  // ... fluxo normal de verificação de senha e geração de JWT
}

private async isPartnerOnlyUser(userId: string): Promise<boolean> {
  const isPartner = await this.prisma.tenantPartnerUser.findFirst({
    where: { userId, isRemoved: false },
  });
  if (!isPartner) return false;

  const hasRealAccess =
    (await this.prisma.tenantUser.findFirst({ where: { userId, isRemoved: false } })) ||
    (await this.prisma.parliamentarianUser.findFirst({ where: { userId, isRemoved: false } }));

  return !hasRealAccess;
}
```

### Sem recuperação de senha

```ts
// forgot-password.use-case.ts (se existir)
async execute(cpf: string) {
  const user = await this.userRepo.findByCpf(cpf);
  if (!user || await this.isPartnerOnlyUser(user.id)) {
    // mesma resposta genérica — nunca revela existência do registro
    return { message: 'Se o CPF existir, enviaremos instruções por e-mail.' };
  }
  // ... fluxo real de recuperação
}
```

---

## Endpoints

⚠️ Regra de permissão específica de TenantPartner — diferente do padrão geral
do sistema. Em todos os outros módulos (Parlamentares, Matérias, Normas, Atos),
STAFF pode criar mas apenas ADMIN_STAFF edita ou deleta. Para TenantPartner
essa restrição não se aplica: por ser uma entidade de baixo risco (apenas
um registro de apoio para autoria de matéria, sem acesso à plataforma),
STAFF tem paridade completa com ADMIN_STAFF.

| Método | Rota | Roles |
|--------|------|-------|
| GET | `/identidade/tenant-partners` | STAFF_AND_ABOVE |
| GET | `/identidade/tenant-partners/:id` | STAFF_AND_ABOVE |
| POST | `/identidade/tenant-partners` | STAFF_AND_ABOVE (ADMIN_STAFF e STAFF) |
| PATCH | `/identidade/tenant-partners/:id` | STAFF_AND_ABOVE (ADMIN_STAFF e STAFF) |
| DELETE | `/identidade/tenant-partners/:id` | STAFF_AND_ABOVE (ADMIN_STAFF e STAFF) |

> Não existe endpoint de "login" ou "ativar acesso" para TenantPartnerUser —
> diferente de ParlamentarianUser, que tem grant-access/revoke-access.
> O Partner nunca tem fluxo de acesso a conceder.
>
> Esta é a única entidade do sistema onde STAFF tem permissão de
> edição e exclusão equivalente a ADMIN_STAFF. Não usar este endpoint
> como referência de padrão para outros módulos — é uma exceção documentada.

---

## View Model — campos expostos

```ts
// Nunca expor: userId, passwordHash (óbvio), tenantPartnerUserId
{
  id: string;
  nome: string;
  tipoAutor: { id: string; nome: string };
  cargo?: string;
  instituicao?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  registro?: string;
  partido?: string;
  uf?: string;
}
```

---

## Gathering Results

- [ ] `GuestUser` removido do schema e do banco
- [ ] `User.cpf` é `String? @unique` (nullable)
- [ ] Criar `TenantPartner` sem CPF → funciona
- [ ] Criar `TenantPartner` gera `User` com senha aleatória de 15 caracteres
- [ ] Login com CPF de um `TenantPartnerUser` → 401 com mensagem genérica
- [ ] `POST /auth/forgot-password` para CPF de partner → resposta genérica, não revela
- [ ] `Autor.tenantPartnerId` substitui `Autor.autorExternoId` e `Autor.guestUserId`
- [ ] Dados de `GuestUser` migrados para `TenantPartner` sem perda
- [ ] `npx tsc --noEmit` sem erros após a migration
