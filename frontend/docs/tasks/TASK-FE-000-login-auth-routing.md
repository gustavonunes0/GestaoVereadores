# TASK-FE-000 — Login Único, AuthContext e Roteamento por Role

**Spec:** `frontend/docs/specs/SPEC-FE-AUTH-login-roles.md`
**Leia também:** `frontend/docs/CLAUDE-FRONTEND.md`
**Bloqueia:** Todas as outras tasks FE — executar PRIMEIRA

> Esta task reescreve a fundação de autenticação e roteamento.
> Nada do sistema funciona corretamente até ela estar concluída.

---

## Fase 1 — Tipos (`types/auth.ts`)

### T-01 · Reescrever `types/auth.ts`

- [ ] **Remover** completamente: `SiglRole`, `CamaraRole`, `AuthType`
- [ ] **Remover** qualquer referência a `authType`
- [ ] **Criar** o tipo simplificado:

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

- [ ] Remover qualquer lógica que diferencia `authType === 'sigl'` vs `authType === 'camara'`
- [ ] `api()` deve funcionar com base apenas no token do localStorage

### T-03 · Atualizar `authApi` — endpoint único

```ts
// Substituir loginSigl e loginCamara por:
export const authApi = {
  login: (dto: LoginRequest): Promise<LoginResponse> =>
    api('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  me: (): Promise<AuthUser> =>
    api('/auth/me'),
};
```

- [ ] Remover `loginSigl()`
- [ ] Remover `loginCamara()`
- [ ] Manter `me()` sem alteração

---

## Fase 3 — AuthContext

### T-04 · Reescrever `contexts/AuthContext.tsx`

```tsx
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login(cpf: string, password: string): Promise<void>;
  logout(): void;
  // Helpers derivados de role — sem authType
  isAdminStaff: boolean;
  isStaff: boolean;
  isParliamentarian: boolean;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reconciliar sessão ao montar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (cpf: string, password: string) => {
    const res = await authApi.login({ cpf, password });
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdminStaff:     user?.role === 'ADMIN_STAFF',
    isStaff:          user?.role === 'STAFF',
    isParliamentarian: user?.role === 'PARLIAMENTARIAN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

- [ ] Remover `loginSigl`, `loginCamara`, `authType` do contexto
- [ ] Garantir que `GET /auth/me` é chamado ao montar para reconciliar sessão

---

## Fase 4 — Guards de rota

### T-05 · Criar `components/StaffRoute.tsx`

```tsx
// Permite ADMIN_STAFF e STAFF; bloqueia PARLIAMENTARIAN
export function StaffRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <ProgressSpinner />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'PARLIAMENTARIAN') {
    return <Navigate to="/parlamentar/perfil" replace />;
  }

  return <Outlet />;
}
```

### T-06 · Criar `components/ParlamentarRoute.tsx`

```tsx
// Permite apenas PARLIAMENTARIAN
export function ParlamentarRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <ProgressSpinner />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'PARLIAMENTARIAN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### T-07 · Criar `components/AdminRoute.tsx`

