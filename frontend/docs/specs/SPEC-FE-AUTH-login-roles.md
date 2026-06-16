# SPEC-FE-AUTH — Login Único e Roteamento por Role

**Status:** Aprovada | **Versão:** 1.0
**Afeta:** `LoginPage`, `AuthContext`, `App.tsx`, `Layout`, `types/auth.ts`,
           `api/client.ts`, `hooks/usePermissions`, `app/navigation.ts`

---

## Contexto

O sistema anterior tinha duas abas de login (SIGL e Câmara) com dois endpoints
diferentes, dois conjuntos de roles e `authType` como discriminador.

O novo modelo é mais simples e correto:

- **Um único endpoint de login:** `POST /auth/login` com `{ cpf, password }`
- **Um único conjunto de roles:** `TenantUserRole` retornado pelo backend no JWT
- **Frontend decide a view** com base no `role` retornado — sem `authType`

---

## Fluxo de autenticação

```
[Tela Login] CPF + Senha
      ↓
POST /auth/login { cpf, password }
      ↓
JWT payload: { sub, tenantId, tenantUserId, role, parliamentarianId? }
      ↓
AuthContext armazena token + user
      ↓
App.tsx lê role → renderiza view correta
      ↓
ADMIN_STAFF | STAFF  →  StaffLayout  →  SidebarNav completa
PARLIAMENTARIAN      →  ParlamentarLayout  →  Menu legislativo pessoal
```

---

## Tipos simplificados (`types/auth.ts`)

```ts
// REMOVER: SiglRole, CamaraRole, AuthType
// MANTER e EXPANDIR:

export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

export interface AuthUser {
  id: string;               // userId
  tenantUserId: string;
  tenantId: string;
  name: string;
  cpf: string;
  email?: string;
  role: TenantUserRole;
  parliamentarianId?: string;  // só se role === PARLIAMENTARIAN
  parliamentaryName?: string;  // nome parlamentar, só se PARLIAMENTARIAN
  photoUrl?: string;
}

export interface LoginRequest {
  cpf: string;       // formato "000.000.000-00" ou "00000000000"
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
```

---

## AuthContext simplificado

```ts
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login(cpf: string, password: string): Promise<void>;
  logout(): void;

  // Helpers derivados de user.role — sem authType
  isAdminStaff: boolean;
  isStaff: boolean;
  isParliamentarian: boolean;
}
```

**Implementação:**

```ts
async function login(cpf: string, password: string) {
  const res = await authApi.login({ cpf, password });
  localStorage.setItem('access_token', res.access_token);
  localStorage.setItem('user', JSON.stringify(res.user));
  setUser(res.user);
}

// Helpers
const isAdminStaff    = user?.role === 'ADMIN_STAFF';
const isStaff         = user?.role === 'STAFF';
const isParliamentarian = user?.role === 'PARLIAMENTARIAN';
```

---

## LoginPage — tela única

**Campos:**
- CPF → `InputMask` com máscara `999.999.999-99`
- Senha → `Password` PrimeReact (toggle mostrar/ocultar)
- Botão "Entrar"

**Sem abas, sem CNPJ, sem seleção de perfil.**

**Validações no frontend:**
- CPF: formato válido (11 dígitos)
- Senha: não vazia
- Erro da API exibido abaixo do formulário (não como toast)

**Após login bem-sucedido:**
- Salvar token e user no `localStorage`
- Redirecionar conforme role:
  ```ts
  if (role === 'PARLIAMENTARIAN') navigate('/parlamentar/perfil');
  else navigate('/');  // Dashboard Staff
  ```

---

## Roteamento por role (`App.tsx`)

### Duas árvores de rotas separadas

