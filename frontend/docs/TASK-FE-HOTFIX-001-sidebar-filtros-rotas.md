# TASK-FE-HOTFIX-001 — Sidebar, Filtros em Row e Rotas Alinhadas ao Backend

**Prioridade:** CRÍTICA — corrigir antes de implementar qualquer page
**Leia antes:** `CLAUDE-FRONTEND.md` · `PATTERNS-FE.md` · `SPEC-FE-AUTH-login-roles.md`
**Substitui parcialmente:** TASK-FE-000 (seção navigation.ts) e TASK-FE-001 (FiltroLayout e paths.ts)

---

## PROBLEMA 1 — Sidebar com estrutura incorreta

### O que o documento operacional define

**TenantUser View (ADMIN_STAFF e STAFF) — ordem exata:**
```
1. Dashboard
2. Sessões Legislativas
3. Matérias (Proposições)
4. Normas Jurídicas
5. Atos Administrativos
6. Parlamentares
7. Mesa Diretora
8. Comissões
9. Frentes Parlamentares
10. Autor Externo
11. Agenda
12. Relatórios
13. Câmara Gestão
    ├── Portal Institucional  ← item novo, não existia nas tasks
    └── Usuários (apenas ADMIN_STAFF)
```

**Parlamentar View — estrutura exata:**
```
Perfil  ← expandível com sub-itens:
  ├── Perfil Parlamentar
  ├── Biografia
  └── Dashboard
Matérias
Comissões
Mandato
Filiação
```

### Correção em `app/navigation.ts`

#### T-01 · Reescrever STAFF_NAV_GROUPS com ordem e estrutura corretas

```ts
// app/navigation.ts
export const STAFF_NAV_GROUPS = [
  // Itens planos na ordem exata do documento operacional
  { label: 'Dashboard',              route: '/',                       icon: 'pi-home' },
  { label: 'Sessões Legislativas',   route: '/sessoes',                icon: 'pi-calendar' },
  { label: 'Matérias',               route: '/materias',               icon: 'pi-file-edit' },
  { label: 'Normas Jurídicas',       route: '/normas-juridicas',       icon: 'pi-book' },
  { label: 'Atos Administrativos',   route: '/atos-administrativos',   icon: 'pi-briefcase' },
  { label: 'Parlamentares',          route: '/camara/parlamentares',   icon: 'pi-users' },
  { label: 'Mesa Diretora',          route: '/camara/mesa-diretora',   icon: 'pi-star' },
  { label: 'Comissões',              route: '/camara/comissoes',       icon: 'pi-sitemap' },
  { label: 'Frentes Parlamentares',  route: '/camara/frentes',         icon: 'pi-flag' },
  { label: 'Autor Externo',          route: '/camara/autores',         icon: 'pi-id-card' },
  { label: 'Agenda',                 route: '/agenda',                  icon: 'pi-calendar-plus' },
  { label: 'Relatórios',             route: '/relatorios',              icon: 'pi-chart-bar' },
  // Câmara Gestão — grupo com sub-itens
  {
    label: 'Câmara Gestão',
    icon: 'pi-building',
    children: [
      { label: 'Portal Institucional', route: '/camara/portal', icon: 'pi-globe' },
      { label: 'Usuários',             route: '/usuarios',       icon: 'pi-user-edit', adminOnly: true },
    ],
  },
] as const;

// Tipo para item de nav
export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  adminOnly?: boolean;
  children?: NavItem[];
}
```

- [ ] Implementar conforme acima em `app/navigation.ts`
- [ ] Remover `STAFF_NAV_GROUPS` antigo com grupos "Atividade Legislativa" / "Estrutura da Câmara" / "Gestão"
- [ ] A sidebar renderiza itens planos na ordem exata — sem agrupamento em seções, exceto "Câmara Gestão"

#### T-02 · Reescrever PARLAMENTAR_NAV_ITEMS com sub-itens em Perfil

