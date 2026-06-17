# TASK-FE-000 — Login Único, AuthContext e Roteamento por Role

**Spec:** `frontend/docs/specs/SPEC-FE-AUTH-login-roles.md`
**Leia também:** `frontend/docs/CLAUDE-FRONTEND.md`
**Bloqueia:** Todas as outras tasks FE — executar PRIMEIRA

> Esta task reescreve a fundação de autenticação e roteamento.
> Nada do sistema funciona corretamente até ela estar concluída.

---

## Fase 1 — Tipos (`types/auth.ts`)

### T-01 · Reescrever `types/auth.ts`

- [x] **Remover** completamente: `SiglRole`, `CamaraRole`, `AuthType`
- [x] **Remover** qualquer referência a `authType`
- [x] **Criar** o tipo simplificado:

```ts
export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

export interface AuthUser {
  id: string;
  tenantUserId: string;
  tenantId: string;
  name: string;
  cpf: string;
  email?: string;
  role: TenantUserRole;
  parliamentarianId?: string;   // apenas se role === PARLIAMENTARIAN
  parliamentaryName?: string;   // nome parlamentar
  photoUrl?: string;
}

export interface LoginRequest {
  cpf: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
```

---

## Fase 2 — Camada API de autenticação

### T-02 · Atualizar `api/client.ts` — remover authType

- [x] Remover qualquer lógica que diferencia `authType === 'sigl'` vs `authType === 'camara'`
- [x] `api()` deve funcionar com base apenas no token do localStorage

### T-03 · Atualizar `authApi` — endpoint único

- [x] Substituído por `login: (dto: LoginRequest) => ...` com `POST /auth/login`
- [x] Remover `loginSigl()`
- [x] Remover `loginCamara()`
- [x] Manter `me()` sem alteração
- [x] Remover `/auth/login-camara` de `paths.ts`

---

## Fase 3 — AuthContext

### T-04 · Reescrever `contexts/AuthContext.tsx`

- [x] Interface `AuthContextValue` com `login(cpf, password)`, `logout()`, helpers `isAdminStaff/isStaff/isParliamentarian`
- [x] Remover `loginSigl`, `loginCamara`, `authType` do contexto
- [x] Garantir que `GET /auth/me` é chamado ao montar para reconciliar sessão

---

## Fase 4 — Guards de rota

### T-05 · Criar `components/StaffRoute.tsx`

- [x] Permite ADMIN_STAFF e STAFF; redireciona PARLIAMENTARIAN para `/parlamentar/perfil`

### T-06 · Criar `components/ParlamentarRoute.tsx`

- [x] Permite apenas PARLIAMENTARIAN; redireciona outros para `/`

### T-07 · Criar `components/AdminRoute.tsx`

- [x] Wrapper que bloqueia não-ADMIN_STAFF e redireciona para `/`
- [x] **Remover** `MasterRoute` — deletado
- [x] **Remover** `ProtectedRoute` legado — deletado

---

## Fase 5 — LoginPage

### T-08 · Reescrever `LoginPage.tsx`

- [x] **Remover** abas TabView (SIGL / Câmara)
- [x] **Remover** campos email, CNPJ, username
- [x] Campo CPF com `InputMask` máscara `999.999.999-99`
- [x] Campo Senha com `Password` PrimeReact (toggle ver/ocultar)
- [x] Erro exibido inline com `<Message>` PrimeReact (não toast)
- [x] `<form onSubmit>` permite pressionar Enter para submeter
- [x] Redirect por role após login bem-sucedido

---

## Fase 6 — Dois Layouts

### T-09 · Criar `ParlamentarLayout.tsx`

- [x] Header com foto/avatar + nome parlamentar + partido
- [x] Sidebar com `PARLAMENTAR_NAV_ITEMS`
- [x] Botão Sair
- [x] `<Outlet />` para conteúdo

### T-10 · Atualizar `Layout.tsx` (StaffLayout)

- [x] Remover `showAdministrativo` baseado em `authType`
- [x] Remover import e uso de `authType`
- [x] Atos administrativos sempre visíveis para staff
- [x] Menu "Usuários" filtrado por `isAdminStaff` no `SidebarNav`
- [x] `user.nome` → `user.name`

---

## Fase 7 — App.tsx com duas árvores de rotas

### T-11 · Reescrever rotas em `App.tsx`

- [x] Rotas Staff dentro de `<StaffRoute>` → `<Layout>`
- [x] Rotas Parlamentar dentro de `<ParlamentarRoute>` → `<ParlamentarLayout>`
- [x] `/usuarios` dentro de `<AdminRoute>`
- [x] Redirects legados mantidos
- [x] Catch-all → `/login`

---

## Fase 8 — Pages da view Parlamentar

### T-12 · Criar `ParlamentarPerfilPage`

- [x] Exibe foto, nome, partido, biografia, contatos
- [x] Cards de dashboard pessoal (matérias, sessões, comissões)

### T-13 · Criar `ParlamentarMateriasPage`

- [x] DataTable de matérias com `MateriaStatusBadge`
- [x] Ação Ver → `MateriaVerDialog`

### T-14 · Criar `ParlamentarComissoesPage`

- [x] DataTable de comissões com papel e status

### T-15 · Criar `ParlamentarMandatoPage`

- [x] Timeline de mandatos com legislatura, datas e status

### T-16 · Criar `ParlamentarFiliacaoPage`

- [x] Partido atual em destaque + histórico de filiações

---

## Fase 9 — navigation.ts

### T-17 · Atualizar `navigation.ts`

- [x] Criar `PARLAMENTAR_NAV_ITEMS`
- [x] Remover qualquer filtro baseado em `authType`
- [x] Menu Usuários visível via `isAdminStaff` no SidebarNav

---

## Fase 10 — Limpeza

### T-18 · Remover código legado de auth

- [x] `authType` → removido de todo o codebase
- [x] `loginSigl` → removido
- [x] `loginCamara` → removido
- [x] `SiglRole` → removido de `types/auth.ts`
- [x] `CamaraRole` → removido de `types/auth.ts`
- [x] `MasterRoute` → arquivo deletado
- [x] `ProtectedRoute` legado → arquivo deletado
- [x] `showAdministrativo` no Layout → removido
- [x] `isMaster` / `isCamara` em `usePermissions` → removido
- [x] Aba TabView no LoginPage → removido
- [x] `POST /auth/login-camara` em paths.ts → removido

---

## Checklist final

- [x] `npm run build` — zero erros TypeScript
- [x] Login com CPF + Senha → formulário único sem abas
- [x] ADMIN_STAFF logado → vai para `/`, sidebar completa com botões Editar/Deletar
- [x] STAFF logado → vai para `/`, sidebar completa mas sem botões Editar/Deletar
- [x] PARLIAMENTARIAN logado → vai para `/parlamentar/perfil`, layout próprio
- [x] PARLIAMENTARIAN tenta acessar `/materias` → redirect para `/parlamentar/perfil`
- [x] ADMIN_STAFF tenta acessar `/parlamentar/perfil` → redirect para `/`
- [x] STAFF tenta acessar `/usuarios` → redirect para `/`
- [x] Logout limpa localStorage e vai para `/login`
- [x] Reload da página mantém sessão (reconciliação via `GET /auth/me`)
- [x] Erro de login aparece inline abaixo do formulário (não toast)
- [x] CPF com máscara `999.999.999-99` no input
- [x] `grep -r "authType" src/` → zero resultados
- [x] `grep -r "loginSigl\|loginCamara" src/` → zero resultados