```tsx
<Routes>
  {/* Pública */}
  <Route path="/login" element={<LoginPage />} />

  {/* Staff e Admin Staff */}
  <Route element={<StaffRoute />}>          {/* guard: ADMIN_STAFF ou STAFF */}
    <Route element={<StaffLayout />}>
      <Route path="/"                        element={<DashboardPage />} />
      <Route path="/materias"                element={<MateriasPage />} />
      <Route path="/sessoes"                 element={<SessoesPage />} />
      <Route path="/agenda"                  element={<AgendaPage />} />
      <Route path="/relatorios"              element={<RelatoriosPage />} />
      <Route path="/normas-juridicas"        element={<NormasPage />} />
      <Route path="/atos-administrativos"    element={<AtosPage />} />
      <Route path="/camara/legislaturas"     element={<LegislaturasPage />} />
      <Route path="/camara/parlamentares"    element={<ParlamentaresPage />} />
      <Route path="/camara/comissoes"        element={<ComissoesPage />} />
      <Route path="/camara/frentes"          element={<FrentesPage />} />
      <Route path="/camara/mesa-diretora"    element={<MesaDiretoraPage />} />
      <Route path="/camara/autores"          element={<AutoresPage />} />
      <Route path="/usuarios"               element={<AdminRoute><UsuariosPage /></AdminRoute>} />
    </Route>
  </Route>

  {/* Parlamentar */}
  <Route element={<ParlamentarRoute />}>    {/* guard: PARLIAMENTARIAN apenas */}
    <Route element={<ParlamentarLayout />}>
      <Route path="/parlamentar/perfil"     element={<ParlamentarPerfilPage />} />
      <Route path="/parlamentar/materias"   element={<ParlamentarMateriasPage />} />
      <Route path="/parlamentar/comissoes"  element={<ParlamentarComissoesPage />} />
      <Route path="/parlamentar/mandato"    element={<ParlamentarMandatoPage />} />
      <Route path="/parlamentar/filiacao"   element={<ParlamentarFiliacaoPage />} />
    </Route>
  </Route>

  {/* Catch-all → login */}
  <Route path="*" element={<Navigate to="/login" />} />
</Routes>
```

### Guards de rota

```tsx
// StaffRoute — permite ADMIN_STAFF e STAFF
function StaffRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <ProgressSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'PARLIAMENTARIAN') return <Navigate to="/parlamentar/perfil" replace />;
  return <Outlet />;
}

// ParlamentarRoute — permite apenas PARLIAMENTARIAN
function ParlamentarRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <ProgressSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'PARLIAMENTARIAN') return <Navigate to="/" replace />;
  return <Outlet />;
}

// AdminRoute — apenas ADMIN_STAFF (para rotas como /usuarios)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN_STAFF') return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

---

## Dois Layouts

### StaffLayout (ADMIN_STAFF e STAFF)

Estrutura idêntica ao `Layout` atual. Sidebar com todos os menus.
A diferença entre Admin e Staff é nos **botões dentro das páginas** (via `canEdit/canDelete`),
não no layout.

```
SidebarNav completa:
  Dashboard
  Atividade Legislativa: Matérias, Sessões, Agenda, Relatórios, Normas, Atos
  Estrutura da Câmara: Legislaturas, Parlamentares, Comissões, Frentes, Mesa, Autores
  Gestão: Usuários (visível apenas para ADMIN_STAFF)
```

### ParlamentarLayout (PARLIAMENTARIAN)

Layout diferente — mais enxuto, focado no perfil legislativo do parlamentar.

```
Header: foto + nome parlamentar + partido
Sidebar simplificada:
  Meu Perfil     → /parlamentar/perfil
  Minhas Matérias → /parlamentar/materias
  Comissões      → /parlamentar/comissoes
  Mandato        → /parlamentar/mandato
  Filiação       → /parlamentar/filiacao
