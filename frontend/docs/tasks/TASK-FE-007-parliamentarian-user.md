# TASK-FE-007 — Frontend: sessionType, Guards e AuthContext

**Spec:** `backend/docs/specs/parlamentares/SPEC-007-parliamentarian-user.md`
**Depende de:** TASK-FE-000 (auth) e TASK-007 (backend) concluídas
**Afeta:** `types/auth.ts`, `AuthContext`, `ParlamentarRoute`, `usePermissions`

---

## Fase 1 — Tipos

### T-01 · Atualizar `types/auth.ts` com sessionType

```ts
// types/auth.ts — substituir AuthUser único por dois tipos discriminados

export type SessionType = 'staff' | 'parliamentarian';

export interface StaffUser {
  sessionType: 'staff';
  id: string;           // userId
  tenantId: string;
  tenantUserId: string;
  name: string;
  cpf: string;
  email?: string;
  role: 'ADMIN_STAFF' | 'STAFF';
  photoUrl?: string;
}

export interface ParlamentarianUser {
  sessionType: 'parliamentarian';
  id: string;                    // userId
  tenantId: string;
  parliamentarianUserId: string;
  parliamentarianId: string;
  name: string;                  // nome civil
  parliamentaryName: string;     // nome parlamentar
  cpf: string;
  photoUrl?: string;
}

// Union type — AuthUser pode ser um dos dois
export type AuthUser = StaffUser | ParlamentarianUser;

// Type guards
export function isStaffUser(u: AuthUser): u is StaffUser {
  return u.sessionType === 'staff';
}

export function isParlamentarianUser(u: AuthUser): u is ParlamentarianUser {
  return u.sessionType === 'parliamentarian';
}

// Request/Response de login (inalterado)
export interface LoginRequest { cpf: string; password: string; }
export interface LoginResponse { access_token: string; user: AuthUser; sessionType: SessionType; }
```

- [ ] Remover `TenantUserRole` de `types/auth.ts` — vem de `@prisma/client` ou enum próprio
- [ ] Remover interface `AuthUser` antiga

---

## Fase 2 — AuthContext

### T-02 · Atualizar `contexts/AuthContext.tsx`

```tsx
interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login(cpf: string, password: string): Promise<void>;
  logout(): void;

  // Helpers por sessionType — sem ambiguidade
  isAdminStaff: boolean;      // user.sessionType === 'staff' && role === 'ADMIN_STAFF'
  isStaff: boolean;           // user.sessionType === 'staff' && role === 'STAFF'
  isParliamentarian: boolean; // user.sessionType === 'parliamentarian'

  // Helpers de conveniência
  canEdit: boolean;           // isAdminStaff
  canWrite: boolean;          // isAdminStaff || isStaff
  canVotar: boolean;          // isParliamentarian
}

// Implementação dos helpers:
const isAdminStaff    = isStaffUser(user) && user.role === 'ADMIN_STAFF';
const isStaff         = isStaffUser(user) && user.role === 'STAFF';
const isParliamentarian = isParlamentarianUser(user);
const canEdit         = isAdminStaff;
const canWrite        = isAdminStaff || isStaff;
const canVotar        = isParliamentarian;
```

### T-03 · Atualizar redirecionamento pós-login

```tsx
const login = async (cpf: string, password: string) => {
  const res = await authApi.login({ cpf, password });
  localStorage.setItem('access_token', res.access_token);
  localStorage.setItem('user', JSON.stringify(res.user));
  setUser(res.user);
  // sessionType vem do backend agora
};

// No LoginPage — usar sessionType da response:
const res = await authApi.login({ cpf, password });
if (res.sessionType === 'parliamentarian') {
  navigate('/parlamentar/perfil', { replace: true });
} else {
  navigate('/', { replace: true });
}
```

---

## Fase 3 — Guards de rota

### T-04 · Atualizar `StaffRoute.tsx`

```tsx
export function StaffRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  // Usa type guard — não compara strings de role
  if (isParlamentarianUser(user)) {
    return <Navigate to="/parlamentar/perfil" replace />;
  }

  return <Outlet />;
}
```

### T-05 · Atualizar `ParlamentarRoute.tsx`

```tsx
export function ParlamentarRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <FullScreenSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  if (!isParlamentarianUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

### T-06 · Atualizar `AdminRoute.tsx`

```tsx
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Usa type guard antes de checar role
  if (!isStaffUser(user) || user.role !== 'ADMIN_STAFF') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## Fase 4 — usePermissions

### T-07 · Reescrever `hooks/usePermissions.ts`

```ts
import { useAuth } from '../contexts/AuthContext';
import { isStaffUser, isParlamentarianUser } from '../types/auth';

export function usePermissions() {
  const { user } = useAuth();

  if (!user) return {
    canWrite: false, canEdit: false, canDelete: false,
    canManageSessao: false, canVotar: false, canManagePessoas: false,
    isAdminStaff: false, isStaff: false, isParliamentarian: false,
    sessionType: null,
  };

  const isAdminStaff    = isStaffUser(user) && user.role === 'ADMIN_STAFF';
  const isStaff         = isStaffUser(user) && user.role === 'STAFF';
  const isParliamentarian = isParlamentarianUser(user);

  return {
    // Escrita geral: criar registros
    canWrite: isAdminStaff || isStaff,

    // Editar e deletar: apenas admin
    canEdit:   isAdminStaff,
    canDelete: isAdminStaff,

    // Sessão: iniciar/encerrar (admin e staff)
    canManageSessao: isAdminStaff || isStaff,

    // Votar: exclusivo do parlamentar
    canVotar: isParliamentarian,

    // Gerenciar pessoas: apenas admin
    canManagePessoas: isAdminStaff,

    // Identidade
    isAdminStaff,
    isStaff,
    isParliamentarian,
    sessionType: user.sessionType,

    // Conveniência para acesso ao parliamentarianId nas páginas de parlamentar
    parliamentarianId: isParlamentarianUser(user) ? user.parliamentarianId : undefined,
  };
}
```