```ts
export const PARLAMENTAR_NAV_ITEMS = [
  {
    label: 'Perfil',
    icon: 'pi-user',
    // Perfil é expandível — clique expande sub-itens, não navega
    children: [
      { label: 'Perfil Parlamentar', route: '/parlamentar/perfil',    icon: 'pi-id-card' },
      { label: 'Biografia',          route: '/parlamentar/biografia',  icon: 'pi-align-left' },
      { label: 'Dashboard',          route: '/parlamentar/dashboard',  icon: 'pi-home' },
    ],
  },
  { label: 'Matérias',   route: '/parlamentar/materias',   icon: 'pi-file-edit' },
  { label: 'Comissões',  route: '/parlamentar/comissoes',  icon: 'pi-sitemap' },
  { label: 'Mandato',    route: '/parlamentar/mandato',    icon: 'pi-calendar' },
  { label: 'Filiação',   route: '/parlamentar/filiacao',   icon: 'pi-flag' },
] as const;
```

- [ ] Implementar em `app/navigation.ts`
- [ ] "Perfil" começa **expandido** por padrão ao logar como Parlamentar

#### T-03 · Atualizar SidebarNav para renderizar estrutura correta

```tsx
// components/SidebarNav.tsx — lógica de renderização

function SidebarNav() {
  const { isAdminStaff } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const renderItem = (item: NavItem) => {
    // Item com filhos → renderizar como accordion
    if (item.children) {
      const isExpanded = expandedGroups.has(item.label);
      return (
        <div key={item.label} className="sigl-nav-group">
          <button
            className="sigl-nav-group-header"
            onClick={() => toggleGroup(item.label)}
            aria-expanded={isExpanded}
          >
            <i className={`pi ${item.icon}`} aria-hidden="true" />
            <span>{item.label}</span>
            <i className={`pi ${isExpanded ? 'pi-chevron-down' : 'pi-chevron-right'} sigl-nav-chevron`} />
          </button>
          {isExpanded && (
            <div className="sigl-nav-group-children" role="group">
              {item.children
                .filter(child => !child.adminOnly || isAdminStaff)
                .map(child => renderItem(child))}
            </div>
          )}
        </div>
      );
    }

    // Item simples → NavLink
    if (item.adminOnly && !isAdminStaff) return null;

    return (
      <NavLink
        key={item.route}
        to={item.route!}
        className={({ isActive }) =>
          `sigl-nav-item ${isActive ? 'sigl-nav-item--active' : ''}`
        }
        aria-current={location.pathname === item.route ? 'page' : undefined}
      >
        <i className={`pi ${item.icon}`} aria-hidden="true" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <nav className="sigl-sidebar-nav" aria-label="Navegação principal">
      {STAFF_NAV_GROUPS.map(renderItem)}
    </nav>
  );
}
```

- [ ] Implementar em `components/SidebarNav.tsx`
- [ ] "Câmara Gestão" começa **colapsado** por padrão
- [ ] "Câmara Gestão" → "Usuários" visível apenas para `isAdminStaff`
- [ ] `aria-expanded`, `aria-current` para acessibilidade

#### T-04 · Criar rota `/camara/portal` para Portal Institucional

- [ ] Adicionar rota em `App.tsx`:
  ```tsx
  <Route path="/camara/portal" element={<PortalInstitucionalPage />} />
  ```
- [ ] Criar `pages/PortalInstitucionalPage.tsx` com placeholder:
  ```tsx
  export default function PortalInstitucionalPage() {
    return (
      <main>
        <PageHeader title="Portal Institucional" icon="pi-globe" />
        <p className="text-color-secondary">Em desenvolvimento.</p>
      </main>
    );
  }
  ```
- [ ] Adicionar rotas do Parlamentar expandidas:
  ```tsx
  <Route path="/parlamentar/perfil"     element={<ParlamentarPerfilPage />} />
  <Route path="/parlamentar/biografia"  element={<ParlamentarBiografiaPage />} />
  <Route path="/parlamentar/dashboard"  element={<ParlamentarDashboardPage />} />
  ```

---

## PROBLEMA 2 — Filtros em coluna em vez de row

### Por que acontece