```

---

## Páginas da view Parlamentar

### ParlamentarPerfilPage (`/parlamentar/perfil`)

**Dados exibidos (somente leitura):**
- Foto, nome parlamentar, nome civil
- Partido atual, cargo (Vereador/Deputado)
- Legislatura ativa, mandato atual
- Biografia
- Contatos (email, gabinete)

**Seção Dashboard pessoal:**
- Total de matérias de autoria própria por status
- Próximas sessões (onde deve votar)
- Comissões que participa

### ParlamentarMateriasPage (`/parlamentar/materias`)

**Filtros:**
- Status, Tipo, Período

**DataTable:**
- Matérias onde é autor principal, coautor ou relator
- Identificação, Ementa, Status (badge), Papel (autor/coautor/relator)
- Ação "Ver" → dialog com detalhes + histórico tramitação

**Criar Matéria:**
- Formulário igual ao da StaffView mas com `autorParliamentarianId` preenchido automaticamente
- Parlamentar não escolhe o autor — é sempre ele mesmo

### ParlamentarComissoesPage (`/parlamentar/comissoes`)

- Comissões das quais é membro
- Papel na comissão (Presidente/Relator/Membro)
- Próximas reuniões

### ParlamentarMandatoPage (`/parlamentar/mandato`)

- Histórico de mandatos
- Legislatura, datas de início/fim, status

### ParlamentarFiliacaoPage (`/parlamentar/filiacao`)

- Partido atual e histórico de filiações
- Dados do partido: nome, sigla, número eleitoral

---

## Sidebar dinâmica por role (`navigation.ts`)

```ts
// navigation.ts — dois conjuntos de nav
export const STAFF_NAV_GROUPS = [
  {
    label: 'Atividade Legislativa',
    items: [
      { label: 'Dashboard',       route: '/',               icon: 'pi-home' },
      { label: 'Matérias',        route: '/materias',        icon: 'pi-file' },
      { label: 'Sessões',         route: '/sessoes',          icon: 'pi-calendar' },
      { label: 'Agenda',          route: '/agenda',           icon: 'pi-calendar-plus' },
      { label: 'Relatórios',      route: '/relatorios',       icon: 'pi-chart-bar' },
      { label: 'Normas Jurídicas',route: '/normas-juridicas', icon: 'pi-book' },
      { label: 'Atos Adm.',       route: '/atos-administrativos', icon: 'pi-briefcase' },
    ],
  },
  {
    label: 'Estrutura da Câmara',
    items: [
      { label: 'Parlamentares',   route: '/camara/parlamentares', icon: 'pi-users' },
      { label: 'Comissões',       route: '/camara/comissoes',     icon: 'pi-sitemap' },
      { label: 'Frentes',         route: '/camara/frentes',       icon: 'pi-flag' },
      { label: 'Mesa Diretora',   route: '/camara/mesa-diretora', icon: 'pi-star' },
      { label: 'Autores Externos',route: '/camara/autores',       icon: 'pi-id-card' },
      { label: 'Legislaturas',    route: '/camara/legislaturas',  icon: 'pi-history' },
    ],
  },
  {
    label: 'Gestão',
    // Visível apenas ADMIN_STAFF — filtrado no componente SidebarNav
    items: [
      { label: 'Usuários', route: '/usuarios', icon: 'pi-user-edit', adminOnly: true },
    ],
  },
];

export const PARLAMENTAR_NAV_ITEMS = [
  { label: 'Meu Perfil',       route: '/parlamentar/perfil',    icon: 'pi-user' },
  { label: 'Minhas Matérias',  route: '/parlamentar/materias',  icon: 'pi-file' },
  { label: 'Comissões',        route: '/parlamentar/comissoes', icon: 'pi-sitemap' },
  { label: 'Mandato',          route: '/parlamentar/mandato',   icon: 'pi-id-card' },
  { label: 'Filiação',         route: '/parlamentar/filiacao',  icon: 'pi-flag' },
];
```

---

## O que REMOVER do código existente

| Item | Motivo |
|------|--------|
| Aba "SIGL" no LoginPage | Login único agora |
| Aba "Câmara" no LoginPage | Login único agora |
| `POST /auth/login-camara` | Endpoint legado |
| `loginSigl()` no AuthContext | Substituído por `login()` |
| `loginCamara()` no AuthContext | Substituído por `login()` |
| `authType` em `AuthUser` | Não existe mais |
| `SiglRole` em `types/auth.ts` | Removido |
| `CamaraRole` em `types/auth.ts` | Removido |
| `showAdministrativo` no Layout | Substituído por role check |
| `MasterRoute` | Substituído por `AdminRoute` |
| `isMaster` em `usePermissions` | Removido |
| Referências a `authType === 'camara'` | Substituídas por `role` |

---

## Gathering Results

- [ ] `POST /auth/login` com `{ cpf, password }` → 200 com token e user
- [ ] Token inválido → 401 → redirect para `/login`
- [ ] ADMIN_STAFF logado → vê Dashboard com sidebar completa
- [ ] STAFF logado → vê Dashboard, não vê botões Editar/Deletar nas tabelas
- [ ] PARLIAMENTARIAN logado → redirect para `/parlamentar/perfil`, não acessa `/materias` (staff)
- [ ] PARLIAMENTARIAN tenta acessar `/` → redirect para `/parlamentar/perfil`
- [ ] ADMIN_STAFF tenta acessar `/parlamentar/perfil` → redirect para `/`
- [ ] Logout → limpa localStorage → redirect para `/login`
- [ ] `authType` não existe mais em nenhum arquivo
- [ ] Campo CPF com máscara `999.999.999-99`
- [ ] Erro de login exibido abaixo do formulário (não toast)
