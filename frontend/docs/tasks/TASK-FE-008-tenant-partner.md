# TASK-FE-008 — TenantPartner no Frontend (renomeação de AutorExterno)

**Spec:** `backend/docs/specs/identidade/SPEC-008-tenant-partner.md`
**Depende de:** TASK-008 (backend) concluída
**Substitui:** Parte da TASK-FE-005 (AutoresPage usava GuestUser/AutorExterno)

---

## Fase 1 — Tipos

### T-01 · Renomear em `api/tenant-partners.api.ts` (era `autores-externos.api.ts`)

```ts
// Renomear arquivo: autores-externos.api.ts → tenant-partners.api.ts

export interface TenantPartner {
  id: string;
  tipoAutor: { id: string; nome: string; idNegocio?: number };
  nome: string;
  cargo?: string;
  instituicao?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  registro?: string;
  partido?: string;
  uf?: string;
}

export interface CreateTenantPartnerDto {
  tipoAutorId: string;
  nome: string;
  cargo?: string;
  instituicao?: string;
  cpf?: string;       // opcional — diferente de criação de servidor/parlamentar
  email?: string;
  telefone?: string;
  registro?: string;
  partido?: string;
  uf?: string;
}

export const tenantPartnersApi = {
  list: (filtros?: { tipoAutorId?: string; nome?: string }) =>
    apiList<TenantPartner>(API_PATHS.tenantPartners, filtros),

  getById: (id: string) =>
    api<TenantPartner>(`${API_PATHS.tenantPartners}/${id}`),

  create: (dto: CreateTenantPartnerDto) =>
    api<TenantPartner>(API_PATHS.tenantPartners, {
      method: 'POST', body: JSON.stringify(dto),
    }),

  update: (id: string, dto: Partial<CreateTenantPartnerDto>) =>
    api<TenantPartner>(`${API_PATHS.tenantPartners}/${id}`, {
      method: 'PATCH', body: JSON.stringify(dto),
    }),

  remove: (id: string) =>
    api<void>(`${API_PATHS.tenantPartners}/${id}`, { method: 'DELETE' }),
};
```

- [ ] Deletar `api/autores-externos.api.ts` (se existir)
- [ ] Criar `api/tenant-partners.api.ts` com conteúdo acima

### T-02 · Atualizar `api/paths.ts`

```ts
// Substituir:
// autoresExternos: '/identidade/autores-externos',
// Por:
tenantPartners: '/identidade/tenant-partners',
```

---

## Fase 2 — Componentes (renomear AutorExterno → TenantPartner)

### T-03 · Renomear dialogs

- [ ] `AutorExternoCreateDialog.tsx` → `TenantPartnerCreateDialog.tsx`
- [ ] `AutorExternoVerDialog.tsx` → `TenantPartnerVerDialog.tsx`
- [ ] `AutorExternoEditDialog.tsx` → `TenantPartnerEditDialog.tsx`

### T-04 · Manter lógica de categorias (sem alteração funcional)

A lógica de categorias A/B/C/D definida na TASK-FE-005 permanece idêntica —
apenas o nome da entidade muda de `AutorExterno` para `TenantPartner`.

```tsx
// TenantPartnerCreateDialog.tsx — mesma lógica, tipos renomeados
const CATEGORIA_A_IDS = [2, 3, 4, 5, 6, 7, 10, 17, 20, 25, 26];
const CATEGORIA_C_IDS = [13, 15];
const CATEGORIA_D_IDS = [23, 24];

function getCategoria(idNegocio: number): 'A' | 'B' | 'C' | 'D' {
  if (CATEGORIA_A_IDS.includes(idNegocio)) return 'A';
  if (CATEGORIA_C_IDS.includes(idNegocio)) return 'C';
  if (CATEGORIA_D_IDS.includes(idNegocio)) return 'D';
  return 'B';
}
```

- [ ] Campo CPF no formulário: manter como opcional (já era assim)
- [ ] **Nenhum campo de senha no formulário** — é gerada automaticamente pelo backend,
      o frontend nunca solicita nem exibe

---

## Fase 3 — AutoresPage

### T-05 · Atualizar `AutoresPage.tsx`

- [ ] Trocar import de `autoresExternosApi` → `tenantPartnersApi`
- [ ] Trocar tipo `AutorExterno` → `TenantPartner`
- [ ] Filtros e DataTable permanecem com a mesma estrutura da TASK-FE-005

### T-06 · Atualizar referências em `MateriaCreateDialog`

- [ ] Campo Autor/Coautor que antes buscava `AutorExterno` agora busca `TenantPartner`
- [ ] `autorResolverService` do frontend (se existir helper local) usa `tenantPartner.nome`

---

## Fase 4 — Limpeza

### T-07 · Remover referências legadas

```bash
grep -r "AutorExterno\|autorExterno\|GuestUser\|guestUser\|autores-externos" src/
```

- [ ] Corrigir todos os resultados encontrados
- [ ] Deletar `api/guest-users.api.ts` se ainda existir
- [ ] Deletar tipos `GuestUser*` de `types/legislative.ts`

---

## Checklist final

- [ ] `npm run build` — zero erros TypeScript
- [ ] `grep -r "AutorExterno\|GuestUser" src/` → zero resultados
- [ ] Formulário de criação de Partner NÃO tem campo de senha
- [ ] Formulário de criação de Partner tem CPF como campo opcional
- [ ] `/camara/autores` lista via `tenantPartnersApi.list()`
- [ ] Categorias A/B/C/D do formulário continuam funcionando como antes