`className="grid p-fluid"` do PrimeReact empilha elementos verticalmente.
O documento define filtros em **linha horizontal** (row), com campos lado a lado.

### Padrão correto — FiltroLayout em row

#### T-05 · Reescrever `components/common/FiltroLayout.tsx`

```tsx
// O layout correto usa flex-row com wrap — campos ficam lado a lado
// e quebram para próxima linha naturalmente quando não há espaço

interface FiltroLayoutProps {
  children: React.ReactNode;
  onBuscar: () => void;
  onLimpar: () => void;
  loading?: boolean;
}

export function FiltroLayout({ children, onBuscar, onLimpar, loading }: FiltroLayoutProps) {
  return (
    <Card className="sigl-filtro-card mb-3">
      {/* ROW de filtros — flex horizontal com wrap */}
      <div className="flex flex-row flex-wrap gap-3 align-items-end">
        {children}
        {/* Botões ficam no fim da mesma row */}
        <div className="flex gap-2 align-items-end" style={{ marginLeft: 'auto' }}>
          <Button
            label="Limpar"
            severity="secondary"
            icon="pi pi-times"
            size="small"
            onClick={onLimpar}
            disabled={loading}
          />
          <Button
            label="Pesquisar"
            icon="pi pi-search"
            size="small"
            onClick={onBuscar}
            loading={loading}
          />
        </div>
      </div>
    </Card>
  );
}
```

#### T-06 · Padrão de campo de filtro em row

Cada campo dentro do `FiltroLayout` deve usar este padrão:

```tsx
// Largura mínima para que fiquem lado a lado no desktop
// No mobile (<768px) cada campo ocupa 100% da linha

<div className="sigl-filtro-campo">
  <label htmlFor="tipo">Tipo</label>
  <Dropdown id="tipo" ... />
</div>
```

```css
/* styles/sigl-ui-patterns.css */
.sigl-filtro-campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 180px;
  flex: 1 1 180px;   /* cresce mas nunca fica menor que 180px */
  max-width: 280px;  /* evita que um campo tome a linha toda */
}

/* Mobile: campos empilham */
@media (max-width: 768px) {
  .sigl-filtro-campo {
    min-width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
  }
  /* Botões ocupam linha própria no mobile */
  .sigl-filtro-card .flex[style*="margin-left: auto"] {
    margin-left: 0 !important;
    width: 100%;
    justify-content: flex-end;
  }
}

.sigl-filtro-card .p-card-body {
  padding: 1rem;
}
```

#### T-07 · Exemplo de uso correto em MateriasPage

```tsx
// Como usar FiltroLayout com campos em row:
<FiltroLayout onBuscar={buscar} onLimpar={limparFiltros} loading={loading}>
  <div className="sigl-filtro-campo">
    <label htmlFor="tipo">Tipo</label>
    <Dropdown id="tipo" value={filtros.tipoId} options={tiposMateria}
      onChange={e => setFiltros(f => ({ ...f, tipoId: e.value }))}
      placeholder="Todos" showClear />
  </div>

  <div className="sigl-filtro-campo">
    <label htmlFor="ementa">Ementa</label>
    <InputText id="ementa" value={filtros.ementa ?? ''}
      onChange={e => setFiltros(f => ({ ...f, ementa: e.target.value }))}
      placeholder="Contém..." />
  </div>

  <div className="sigl-filtro-campo">
    <label htmlFor="protocolo">Núm. Protocolo</label>
    <InputText id="protocolo" value={filtros.numeroProtocolo ?? ''}
      onChange={e => setFiltros(f => ({ ...f, numeroProtocolo: e.target.value }))} />
  </div>

  <div className="sigl-filtro-campo">
    <label htmlFor="ano">Ano</label>
    <Dropdown id="ano" value={filtros.ano} options={anos}
      onChange={e => setFiltros(f => ({ ...f, ano: e.value }))}
      placeholder="Todos" showClear />
  </div>

  <div className="sigl-filtro-campo">
    <label>Data Apresentação</label>
    <Calendar value={filtros.dataApresentacao} onChange={e => ...}
      selectionMode="range" placeholder="Inicial — Final"
      showIcon dateFormat="dd/mm/yy" />
  </div>

  <div className="sigl-filtro-campo">
    <label>Data Publicação</label>
    <Calendar value={filtros.dataPublicacao} onChange={e => ...}
      selectionMode="range" placeholder="Inicial — Final"
      showIcon dateFormat="dd/mm/yy" />
  </div>

  <div className="sigl-filtro-campo">
    <label htmlFor="tipoAutor">Tipo de Autor</label>
    <Dropdown id="tipoAutor" value={filtros.tipoAutorId} options={tiposAutor}
      onChange={e => setFiltros(f => ({ ...f, tipoAutorId: e.value }))}
      placeholder="Todos" showClear />
  </div>

  <div className="sigl-filtro-campo">
    <label htmlFor="autor">Autor</label>
    <InputText id="autor" value={filtros.autor ?? ''}
      onChange={e => setFiltros(f => ({ ...f, autor: e.target.value }))}
      placeholder="Nome do autor" />
  </div>
</FiltroLayout>
```

