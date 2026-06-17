# ADR-009 — Separação de Parliamentarian e ParlamentarianUser

**Status:** Aceito | **Data:** 2025-06
**Substitui:** Parte do ADR-004 (TenantUserRole com PARLIAMENTARIAN)

---

## Contexto

O schema anterior vinculava `Parliamentarian` a `TenantUser` via `tenantUserId String @unique`,
e `TenantUserRole` tinha o valor `PARLIAMENTARIAN`.

Isso está errado por três razões:

1. **Um parlamentar pode não ter acesso ao sistema.** Câmaras com mandatos históricos,
   ex-vereadores, vereadores sem demanda de acesso digital — todos são `Parliamentarian`
   válidos para fins de registro histórico, mas não precisam de login.

2. **Parlamentar não é funcionário da câmara.** `TenantUser` representa servidores
   (Admin Staff, Staff) que trabalham administrativamente na câmara. Misturar parlamentares
   nessa tabela cria confusão conceitual e complica guards.

3. **A lógica de acesso de parlamentar é diferente da de servidor.**
   Um servidor tem `role` fixo. Um parlamentar tem acesso ligado ao seu mandato ativo
   — se o mandato encerra, o acesso pode ser revogado independentemente.

## Decisão

**Separar completamente as entidades de identidade:**

```
Parliamentarian     ← entidade legislativa, ligada ao Tenant
                       existe independentemente de ter acesso ao sistema

ParlamentarianUser  ← entidade de acesso, criada apenas quando
                       o parlamentar recebe login no sistema
                       liga Parliamentarian → User

TenantUser          ← servidores da câmara (Admin Staff, Staff)
                       sem relação com Parliamentarian
```

**`TenantUserRole` passa a ter apenas dois valores:**
```prisma
enum TenantUserRole {
  ADMIN_STAFF
  STAFF
}
```

**O JWT distingue o tipo de sessão:**
```ts
// Sessão de servidor
{ sessionType: 'staff', tenantUserId, role: 'ADMIN_STAFF' | 'STAFF' }

// Sessão de parlamentar
{ sessionType: 'parliamentarian', parliamentarianUserId, parliamentarianId }
```

## Consequências

**Positivas:**
- Parliamentarian pode existir sem usuário — correto para histórico legislativo
- Guards de servidor e parlamentar são completamente independentes
- Mandato ativo pode ser vinculado ao status de acesso do ParlamentarianUser
- Simplifica `TenantUser` — só servidores

**Negativas:**
- Migration complexa: remover `tenantUserId` de `Parliamentarian`,
  migrar TenantUsers com `role = PARLIAMENTARIAN` para `ParlamentarianUser`
- Auth precisa distinguir dois fluxos de login (mesmo endpoint, JWTs diferentes)
- Guards precisam checar `sessionType` antes de verificar permissões

## Regra de negócio derivada

Um `ParlamentarianUser` só deve existir enquanto o parlamentar tem mandato ativo.
Ao encerrar o mandato, o `ParlamentarianUser.status` deve ser `INACTIVE` automaticamente.
(Implementar via job ou hook no domínio — não obrigatório na primeira versão.)