---

## Fase 5 — ParlamentarLayout com dados reais

### T-08 · Atualizar `ParlamentarLayout.tsx` com dados do ParlamentarianUser

```tsx
export function ParlamentarLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // user é ParlamentarianUser garantido por ParlamentarRoute
  const parlUser = user as ParlamentarianUser;

  return (
    <div className="parlamentar-layout">
      <header className="parlamentar-header">
        <div className="parlamentar-identity">
          {parlUser.photoUrl ? (
            <Avatar image={parlUser.photoUrl} size="large" shape="circle" />
          ) : (
            <Avatar
              label={parlUser.parliamentaryName.charAt(0).toUpperCase()}
              size="large"
              shape="circle"
            />
          )}
          <div className="parlamentar-identity-info">
            {/* Nome parlamentar em destaque */}
            <span className="parlamentar-name">{parlUser.parliamentaryName}</span>
            {/* Nome civil menor */}
            <span className="parlamentar-civil-name">{parlUser.name}</span>
          </div>
        </div>
        <Button
          icon="pi pi-sign-out"
          text
          rounded
          aria-label="Sair do sistema"
          onClick={logout}
          tooltip="Sair"
          tooltipOptions={{ position: 'left' }}
        />
      </header>

      <nav className="parlamentar-sidebar" aria-label="Menu parlamentar">
        {PARLAMENTAR_NAV_ITEMS.map(item =>
          item.children ? (
            <ParlamentarNavAccordion key={item.label} item={item} defaultExpanded />
          ) : (
            <NavLink
              key={item.route}
              to={item.route!}
              className={({ isActive }) =>
                `parlamentar-nav-item ${isActive ? 'parlamentar-nav-item--active' : ''}`
              }
            >
              <i className={`pi ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <main className="parlamentar-content">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## Fase 6 — ParlamentarPerfilPage com API correta

### T-09 · Atualizar `ParlamentarPerfilPage`

```tsx
export default function ParlamentarPerfilPage() {
  const { parliamentarianId, isParliamentarian } = usePermissions();
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<ParlamentarianProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar: GET /legislative/parlamentares/me/perfil
    // Backend usa parliamentarianId do JWT
    parlamentaresApi.meuPerfil()
      .then(setPerfil)
      .catch(showApiError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ProgressSpinner />;
  if (!perfil) return null;

  const parlUser = user as ParlamentarianUser;

  return (
    <main>
      {/* Cabeçalho com foto e dados principais */}
      <div className="parlamentar-perfil-header">
        {parlUser.photoUrl ? (
          <img src={parlUser.photoUrl} alt={`Foto de ${parlUser.parliamentaryName}`}
            className="parlamentar-foto" />
        ) : (
          <Avatar label={parlUser.parliamentaryName.charAt(0)} size="xlarge" shape="circle" />
        )}
        <div>
          <h1>{parlUser.parliamentaryName}</h1>
          <span>{perfil.politicalParty?.name ?? 'Sem partido'}</span>
        </div>
      </div>

      {/* Cards de resumo (Dashboard integrado ao Perfil) */}
      <div className="grid mt-3">
        <div className="col-12 md:col-4">
          <Card title="Minhas Matérias">
            {/* contadores por status */}
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card title="Próximas Sessões">
            {/* sessões agendadas */}
          </Card>
        </div>
        <div className="col-12 md:col-4">
          <Card title="Comissões">
            {/* comissões que participa */}
          </Card>
        </div>
      </div>
    </main>
  );
}
```

### T-10 · Adicionar `meuPerfil()` em `api/legislative/parlamentares.api.ts`

```ts
export const parlamentaresApi = {
  // ... métodos existentes ...

  // Para o parlamentar logado ver o próprio perfil
  meuPerfil: () => api<ParlamentarianProfile>(
    `${API_PATHS.parlamentares}/me/perfil`
  ),
};
```

---

## Checklist final

- [ ] `npm run build` — zero erros TypeScript
- [ ] Type guards `isStaffUser()` e `isParlamentarianUser()` usados em vez de comparação de string
- [ ] `AuthContext` não tem mais `isParliamentarian` baseado em `role === 'PARLIAMENTARIAN'`
- [ ] `StaffRoute` usa `isParlamentarianUser(user)` para redirecionar
- [ ] `ParlamentarRoute` usa `!isParlamentarianUser(user)` para redirecionar
- [ ] `ParlamentarLayout` exibe `parliamentaryName` (nome parlamentar) em destaque
- [ ] `usePermissions.parliamentarianId` retorna ID do parlamentar logado
- [ ] `GET /legislative/parlamentares/me/perfil` chamado (não `/legislative/parlamentares/:id`)
- [ ] Login de parlamentar → `sessionType: 'parliamentarian'` no localStorage
- [ ] Login de servidor → `sessionType: 'staff'` no localStorage