- [ ] Atualizar `FiltroLayout.tsx` com layout flex-row
- [ ] Adicionar `.sigl-filtro-campo` em `styles/sigl-ui-patterns.css`
- [ ] Aplicar padrão em **todas as pages** que têm filtros:
  - MateriasPage ✅ (atualizar)
  - NormasPage ✅ (atualizar)
  - AtosPage ✅ (atualizar)
  - SessoesPage ✅ (atualizar)
  - AgendaPage ✅ (atualizar)
  - ParlamentarMateriasPage ✅ (aplicar desde o início)

---

## PROBLEMA 3 — Rotas frontend não alinhadas ao backend

### Mapa completo: rota frontend → endpoint backend

#### T-08 · Reescrever `api/paths.ts` completamente

```ts
// api/paths.ts — fonte única de verdade para todas as URLs da API
// Prefixo /api é adicionado pelo client.ts ou proxy Vite

export const API_PATHS = {
  // ── Auth ──────────────────────────────────────────────────────────────
  authLogin:   '/auth/login',
  authMe:      '/auth/me',

  // ── Dominios (lookups) ────────────────────────────────────────────────
  dominios:    '/dominios',

  // ── Identidade ────────────────────────────────────────────────────────
  usuarios:           '/identidade/usuarios',
  autoresExternos:    '/identidade/autores-externos',

  // ── Legislativo — base ────────────────────────────────────────────────
  legislaturas:       '/legislative/legislaturas',
  parlamentares:      '/legislative/parlamentares',
  partidosPoliticos:  '/legislative/partidos-politicos',
  comissoes:          '/legislative/comissoes',
  frentes:            '/legislative/frentes-parlamentares',
  mesaDiretora:       '/legislative/mesa-diretora',

  // ── Matérias ──────────────────────────────────────────────────────────
  materias:           '/legislative/materias',
  materiaTramitar:    (id: string) => `/legislative/materias/${id}/tramitar`,
  materiaAutores:     (id: string) => `/legislative/materias/${id}/autores`,
  materiaAutor:       (id: string, autorId: string) => `/legislative/materias/${id}/autores/${autorId}`,
  materiaPublicacoes: (id: string) => `/legislative/materias/${id}/publicacoes`,
  materiaTramitacao:  (id: string) => `/legislative/materias/${id}/tramitacao`,

  // ── Sessões Plenárias ─────────────────────────────────────────────────
  sessoes:            '/legislative/sessoes-plenarias',
  sessaoAbrir:        (id: string) => `/legislative/sessoes-plenarias/${id}/abrir`,
  sessaoSuspender:    (id: string) => `/legislative/sessoes-plenarias/${id}/suspender`,
  sessaoEncerrar:     (id: string) => `/legislative/sessoes-plenarias/${id}/encerrar`,
  sessaoCancelar:     (id: string) => `/legislative/sessoes-plenarias/${id}/cancelar`,
  sessaoQuorum:       (id: string) => `/legislative/sessoes-plenarias/${id}/quorum`,
  sessaoPauta:        (id: string) => `/legislative/sessoes-plenarias/${id}/pauta`,
  sessaoPautaPublicar:(id: string) => `/legislative/sessoes-plenarias/${id}/pauta/publicar`,
  sessaoPresencas:    (id: string) => `/legislative/sessoes-plenarias/${id}/presencas`,

  // ── Votações ──────────────────────────────────────────────────────────
  votacoes:           '/legislative/votacoes',
  votacaoVotos:       (id: string) => `/legislative/votacoes/${id}/votos`,
  votacaoEncerrar:    (id: string) => `/legislative/votacoes/${id}/encerrar`,

  // ── Agenda ────────────────────────────────────────────────────────────
  agenda:             '/legislative/agenda-legislativa',
  agendaVincularSessao:(id: string) => `/legislative/agenda-legislativa/${id}/vincular-sessao`,

  // ── Normas Jurídicas ─────────────────────────────────────────────────
  normas:             '/legislative/normas',
  normaPublica:       '/public/normas',
  normaSancao:        (id: string) => `/legislative/normas/${id}/sancao`,
  normaVeto:          (id: string) => `/legislative/normas/${id}/veto`,
  normaPromulgacao:   (id: string) => `/legislative/normas/${id}/promulgacao`,
  normaPublicacao:    (id: string) => `/legislative/normas/${id}/publicacao`,
  normaRevogar:       (id: string) => `/legislative/normas/${id}/revogar`,

  // ── Atos Administrativos ─────────────────────────────────────────────
  atos:               '/atos',   // sem prefixo legislative — rota raiz do backend

  // ── Relatórios ────────────────────────────────────────────────────────
  relatorioAtividade: '/relatorios/atividade-legislativa/completo',
  relatorioPresenca:  '/relatorios/presenca',

  // ── Público (sem auth) ────────────────────────────────────────────────
  publicAgenda:       '/public/agenda',
  publicNormas:       '/public/normas',
} as const;
```

