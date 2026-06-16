# CLAUDE-FRONTEND.md — GestaoVereadores / Frontend

Lido automaticamente pelo Claude Code em toda sessão de frontend.

---

## Stack

```
React 19 + TypeScript + Vite 6
React Router 7
PrimeReact 10 + PrimeIcons
CSS Variables (styles/)
```

## Estrutura real de src/

```
src/
├── main.tsx                     # Bootstrap: PrimeReact, Router, AuthProvider
├── App.tsx                      # Rotas
├── index.css                    # App-shell, sidebar, layout global
├── app/
│   ├── navigation.ts            # ROUTES, SIDEBAR_NAV_GROUPS, MODULE_ICONS
│   ├── platform.ts              # Metadados SIGL
│   └── publicacao.ts            # Pipeline Normas/Atos
├── api/
│   ├── client.ts                # api(), apiList(), apiTotal(), authApi
│   ├── paths.ts                 # API_PATHS
│   ├── dominios.api.ts
│   ├── guest-users.api.ts
│   └── legislative/
│       ├── materias.api.ts
│       ├── sessoes.api.ts
│       ├── parlamentares.api.ts
│       ├── comissoes.api.ts
│       ├── frentes.api.ts
│       ├── mesa-diretora.api.ts
│       ├── legislaturas.api.ts
│       └── agenda.api.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── LegislaturaContext.tsx
├── hooks/
│   ├── usePermissions.ts        # canWrite, isMaster, isReadOnly
│   ├── useDominios.ts           # cache GET /dominios
│   └── useAppToast.tsx
├── types/
│   ├── auth.ts
│   └── legislative.ts
├── utils/
├── pages/                       # 16 telas
├── components/
│   ├── common/
│   ├── workflow/
│   ├── publicacao/
│   ├── sessoes/
│   ├── camara/
│   └── forms/
└── styles/
    ├── prime-theme-tokens.css
    ├── typography.css
    ├── spacing-layout.css
    ├── prime-overrides.css
    └── sigl-ui-patterns.css
```

---

## Regras absolutas de arquitetura

### Organização
1. **Chamadas HTTP só em `api/`** — páginas e componentes nunca importam `fetch` diretamente
2. **`api/paths.ts`** é a fonte única de URLs — nunca hardcodar `/api/...` em componente
3. **Um arquivo `*.api.ts` por bounded context** — `normas.api.ts`, `atos.api.ts` (criar se não existir)
4. **Hooks para lógica reutilizável** — estado derivado de múltiplos contextos vai em hook, não em componente

### Componentes
5. **Padrão de página:** `FiltroLayout` + `DataTableLayout` + 4 dialogs (Ver, Criar, Editar, Deletar)
6. **`FiltroLayout`** — mesmo visual em todas as páginas (card PrimeReact com `p-fluid`)
7. **`DataTableLayout`** — `<DataTable size="small">` com `paginator`, `sortable`, `lazy`
8. **Dialogs** — usar `<Dialog>` PrimeReact; nunca navegação de rota para criar/editar
9. **`canWrite`** de `usePermissions` desabilita botões de escrita para perfil somente-leitura
10. **`showSuccess` / `showApiError`** de `useAppToast` em toda ação assíncrona

### Roles e visibilidade
11. **Botões Editar e Deletar** visíveis apenas para `ADMIN_STAFF` — usar `canWrite` ou checar `role`
12. **Atos Administrativos** ocultos quando `authType === 'camara'` — já existe `showAdministrativo` no Layout
13. **Rota `/usuarios`** — guard `MasterRoute` (role MASTER, authType !== 'camara')

### Performance
14. **Lazy loading** em todas as rotas: `React.lazy()` + `<Suspense>`
15. **`useDominios`** carregado uma vez por sessão — não chamar API de lookups dentro de componente
16. **DataTable lazy** com paginação server-side para listas grandes
17. **`apiFormData()`** para upload de arquivo (criar em `client.ts` se não existir)