```tsx
// Wrapper para rotas acessíveis apenas por ADMIN_STAFF (ex: /usuarios)
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN_STAFF') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

- [ ] **Remover** `MasterRoute` após criar `AdminRoute`
- [ ] **Remover** `ProtectedRoute` legado — substituído por `StaffRoute` e `ParlamentarRoute`

---

## Fase 5 — LoginPage

### T-08 · Reescrever `LoginPage.tsx`

```tsx
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação básica no frontend
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      setError('CPF inválido. Informe os 11 dígitos.');
      return;
    }
    if (!password) {
      setError('Informe a senha.');
      return;
    }

    setLoading(true);
    try {
      await login(cpf, password);
      // AuthContext atualiza user; redirecionar por role
      // Ler direto do localStorage pois setUser é async
      const stored = localStorage.getItem('user');
      const user: AuthUser = stored ? JSON.parse(stored) : null;
      if (user?.role === 'PARLIAMENTARIAN') {
        navigate('/parlamentar/perfil', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      // Exibir erro abaixo do formulário, não como toast
      setError(apiErrorMessage(err) || 'CPF ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sigl-login-page">
      <div className="sigl-login-card">
        {/* Logo e título */}
        <div className="sigl-login-header">
          <img src="/logo.svg" alt="SIGL" height={48} />
          <h1>Sistema de Gestão Legislativa</h1>
        </div>

        {/* Formulário único — sem abas */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <InputMask
              id="cpf"
              mask="999.999.999-99"
              value={cpf}
              onChange={(e) => setCpf(e.value ?? '')}
              placeholder="000.000.000-00"
              autoFocus
              className={error && !password ? 'p-invalid' : ''}
            />
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <Password
              id="senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              placeholder="••••••••"
            />
          </div>

          {/* Erro exibido inline, não como toast */}
          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          <Button
            type="submit"
            label="Entrar"
            icon="pi pi-sign-in"
            loading={loading}
            className="w-full"
          />
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Remover** abas TabView (SIGL / Câmara)
- [ ] **Remover** campo email, campo CNPJ, campo username
- [ ] Campo CPF com `InputMask` máscara `999.999.999-99`
- [ ] Campo Senha com `Password` PrimeReact (toggle ver/ocultar)
- [ ] Erro exibido inline com `<Message>` PrimeReact (não toast)
- [ ] `<form onSubmit>` permite pressionar Enter para submeter

---

## Fase 6 — Dois Layouts

### T-09 · Criar `ParlamentarLayout.tsx`

```tsx
// Layout enxuto para a view do Parlamentar
export function ParlamentarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="parlamentar-layout">
      {/* Header com identidade do parlamentar */}
      <header className="parlamentar-header">
        <div className="parlamentar-identity">
          {user?.photoUrl ? (
            <Avatar image={user.photoUrl} size="large" shape="circle" />
          ) : (
            <Avatar icon="pi pi-user" size="large" shape="circle" />
          )}
          <div>
            <span className="parlamentar-name">{user?.parliamentaryName ?? user?.name}</span>
            <span className="parlamentar-role">Parlamentar</span>
          </div>
        </div>
        <Button icon="pi pi-sign-out" text aria-label="Sair" onClick={logout} />
      </header>

      {/* Navegação lateral simplificada */}
      <nav className="parlamentar-sidebar" aria-label="Menu parlamentar">
        {PARLAMENTAR_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            className={({ isActive }) =>
              `parlamentar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <i className={`pi ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Conteúdo */}
      <main className="parlamentar-content">
        <Outlet />
      </main>
    </div>
  );
}
```

### T-10 · Atualizar `Layout.tsx` (StaffLayout)

- [ ] Remover `showAdministrativo` baseado em `authType`
- [ ] Remover import e uso de `authType` em qualquer lugar
- [ ] `showAdministrativo` passa a ser sempre `true` (todos os staff veem Atos)
- [ ] Menu "Gestão → Usuários" filtrado por `isAdminStaff` do AuthContext:

```tsx
// Em SidebarNav — filtrar item adminOnly
const filteredItems = group.items.filter(
  item => !item.adminOnly || isAdminStaff
);
```

---

## Fase 7 — App.tsx com duas árvores de rotas

### T-11 · Reescrever rotas em `App.tsx`

```tsx
export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Staff (ADMIN_STAFF e STAFF) */}
      <Route element={<StaffRoute />}>
        <Route element={<Layout />}>                          {/* StaffLayout */}
          <Route element={<LegislaturaProvider />}>
            <Route element={<AppFeedbackProvider />}>
              <Route path="/"                     element={<DashboardPage />} />
              <Route path="/materias"             element={<MateriasPage />} />
              <Route path="/sessoes"              element={<SessoesPage />} />
              <Route path="/agenda"               element={<AgendaPage />} />
              <Route path="/relatorios"           element={<RelatoriosPage />} />
              <Route path="/normas-juridicas"     element={<NormasPage />} />
              <Route path="/atos-administrativos" element={<AtosPage />} />
              <Route path="/camara"               element={<CamaraPage />}>
                <Route path="legislaturas"        element={<LegislaturasPage />} />
                <Route path="parlamentares"       element={<ParlamentaresPage />} />
                <Route path="comissoes"           element={<ComissoesPage />} />
                <Route path="frentes"             element={<FrentesPage />} />
                <Route path="mesa-diretora"       element={<MesaDiretoraPage />} />
                <Route path="autores"             element={<AutoresPage />} />
              </Route>
              <Route
                path="/usuarios"
                element={<AdminRoute><UsuariosPage /></AdminRoute>}
              />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Parlamentar */}
      <Route element={<ParlamentarRoute />}>
        <Route element={<ParlamentarLayout />}>
          <Route path="/parlamentar/perfil"    element={<ParlamentarPerfilPage />} />
          <Route path="/parlamentar/materias"  element={<ParlamentarMateriasPage />} />
          <Route path="/parlamentar/comissoes" element={<ParlamentarComissoesPage />} />
          <Route path="/parlamentar/mandato"   element={<ParlamentarMandatoPage />} />
          <Route path="/parlamentar/filiacao"  element={<ParlamentarFiliacaoPage />} />
        </Route>
      </Route>

      {/* Redirects legados */}
      <Route path="/parlamentares"  element={<Navigate to="/camara/parlamentares" />} />
      <Route path="/comissoes"      element={<Navigate to="/camara/comissoes" />} />
      <Route path="/frentes"        element={<Navigate to="/camara/frentes" />} />
      <Route path="/mesa-diretora"  element={<Navigate to="/camara/mesa-diretora" />} />
      <Route path="/autores"        element={<Navigate to="/camara/autores" />} />
      <Route path="/legislaturas"   element={<Navigate to="/camara/legislaturas" />} />
      <Route path="/normas"         element={<Navigate to="/normas-juridicas" />} />
      <Route path="/atos"           element={<Navigate to="/atos-administrativos" />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
```

---

## Fase 8 — Pages da view Parlamentar

### T-12 · Criar `ParlamentarPerfilPage`

- [ ] Buscar dados: `GET /legislative/parlamentares/:parliamentarianId`
- [ ] Exibir: foto, nome parlamentar, partido, biografia, contatos
- [ ] **Dashboard pessoal** — 3 cards:
  - Total de matérias por status (contador)
  - Próximas sessões onde precisa votar
  - Comissões que participa

### T-13 · Criar `ParlamentarMateriasPage`

- [ ] Filtrar automaticamente por `authorParliamentarianId = user.parliamentarianId`
  OU `relator` OU `coautor` — mostrar todas onde tem participação
- [ ] Coluna "Papel": Autor / Coautor / Relator
- [ ] Botão "Nova Matéria" → CreateDialog com autor preenchido do JWT (desabilitado)
- [ ] Ação Ver → dialog com histórico de tramitação

### T-14 · Criar `ParlamentarComissoesPage`

- [ ] Buscar: `GET /legislative/comissoes?parlamentarianId=:id`
- [ ] Exibir: nome, tipo, papel (Presidente/Relator/Membro), status

### T-15 · Criar `ParlamentarMandatoPage`

- [ ] Buscar: `GET /legislative/parlamentares/:id/mandates`
- [ ] Timeline de mandatos com legislatura, datas e status

### T-16 · Criar `ParlamentarFiliacaoPage`

- [ ] Buscar: `GET /legislative/partidos-politicos?parlamentarianId=:id`
- [ ] Partido atual em destaque, histórico de filiações

---

## Fase 9 — navigation.ts

### T-17 · Atualizar `navigation.ts`

- [ ] Criar `STAFF_NAV_GROUPS` (ver SPEC-FE-AUTH seção "Sidebar dinâmica")
- [ ] Criar `PARLAMENTAR_NAV_ITEMS`
- [ ] Remover qualquer filtro baseado em `authType`
- [ ] Adicionar flag `adminOnly: true` no item Usuários

---

## Fase 10 — Limpeza

### T-18 · Remover código legado de auth

Varrer todos os arquivos e remover/substituir:

- [ ] `authType` → remover de todo o codebase
- [ ] `loginSigl` → remover
- [ ] `loginCamara` → remover
- [ ] `SiglRole` → remover
- [ ] `CamaraRole` → remover
- [ ] `MasterRoute` → remover (substituído por `AdminRoute`)
- [ ] `ProtectedRoute` legado → remover (substituído por `StaffRoute`/`ParlamentarRoute`)
- [ ] `showAdministrativo` no Layout → remover
- [ ] `isMaster` em `usePermissions` → remover
- [ ] Aba TabView no LoginPage → remover
- [ ] `POST /auth/login-camara` em paths.ts → remover
- [ ] Campos email/CNPJ/username no LoginPage → remover

Verificar: `grep -r "authType\|loginSigl\|loginCamara\|SiglRole\|CamaraRole\|MasterRoute\|showAdministrativo" src/`
O resultado deve ser vazio.

---

## Checklist final

- [ ] `npm run build` — zero erros TypeScript
- [ ] Login com CPF + Senha → funciona sem abas
- [ ] ADMIN_STAFF logado → vai para `/`, vê sidebar completa com botões Editar/Deletar
- [ ] STAFF logado → vai para `/`, sidebar completa mas sem botões Editar/Deletar
- [ ] PARLIAMENTARIAN logado → vai para `/parlamentar/perfil`, vê layout próprio
- [ ] PARLIAMENTARIAN tenta acessar `/materias` → redirect para `/parlamentar/perfil`
- [ ] ADMIN_STAFF tenta acessar `/parlamentar/perfil` → redirect para `/`
- [ ] STAFF tenta acessar `/usuarios` → redirect para `/`
- [ ] Logout limpa localStorage e vai para `/login`
- [ ] Reload da página mantém sessão (reconciliação via `GET /auth/me`)
- [ ] Erro de login aparece inline abaixo do formulário (não toast)
- [ ] CPF com máscara `999.999.999-99` no input
- [ ] `grep -r "authType" src/` → zero resultados
- [ ] `grep -r "loginSigl\|loginCamara" src/` → zero resultados