- [ ] Substituir `api/paths.ts` inteiro pelo conteúdo acima
- [ ] **Remover** paths deprecated:
  - `/auth/login-camara` — não existe mais
  - `/guest-users` — substituído por `/identidade/autores-externos`
  - `/normas` raiz — agora é `/legislative/normas`

#### T-09 · Atualizar todos os módulos api/*.api.ts com os novos paths

- [ ] `materias.api.ts` → usar `API_PATHS.materias`, `API_PATHS.materiaTramitar(id)` etc.
- [ ] `sessoes.api.ts` → usar `API_PATHS.sessoes`, `API_PATHS.sessaoAbrir(id)` etc.
- [ ] `normas.api.ts` → usar `API_PATHS.normas` (não `/normas` direto)
- [ ] `atos.api.ts` → usar `API_PATHS.atos`
- [ ] `autores-externos.api.ts` → usar `API_PATHS.autoresExternos`
- [ ] `agenda.api.ts` → usar `API_PATHS.agenda`
- [ ] Remover `guest-users.api.ts` (deprecated — AutorExterno substitui)

#### T-10 · Alinhar rotas do React Router com os paths de API

A confusão entre **rota do frontend** (URL do browser) e **path da API** precisa ser clarificada:

```
URL do browser          → endpoint da API
/materias               → GET /api/legislative/materias
/sessoes                → GET /api/legislative/sessoes-plenarias
/normas-juridicas       → GET /api/legislative/normas
/atos-administrativos   → GET /api/atos
/agenda                 → GET /api/legislative/agenda-legislativa
/camara/autores         → GET /api/identidade/autores-externos
/parlamentar/materias   → GET /api/legislative/materias?authorParliamentarianId=:id
```

As rotas do browser **não precisam** espelhar os paths da API. O que importa é que
os módulos `*.api.ts` usem os paths corretos internamente.

