# PATTERNS-FE.md — Padrões de Código Frontend

Padrões estabelecidos. Seguir sempre. Qualquer desvio precisa de justificativa explícita.

---

## Pattern 1 — Módulo API

```ts
// api/legislative/normas.api.ts
import { api, apiList } from '../client';
import { API_PATHS } from '../paths';

export interface Norma {
  id: string;
  tipo: { id: string; nome: string };
  numero: string;
  ano: number;
  ementa: string;
  statusDerived: 'EM_TRAMITE' | 'SANCIONADA' | 'VETADA' | 'PROMULGADA' | 'PUBLICADA' | 'VIGENTE' | 'REVOGADA';
  dataSancao?: string;
  dataVeto?: string;
  dataPromulgacao?: string;
  dataPublicacao?: string;
  dataVigencia?: string;
  dataRevogacao?: string;
  complementar: boolean;
  textoIntegralUrl?: string;
  audioUrl?: string;
}

export interface CreateNormaDto {
  tipoId: string;
  numero: string;
  anoId: string;
  esferaFederacaoId: string;
  ementa: string;
  complementar?: boolean;
  materiaOrigemId?: string;
  dataPublicacao?: string;
  veiculoPublicacao?: string;
  paginaInicio?: number;
  paginaFim?: number;
  identificadorId?: string;
  urlExternaPublicacao?: string;
}

export interface NormaFiltros {
  tipoId?: string;
  numero?: string;
  ano?: number;
  dataInicio?: string;
  dataFim?: string;
  dataPublicacaoInicio?: string;
  dataPublicacaoFim?: string;
  esferaFederacaoId?: string;
  ementa?: string;
  page?: number;
  limit?: number;
}

export const normasApi = {
  list: (filtros?: NormaFiltros) =>
    apiList<Norma>(API_PATHS.normas, filtros),

  getById: (id: string) =>
    api<Norma>(`${API_PATHS.normas}/${id}`),

  create: (dto: CreateNormaDto) =>
    api<Norma>(API_PATHS.normas, { method: 'POST', body: JSON.stringify(dto) }),

  update: (id: string, dto: Partial<CreateNormaDto>) =>
    api<Norma>(`${API_PATHS.normas}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

  remove: (id: string) =>
    api<void>(`${API_PATHS.normas}/${id}`, { method: 'DELETE' }),

  registrarSancao: (id: string, dataSancao: string) =>
    api<Norma>(`${API_PATHS.normas}/${id}/sancao`, {
      method: 'POST', body: JSON.stringify({ dataSancao }),
    }),

  registrarVeto: (id: string, dto: { dataVeto: string; tipoVeto: string; motivoVeto?: string }) =>
    api<Norma>(`${API_PATHS.normas}/${id}/veto`, {
      method: 'POST', body: JSON.stringify(dto),
    }),
};
```

---

## Pattern 2 — Upload de arquivo (`apiFormData`)

```ts
// api/client.ts — adicionar função
export async function apiFormData<T>(
  path: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
    // Não setar Content-Type — browser define boundary automaticamente
  });
  if (!res.ok) {
    if (res.status === 401) { window.location.href = '/login'; }
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message ?? 'Erro desconhecido', res.status, err);
  }
  return res.json();
}
```

**Uso em componente:**
```tsx
const handleSubmit = async () => {
  const fd = new FormData();
  fd.append('tipoId', form.tipoId);
  fd.append('ementa', form.ementa);
  if (form.textoOriginal) fd.append('textoOriginal', form.textoOriginal);
  await apiFormData('/legislative/materias', fd);
};
```

---

## Pattern 3 — FiltroLayout (Card de filtros)

```tsx
// components/common/FiltroLayout.tsx
interface FiltroLayoutProps {
  children: React.ReactNode;
  onBuscar: () => void;
  onLimpar: () => void;
  loading?: boolean;
}

export function FiltroLayout({ children, onBuscar, onLimpar, loading }: FiltroLayoutProps) {
  return (
    <Card className="mb-3 sigl-filtro-card">
      <div className="grid p-fluid">
        {children}
      </div>
      <div className="flex justify-content-end gap-2 mt-3">
        <Button
          label="Limpar"
          severity="secondary"
          icon="pi pi-times"
          onClick={onLimpar}
          disabled={loading}
        />
        <Button
          label="Pesquisar"
          icon="pi pi-search"
          onClick={onBuscar}
          loading={loading}
        />
      </div>
    </Card>
  );
}
```

**Uso:**
```tsx
<FiltroLayout onBuscar={buscar} onLimpar={limparFiltros} loading={loading}>
  <div className="col-12 md:col-4 lg:col-3">
    <label htmlFor="tipo">Tipo</label>
    <Dropdown id="tipo" options={tiposNorma} ... />
  </div>
  <div className="col-12 md:col-4 lg:col-3">
    <label htmlFor="numero">Número</label>
    <InputText id="numero" ... />
  </div>
</FiltroLayout>
```

---

## Pattern 4 — DataTableLayout

```tsx
// components/common/DataTableLayout.tsx
interface DataTableLayoutProps<T> {
  items: T[];
  total: number;
  loading: boolean;
  page: number;
  limit?: number;
  onPageChange: (page: number) => void;
  columns: React.ReactNode;  // <Column> elements
  canWrite?: boolean;
  onVer?: (item: T) => void;
  onEditar?: (item: T) => void;
  onDeletar?: (item: T) => void;
}

