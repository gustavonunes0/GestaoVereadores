# ADR-010 — TenantPartner e TenantPartnerUser substituem GuestUser

**Status:** Aceito | **Data:** 2025-06
**Substitui:** `GuestUser` (removido) e `AutorExterno` (renomeado e reestruturado)
**Análogo a:** ADR-009 (Parliamentarian / ParlamentarianUser)

---

## Contexto

O sistema tinha duas modelagens concorrentes para "autor sem acesso ao sistema":

1. `GuestUser` — pensado como pessoa com possível acesso temporário
2. `AutorExterno` — entidade de dados pura, sem User por trás

O cliente definiu o modelo correto: um **Partner** (parceiro institucional ou
membro da comunidade civil) que assina matérias como autor/coautor, mas **nunca
acessa a plataforma**. A estrutura de dados deve espelhar a de um usuário real
(ter CPF, senha, registro em `User`) por consistência de modelagem e auditoria —
mas o fluxo de autenticação é bloqueado por completo.

## Decisão

**Remover `GuestUser` completamente.**

**Criar duas entidades, seguindo o padrão já estabelecido em
Parliamentarian/ParlamentarianUser:**

```
TenantPartner       ← dados do parceiro (nome, cargo, instituição, tipo)
                       ligado ao Tenant

TenantPartnerUser   ← identidade espelhada, SEM acesso real
                       liga TenantPartner → User
                       cpf opcional, senha aleatória de 15 caracteres
                       NUNCA pode logar, NUNCA recupera senha
```

### Diferença crítica com ParlamentarianUser

| | ParlamentarianUser | TenantPartnerUser |
|---|---|---|
| Acessa a plataforma | ✅ Sim | ❌ Nunca |
| CPF obrigatório | ✅ Sim | ❌ Opcional |
| Senha definida por quem | Próprio usuário | Sistema (aleatória, 15 chars) |
| Fluxo de recuperação de senha | ✅ Sim | ❌ Não existe |
| Login bloqueado no AuthService | Não | **Sim, sempre** |

## Conflito resolvido: `User.cpf` obrigatório

A decisão anterior (`DECISAO-AUTH-cpf-senha.md`) define que toda autenticação
usa CPF + senha, e que `User.cpf` é único. Isso é correto **para usuários que
autenticam** (servidores e parlamentares com acesso).

`TenantPartnerUser` usa a tabela `User`, mas **não autentica**. Portanto:

- `User.cpf` permanece `String? @unique` (nullable, mas único quando preenchido)
- A regra "CPF obrigatório" se aplica à **camada de validação de login**, não ao schema
- `AuthService.login()` rejeita login se o `User` correspondente só tiver
  `TenantPartnerUser` vinculado (nunca `TenantUser` nem `ParlamentarianUser`)

```prisma
model User {
  id           String  @id @default(uuid())
  firstName    String
  lastName     String
  cpf          String? @unique   // nullable — TenantPartnerUser pode não ter CPF
  email        String  @unique
  passwordHash String
  // ...

  tenantUsers          TenantUser[]
  parliamentarianUser  ParlamentarianUser?
  tenantPartnerUser    TenantPartnerUser?
}
```

**Validação de negócio (fora do schema):**
- Se o `User` for criado via fluxo de servidor (`TenantUser`) ou parlamentar
  (`ParlamentarianUser`) → `cpf` é obrigatório na camada de DTO/use case
- Se o `User` for criado via fluxo de partner (`TenantPartnerUser`) → `cpf` é opcional

## Geração de senha para TenantPartnerUser

```ts
// domain/services/partner-credentials.service.ts
import { randomBytes } from 'crypto';

export class PartnerCredentialsService {
  generateRandomPassword(): string {
    // 15 caracteres aleatórios — nunca exposto, nunca usado para login real
    return randomBytes(12).toString('base64').slice(0, 15);
  }
}
```

A senha gerada é apenas para satisfazer a constraint `passwordHash NOT NULL` em
`User`. Ela nunca é comunicada ao parceiro, nunca aparece em nenhuma resposta de
API, e o login com ela **deve falhar sempre** porque `AuthService` bloqueia
qualquer tentativa de autenticação de um `User` que só tem `TenantPartnerUser`.

## Bloqueio de login — regra de implementação

```ts
// auth.service.ts — login()
async login(cpf: string, password: string) {
  const user = await this.userRepo.findByCpf(cpf);
  if (!user) throw new UnauthorizedException('CPF ou senha incorretos');

  // Verificar se é EXCLUSIVAMENTE um TenantPartnerUser
  const isPartnerOnly = await this.isPartnerOnlyUser(user.id);
  if (isPartnerOnly) {
    // Nunca revelar que o CPF existe — mesma mensagem genérica
    throw new UnauthorizedException('CPF ou senha incorretos');
  }

  // ... fluxo normal (ParlamentarianUser ou TenantUser)
}

private async isPartnerOnlyUser(userId: string): Promise<boolean> {
  const partnerUser = await this.prisma.tenantPartnerUser.findFirst({
    where: { userId, isRemoved: false },
  });
  if (!partnerUser) return false;

  const hasOtherAccess = await this.prisma.tenantUser.findFirst({
    where: { userId, isRemoved: false },
  }) || await this.prisma.parliamentarianUser.findFirst({
    where: { userId, isRemoved: false },
  });

  return !hasOtherAccess;
}
```

## Sem recuperação de senha

O endpoint `POST /auth/forgot-password` (se existir) deve verificar a mesma
condição `isPartnerOnlyUser()` e rejeitar a solicitação com a mesma mensagem
genérica usada para CPF não encontrado — nunca revelar que o registro existe
como partner.

## Consequências

**Positivas:**
- Estrutura de dados consistente entre todos os tipos de "pessoa" no sistema
- Auditoria de quem criou/gerencia cada Partner via `User` padrão
- Caminho claro para o futuro: se um dia o partner precisar de acesso,
  basta resetar a senha e remover o bloqueio — sem migração de schema

**Negativas:**
- `User.cpf` precisa ser nullable, exigindo validação na camada de aplicação
  em vez de constraint de banco
- Mais uma verificação no fluxo de login (`isPartnerOnlyUser`)
- Renomeação em cascata: toda referência a `AutorExterno` e `GuestUser` muda

## Renomeação em cascata — impacto

| Antes | Depois |
|-------|--------|
| `GuestUser` | Removido |
| `AutorExterno` | `TenantPartner` |
| `Autor.autorExternoId` | `Autor.tenantPartnerId` |
| `Autor.guestUserId` | Removido |
| `autoresExternosApi` (frontend) | `tenantPartnersApi` |
| `/identidade/autores-externos` | `/identidade/tenant-partners` |
| `AutorExternoCreateDialog` | `TenantPartnerCreateDialog` |