- [ ] Confirmar que `App.tsx` tem todas as rotas do browser mapeadas:
  ```tsx
  // Rotas Staff — verificar que todas existem
  /                         → DashboardPage
  /sessoes                  → SessoesPage           ✅ (já existe)
  /materias                 → MateriasPage           ✅
  /normas-juridicas         → NormasPage             ✅
  /atos-administrativos     → AtosPage               ✅
  /camara/parlamentares     → ParlamentaresPage      ✅
  /camara/mesa-diretora     → MesaDiretoraPage       ✅
  /camara/comissoes         → ComissoesPage          ✅
  /camara/frentes           → FrentesPage            ✅
  /camara/autores           → AutoresPage            ✅  (usar AutorExterno, não GuestUser)
  /agenda                   → AgendaPage             ✅
  /relatorios               → RelatoriosPage         ✅
  /camara/portal            → PortalInstitucionalPage ← NOVO (criar)
  /usuarios                 → UsuariosPage           ✅ (guard AdminRoute)

  // Rotas Parlamentar
  /parlamentar/perfil       → ParlamentarPerfilPage
  /parlamentar/biografia    → ParlamentarBiografiaPage ← NOVO
  /parlamentar/dashboard    → ParlamentarDashboardPage ← NOVO
  /parlamentar/materias     → ParlamentarMateriasPage
  /parlamentar/comissoes    → ParlamentarComissoesPage
  /parlamentar/mandato      → ParlamentarMandatoPage
  /parlamentar/filiacao     → ParlamentarFiliacaoPage
  ```

#### T-11 · Verificação de alinhamento backend ↔ frontend

- [ ] Criar `api/__tests__/paths.sanity.test.ts`:

```ts
// Teste simples que garante que os paths não têm typos óbvios
import { API_PATHS } from '../paths';

describe('API_PATHS sanity', () => {
  it('todos os paths estáticos começam com /', () => {
    Object.entries(API_PATHS).forEach(([key, value]) => {
      if (typeof value === 'string') {
        expect(value).toMatch(/^\//), `${key}: "${value}" deve começar com /`);
      }
    });
  });

  it('paths de funções retornam string com id embutido', () => {
    expect(API_PATHS.materiaTramitar('abc')).toBe('/legislative/materias/abc/tramitar');
    expect(API_PATHS.sessaoAbrir('xyz')).toBe('/legislative/sessoes-plenarias/xyz/abrir');
    expect(API_PATHS.normaSancao('123')).toBe('/legislative/normas/123/sancao');
  });
});
```

---

## Checklist final

### Sidebar
- [ ] Itens na ordem exata do documento operacional (Dashboard → Câmara Gestão)
- [ ] "Câmara Gestão" é accordion colapsável com Portal Institucional + Usuários
- [ ] "Usuários" visível apenas para `isAdminStaff`
- [ ] Parlamentar View: "Perfil" expandível com 3 sub-itens (Perfil Parlamentar, Biografia, Dashboard)
- [ ] `aria-expanded` nos itens accordion
- [ ] `aria-current="page"` no item ativo

### Filtros
- [ ] `FiltroLayout` usa `flex flex-row flex-wrap gap-3 align-items-end`
- [ ] Campos com `sigl-filtro-campo` (min-width: 180px, flex: 1 1 180px)
- [ ] Botões alinhados no final da row com `marginLeft: auto`
- [ ] Mobile: campos empilham verticalmente
- [ ] Aplicado em MatériasPage, NormasPage, AtosPage, SessoesPage, AgendaPage

### Rotas e API
- [ ] `api/paths.ts` reescrito com paths corretos
- [ ] `normasApi` usa `/legislative/normas` (não `/normas`)
- [ ] `agendaApi` usa `/legislative/agenda-legislativa`
- [ ] `sessoesApi` usa `/legislative/sessoes-plenarias`
- [ ] `autoresExternosApi` usa `/identidade/autores-externos`
- [ ] `guest-users.api.ts` removido ou deprecado
- [ ] `/auth/login-camara` removido de paths.ts
- [ ] Todos os endpoints de ciclo de vida mapeados (tramitar, abrir, encerrar, sancao...)
- [ ] Teste de sanidade `paths.sanity.test.ts` passando
- [ ] `npm run build` sem erros TypeScript