export function DataTableLayout<T>({
  items, total, loading, page, limit = 20,
  onPageChange, columns, canWrite,
  onVer, onEditar, onDeletar,
}: DataTableLayoutProps<T>) {
  return (
    <DataTable
      value={items}
      size="small"
      paginator
      rows={limit}
      totalRecords={total}
      first={(page - 1) * limit}
      onPage={(e) => onPageChange(Math.floor(e.first / limit) + 1)}
      lazy
      loading={loading}
      sortField="createdAt"
      sortOrder={-1}
      emptyMessage="Nenhum registro encontrado"
      className="sigl-datatable"
    >
      {columns}
      <Column
        header="Ações"
        style={{ width: '8rem' }}
        body={(row: T) => (
          <div className="flex gap-1">
            {onVer && (
              <Button
                icon="pi pi-eye"
                rounded text size="small"
                aria-label="Ver detalhes"
                onClick={() => onVer(row)}
              />
            )}
            {canWrite && onEditar && (
              <Button
                icon="pi pi-pencil"
                rounded text size="small"
                aria-label="Editar"
                onClick={() => onEditar(row)}
              />
            )}
            {canWrite && onDeletar && (
              <Button
                icon="pi pi-trash"
                rounded text size="small"
                severity="danger"
                aria-label="Deletar"
                onClick={() => onDeletar(row)}
              />
            )}
          </div>
        )}
      />
    </DataTable>
  );
}
```

---

## Pattern 5 — Dialog Deletar (confirmação)

```tsx
// components/common/DeleteDialog.tsx
interface DeleteDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteDialog({ visible, title, message, onConfirm, onClose }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showApiError } = useAppToast();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      showSuccess('Registro excluído com sucesso');
      onClose();
    } catch (err) {
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog header={title} visible={visible} onHide={onClose} style={{ width: '400px' }}>
      <p>{message}</p>
      <div className="flex justify-content-end gap-2 mt-3">
        <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
        <Button label="Excluir" severity="danger" icon="pi pi-trash" onClick={handleConfirm} loading={loading} />
      </div>
    </Dialog>
  );
}
```

---

## Pattern 6 — usePermissions (roles novo backend)

```ts
// hooks/usePermissions.ts — atualizar para TenantUserRole
import { useAuth } from '../contexts/AuthContext';

export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

export function usePermissions() {
  const { user } = useAuth();

  const role = user?.role as TenantUserRole | undefined;

  return {
    // Escrita total: ADMIN_STAFF e STAFF podem criar
    canWrite: role === 'ADMIN_STAFF' || role === 'STAFF',

    // Editar e deletar: apenas ADMIN_STAFF
    canEdit: role === 'ADMIN_STAFF',
    canDelete: role === 'ADMIN_STAFF',

    // Ações de sessão (iniciar, encerrar): ADMIN_STAFF e STAFF
    canManageSessao: role === 'ADMIN_STAFF' || role === 'STAFF',

    // Votar: exclusivo do PARLIAMENTARIAN
    canVotar: role === 'PARLIAMENTARIAN',

    // Gerenciar pessoas: apenas ADMIN_STAFF
    canManagePessoas: role === 'ADMIN_STAFF',

    // Plataforma SIGL (antigo isMaster)
    isMaster: user?.authType === 'sigl' && user?.role === 'MASTER',

    isReadOnly: role === 'PARLIAMENTARIAN',
    role,
  };
}
```

---

## Pattern 7 — Lazy loading de rotas

```tsx
// App.tsx — todas as rotas devem ser lazy
const MateriasPage = React.lazy(() => import('./pages/MateriasPage'));
const NormasPage = React.lazy(() => import('./pages/NormasPage'));
const AtosPage = React.lazy(() => import('./pages/AtosPage'));
// ... todas as 16 páginas

// No JSX:
<Suspense fallback={<ProgressSpinner />}>
  <Routes>
    <Route path="/materias" element={<MateriasPage />} />
    <Route path="/normas-juridicas" element={<NormasPage />} />
  </Routes>
</Suspense>
```

---

## Pattern 8 — Responsividade mobile-first

```tsx
// Grid PrimeReact — sempre mobile-first
<div className="grid p-fluid">
  {/* mobile: 100%, tablet: 50%, desktop: 33% */}
  <div className="col-12 md:col-6 lg:col-4">
    <label>Campo</label>
    <InputText />
  </div>
</div>

// Tipografia — sempre rem
// styles/typography.css
.sigl-page-title { font-size: 1.5rem; }
.sigl-label      { font-size: 0.875rem; }
.sigl-small      { font-size: 0.75rem; }

// Imagens fluidas
img { max-width: 100%; height: auto; }
```

---

## Pattern 9 — Acessibilidade

```tsx
// Botões de ação com aria-label (sem texto visível)
<Button icon="pi pi-eye"    rounded text aria-label="Ver detalhes da matéria" />
<Button icon="pi pi-pencil" rounded text aria-label="Editar matéria" />
<Button icon="pi pi-trash"  rounded text aria-label="Excluir matéria" />

// Campos de formulário com htmlFor
<label htmlFor="tipo-materia">Tipo de Matéria *</label>
<Dropdown id="tipo-materia" ... />

// Toast acessível (PrimeReact já tem aria-live)
// Não precisa adicionar aria-live manual

// Estrutura semântica de página
<main>
  <header><PageHeader /></header>
  <section aria-label="Filtros de pesquisa"><FiltroLayout /></section>
  <section aria-label="Lista de matérias"><DataTableLayout /></section>
</main>
```