### Responsividade (mobile-first)
18. **Grid PrimeReact:** `className="col-12 md:col-6 lg:col-4"` — nunca widths fixas em px
19. **Tipografia em `rem`** — nunca `font-size` em px
20. **`max-width: 100%; height: auto`** em todas as imagens
21. **Sidebar colapsável** em mobile — já existe `NavDrawer`

### Acessibilidade
22. **HTML semântico:** `<main>`, `<nav>`, `<header>`, `<footer>` nas estruturas corretas
23. **`aria-label`** em botões de ação (olho, lápis, trash) que não têm texto visível
24. **Contraste mínimo** WCAG AA — nunca remover `outline` de foco sem alternativa visual
25. **`aria-live`** em mensagens de toast/erro para leitores de tela

### Código
26. **TypeScript strict** — sem `any`; tipos de response do backend em `types/`
27. **Componentes funcionais + hooks** — sem class components
28. **Props tipadas** — interface ou type para todo componente com props
29. **Mensagens de erro em português** — `apiErrorMessage.ts` formata erros da API

---

## Padrões de página (obrigatório seguir)

### Estrutura padrão de uma page
```tsx
// pages/MateriasPage.tsx — exemplo canônico
export default function MateriasPage() {
  // 1. Hooks de estado
  const { canWrite } = usePermissions();
  const { showSuccess, showApiError } = useAppToast();
  const { tiposMateria, tiposAutor } = useDominios();

  // 2. Estado local: filtros, paginação, dialogs
  const [filtros, setFiltros] = useState<MateriaFiltros>({});
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Materia[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dialogCriar, setDialogCriar] = useState(false);
  const [dialogEditar, setDialogEditar] = useState<Materia | null>(null);
  const [dialogVer, setDialogVer] = useState<Materia | null>(null);
  const [dialogDeletar, setDialogDeletar] = useState<Materia | null>(null);

  // 3. Busca (dispara ao mudar filtros ou página)
  const buscar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await materiasApi.list({ ...filtros, page, limit: 20 });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => { buscar(); }, [buscar]);

  // 4. Render
  return (
    <main>
      <PageHeader title="Matérias" icon="pi-file" />
      <PesquisaFiltersCard filtros={filtros} onChange={setFiltros} onBuscar={buscar} />
      <DataTableLayout
        items={items} total={total} loading={loading}
        page={page} onPageChange={setPage}
        canWrite={canWrite}
        onVer={setDialogVer}
        onEditar={canWrite ? setDialogEditar : undefined}
        onDeletar={canWrite ? setDialogDeletar : undefined}
      />
      {dialogCriar && <MateriaCreateDialog onClose={() => setDialogCriar(false)} onSaved={buscar} />}
      {dialogEditar && <MateriaEditDialog item={dialogEditar} onClose={() => setDialogEditar(null)} onSaved={buscar} />}
      {dialogVer && <MateriaVerDialog item={dialogVer} onClose={() => setDialogVer(null)} />}
      {dialogDeletar && <MateriaDeleteDialog item={dialogDeletar} onClose={() => setDialogDeletar(null)} onDeleted={buscar} />}
    </main>
  );
}
```

### Estrutura de filtros (FiltroLayout)
```tsx
// Mesmo padrão visual em TODAS as páginas
<Card className="mb-3">
  <div className="grid p-fluid">
    <div className="col-12 md:col-4">
      <label>Tipo</label>
      <Dropdown options={tiposMateria} ... />
    </div>
    {/* demais filtros */}
  </div>
  <div className="flex justify-content-end gap-2 mt-3">
    <Button label="Limpar" severity="secondary" onClick={limparFiltros} />
    <Button label="Pesquisar" icon="pi pi-search" onClick={buscar} />
  </div>
</Card>
```

