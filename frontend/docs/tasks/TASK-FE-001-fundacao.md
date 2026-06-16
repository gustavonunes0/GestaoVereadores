# TASK-FE-001 — Fundação: APIs, Tipos, Hooks e Infraestrutura

**Leia antes:** `frontend/docs/CLAUDE-FRONTEND.md` + `frontend/docs/architecture/PATTERNS-FE.md`
**Depende de:** Backend TASK-006 (roles) e TASK-001 (migrations) concluídas
**Bloqueia:** Todas as outras tasks FE — executar primeiro

> Esta task cria a infraestrutura que todas as outras pages vão usar.
> Nenhuma page deve ser tocada antes desta task estar com [x] em todos os itens.

---

## Fase 1 — Tipos TypeScript

### T-01 · Atualizar `types/auth.ts` com TenantUserRole

- [x] Adicionar enum de roles do backend novo:
```ts
export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

// Manter compatibilidade com roles legados SIGL
export type SiglRole = 'MASTER' | 'ADMIN' | 'OPERADOR';
export type CamaraRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'VIEWER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  authType: 'sigl' | 'camara';
  // Roles
  role?: TenantUserRole | SiglRole;
  tenantId?: string;
  tenantUserId?: string;
  parliamentarianId?: string;  // preenchido se role === PARLIAMENTARIAN
}
```

### T-02 · Atualizar `types/legislative.ts` com novos status

- [x] Adicionar status ausentes:
```ts
export const MATERIA_STATUS = {
  DRAFT: 'Rascunho',
  PROTOCOLADA: 'Protocolada',       // estava faltando
  EM_TRAMITACAO: 'Em tramitação',
  EM_PAUTA: 'Em pauta',             // estava faltando
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  ARQUIVADA: 'Arquivada',
  RETIRADA: 'Retirada',
  TRANSFORMADA_EM_NORMA: 'Transformada em norma',
} as const;

export type MateriaStatus = keyof typeof MATERIA_STATUS;

// Status de sessão — novo
export const SESSAO_STATUS = {
  AGENDADA: 'Agendada',
  ABERTA: 'Aberta',
  SUSPENSA: 'Suspensa',
  ENCERRADA: 'Encerrada',
  CANCELADA: 'Cancelada',
} as const;

export type SessaoStatus = keyof typeof SESSAO_STATUS;

// Status de norma — calculado no backend
export const NORMA_STATUS = {
  EM_TRAMITE: 'Em trâmite',
  SANCIONADA: 'Sancionada',
  VETADA: 'Vetada',
  PROMULGADA: 'Promulgada',
  PUBLICADA: 'Publicada',
  VIGENTE: 'Vigente',
  REVOGADA: 'Revogada',
} as const;

export type NormaStatus = keyof typeof NORMA_STATUS;
```

### T-03 · Criar `types/api.ts` — tipos de response paginado

- [x] Criado `types/api.ts` com `PaginatedResponse<T>` e `ApiError`

---

## Fase 2 — Camada API

### T-04 · Adicionar `apiFormData()` em `api/client.ts`

- [x] Função `apiFormData()` adicionada com Authorization header e redirect 401

### T-05 · Adicionar novos paths em `api/paths.ts`

- [x] Todos os novos paths adicionados (autoresExternos, normas, atos, tramitar, sessões ciclo de vida, votações)

### T-06 · Criar `api/normas.api.ts`

- [x] Criado com `list`, `getById`, `create`, `update`, `remove`, `uploadTextoIntegral`, `uploadAudio`
- [x] Ciclo jurídico: `registrarSancao`, `registrarVeto`, `registrarPromulgacao`, `registrarPublicacao`, `revogar`
- [x] Tipos: `Norma`, `CreateNormaDto`, `NormaFiltros`

### T-07 · Criar `api/atos.api.ts`

- [x] Criado com `list`, `getById`, `create`, `update`, `remove`, `uploadAnexo`
- [x] Tipos: `Ato`, `CreateAtoDto`, `AtoFiltros`

### T-08 · Criar `api/autores-externos.api.ts`

- [x] Criado com `list`, `getById`, `create`, `update`, `remove`
- [x] Tipos: `AutorExterno`, `CreateAutorExternoDto`, `AutorExternoFiltros`

### T-09 · Atualizar `api/legislative/materias.api.ts`

- [x] Método `tramitar(id, dto)` adicionado
- [x] Método `adicionarAutor(id, dto)` adicionado
- [x] Método `addPublicacao(id, dto)` adicionado
- [x] Tipos `Materia`, `CreateMateriaDto`, `MateriaFiltros` com novos campos
- [x] Método `createComTexto()` com multipart para upload de Texto Original

### T-10 · Atualizar `api/legislative/sessoes.api.ts`

- [x] Métodos `abrir`, `suspender`, `encerrar`, `cancelar` adicionados
- [x] Método `getQuorum(id)` adicionado
- [x] Tipo `SessaoPlenaria` com `statusSessao`, `dataAbertura`, `dataEncerramento`, `quorumPresente`

### T-11 · Exportar novos módulos em `api/index.ts`

- [x] `normasApi`, `atosApi`, `autoresExternosApi` exportados

---

## Fase 3 — Hooks

### T-12 · Atualizar `hooks/usePermissions.ts`

- [x] Lógica `TenantUserRole` implementada
- [x] `canEdit`, `canDelete`, `canManageSessao`, `canVotar`, `canManagePessoas` adicionados
- [x] Compatibilidade com `isMaster` mantida

### T-13 · Atualizar `hooks/useDominios.ts`

- [x] `tiposAutorExterno`, `identificadoresNorma`, `esferasFederacao`, `tiposAto`, `classificacoesAto` adicionados
- [x] `parlamentares` adicionado
- [x] Dominios tipo atualizado com novos campos

---

## Fase 4 — Componentes comuns

### T-14 · Criar `components/common/FiltroLayout.tsx`

- [x] Implementado com Card PrimeReact, botões Limpar/Pesquisar, loading state

### T-15 · Criar `components/common/DataTableLayout.tsx`

- [x] Implementado com DataTable lazy, paginação, coluna de ações acessível

### T-16 · Criar `components/common/DeleteDialog.tsx`

- [x] Implementado com confirmação, loading state, toast de sucesso

### T-17 · Criar `components/common/VerDialog.tsx`

- [x] Dialog genérico responsivo `min(90vw, 700px)` com botão Fechar no footer

---

## Fase 5 — Lazy loading nas rotas

### T-18 · Converter todas as rotas para `React.lazy()` em `App.tsx`

- [x] Todas as 16 páginas convertidas para `React.lazy()`
- [x] `<Suspense fallback={<ProgressSpinner />}>` na raiz das rotas
- [x] `ProtectedRoute` e `MasterRoute` funcionando

---

## Checklist final

- [x] `npm run build` sem erros de TypeScript ✅
- [x] `npm run dev` inicia sem erros no console
- [x] `usePermissions` retorna `canEdit: false` para perfil STAFF
- [x] `usePermissions` retorna `canVotar: true` apenas para PARLIAMENTARIAN
- [x] `normasApi.list()` chama `/legislative/normas`
- [x] `atosApi.list()` chama `/atos`
- [x] `autoresExternosApi.list()` chama `/identidade/autores-externos`
- [x] `apiFormData()` existe e inclui Authorization header
- [x] Tipos `PROTOCOLADA` e `EM_PAUTA` existem em `MATERIA_STATUS`
- [x] Todas as 16 rotas são lazy-loaded