### Estrutura de DataTable (DataTableLayout)
```tsx
<DataTable
  value={items}
  size="small"
  paginator
  rows={20}
  totalRecords={total}
  lazy
  loading={loading}
  sortField="createdAt"
  sortOrder={-1}
  emptyMessage="Nenhum registro encontrado"
>
  {/* colunas */}
  <Column
    header="Ações"
    body={(row) => (
      <div className="flex gap-2">
        <Button icon="pi pi-eye" rounded text aria-label="Ver" onClick={() => onVer(row)} />
        {canWrite && <Button icon="pi pi-pencil" rounded text aria-label="Editar" onClick={() => onEditar(row)} />}
        {canWrite && <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Deletar" onClick={() => onDeletar(row)} />}
      </div>
    )}
  />
</DataTable>
```

---

## APIs existentes vs. a criar

### Já existem
`materiasApi`, `sessoesApi`, `parlamentaresApi`, `comissoesApi`, `frentesApi`,
`mesaDiretoraApi`, `legislaturasApi`, `agendaApi`, `guestUsersApi`, `dominiosApi`

### A criar (TASK-FE-001)
- `normas.api.ts` — extrair de chamadas inline em `NormasPage`
- `atos.api.ts` — extrair de chamadas inline em `AtosPage`
- `autores-externos.api.ts` — novo endpoint backend (AutorExterno, TASK-001 M3)
- `apiFormData()` em `client.ts` — para upload de arquivo (Texto Original, Anexo)

### Novos paths a adicionar em `paths.ts`
```ts
'/legislative/materias/autores-externos'  // novo
'/legislative/normas'                      // já existe mas sem wrapper
'/atos'                                    // já existe mas sem wrapper
'/legislative/materias/:id/tramitar'       // novo (ciclo de vida)
'/legislative/sessoes-plenarias/:id/abrir'
'/legislative/sessoes-plenarias/:id/encerrar'
```

---

## Status atual por página

| Página | Status | O que falta |
|--------|--------|-------------|
| LoginPage | ✅ OK | — |
| DashboardPage | ✅ OK | — |
| MateriasPage | 🔄 Parcial | protocolar multipart, AutorExterno, múltiplos relatores, status PROTOCOLADA/EM_PAUTA |
| SessoesPage | ✅ OK | abrir/encerrar via novo StatusSessao |
| AgendaPage | 🔄 Básico | local, sessaoPlenariaId, recorrência |
| NormasPage | 🔄 Sem wrapper | normas.api.ts, ciclo jurídico (sanção/veto/promulgação) |
| AtosPage | 🔄 Sem wrapper | atos.api.ts, ementa, dataAto, anexoUrl |
| AutoresPage | 🔄 Desatualizada | substituir GuestUser por AutorExterno |
| ParlamentaresPage | ✅ CRUD | — |
| ComissoesPage | ✅ CRUD | — |
| FrentesPage | 🔄 Parcial | list/create apenas |
| MesaDiretoraPage | ✅ CRUD | — |
| LegislaturasPage | ✅ OK | — |
| UsuariosPage | ✅ OK | roles novo enum TenantUserRole |
| RelatoriosPage | ✅ OK | — |

---

## Referências

| O que fazer | Arquivo |
|---|---|
| Fundação e infraestrutura | `frontend/docs/tasks/TASK-FE-001-fundacao.md` |
| Matérias completo | `frontend/docs/tasks/TASK-FE-002-materias.md` |
| Sessões e votações | `frontend/docs/tasks/TASK-FE-003-sessoes-votacoes.md` |
| Normas e Atos | `frontend/docs/tasks/TASK-FE-004-normas-atos.md` |
| Autores Externos | `frontend/docs/tasks/TASK-FE-005-autores-externos.md` |
| Agenda e Roles | `frontend/docs/tasks/TASK-FE-006-agenda-roles.md` |
| Padrões visuais | `frontend/docs/architecture/PATTERNS-FE.md` |
