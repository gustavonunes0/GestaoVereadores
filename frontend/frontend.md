# Frontend — GestaoVereadores (SIGL)

SPA React para gestão legislativa — plataforma **Staff** (web) e portal **Parlamentar** (mesmo codebase, rotas separadas).

---

## Visão geral

| Item | Valor |
|------|-------|
| Nome do pacote | `gestao-vereadores-web` |
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| UI | PrimeReact 10 + PrimeIcons |
| Ícones sidebar | MUI Icons |
| Estilo | Tailwind CSS 4 + tokens SIGL (`styles/`) |
| Roteamento | React Router 7 |
| API base | `/api` (proxy Vite → `:3000`) |

### Ambientes

| Modo | URL | API |
|------|-----|-----|
| Dev (`npm run dev`) | http://localhost:5173 | proxy `/api` → `127.0.0.1:3000` |
| Docker | http://localhost:8080 | `VITE_API_URL=/api` |
| Variável | `VITE_API_URL` | default `/api` |

---

## Aplicações no mesmo frontend

Conforme `docs/DECISAO-APPS-staff-parlamentar.md`:

| App | Quem | Layout | Rotas base |
|-----|------|--------|------------|
| **Staff** | Admin Staff, Staff | `Layout` + sidebar MUI | `/`, `/materias`, `/sessoes`, `/camara/*` |
| **Parlamentar** | Vereador | `ParlamentarLayout` | `/parlamentar/*` |

Guards de rota:

- `StaffRoute` — exige role staff
- `AdminRoute` — exige admin (ex.: `/usuarios`)
- `ParlamentarRoute` — exige parlamentar

Login único em `/login` → redireciona conforme role.

---

## Estrutura de pastas

```
frontend/src/
├── api/                    # Cliente HTTP + paths + *.api.ts
│   ├── client.ts           # api(), apiList(), apiFormData()
│   ├── paths.ts            # Fonte única de rotas da API
│   ├── tenant-partners.api.ts
│   ├── usuarios.api.ts
│   ├── normas.api.ts
│   ├── atos.api.ts
│   └── legislative/        # materias, sessoes, parlamentares, ...
├── app/
│   ├── navigation.ts       # ROUTES, menus staff/parlamentar
│   └── routes/             # router.tsx, staff, camara, parlamentar
├── pages/                  # Telas (lazy-loaded)
├── components/             # UI por domínio
│   ├── autores/            # TenantPartner dialogs
│   ├── materias/
│   ├── sessoes/
│   ├── parlamentares/
│   ├── normas/
│   ├── atos/
│   ├── comissoes/
│   ├── frentes/
│   ├── mesa-diretora/
│   ├── usuarios/
│   ├── ui/                 # Dropdown, FileUpload, DatePicker...
│   ├── common/             # DataTableLayout, DeleteDialog...
│   └── workflow/           # Pipeline legislativo
├── hooks/                  # useAppToast, etc.
├── styles/                 # sigl-ui-patterns, prime-overrides, tokens
├── types/
└── utils/                  # cpf, normalizeDocument, apiErrorMessage
```

---

## Rotas da aplicação

Definidas em `app/navigation.ts` e `app/routes/`.

### Staff (menu lateral)

| Rota | Página | Módulo API |
|------|--------|------------|
| `/` | `DashboardPage` | — |
| `/materias` | `MateriasPage` | `materias.api` |
| `/sessoes` | `SessoesPage` | `sessoes.api` |
| `/normas-juridicas` | `NormasPage` | `normas.api` |
| `/atos-administrativos` | `AtosPage` | `atos.api` |
| `/agenda` | `AgendaPage` | `agenda.api` |
| `/relatorios` | `RelatoriosPage` | `paths.relatorio*` |
| `/usuarios` | `UsuariosPage` (admin) | `usuarios.api` |

### Câmara (`/camara/*`)

| Rota | Página |
|------|--------|
| `/camara/legislaturas` | `LegislaturasPage` |
| `/camara/parlamentares` | `ParlamentaresPage` |
| `/camara/comissoes` | `ComissoesPage` |
| `/camara/frentes` | `FrentesPage` |
| `/camara/mesa-diretora` | `MesaDiretoraPage` |
| `/camara/autores` | `AutoresPage` (Tenant Partner) |
| `/camara/portal` | `PortalInstitucionalPage` |

### Parlamentar (`/parlamentar/*`)

| Rota | Página |
|------|--------|
| `/parlamentar/perfil` | `ParlamentarPerfilPage` |
| `/parlamentar/biografia` | `ParlamentarBiografiaPage` |
| `/parlamentar/dashboard` | `ParlamentarDashboardPage` |
| `/parlamentar/materias` | `ParlamentarMateriasPage` |
| `/parlamentar/comissoes` | `ParlamentarComissoesPage` |
| `/parlamentar/mandato` | `ParlamentarMandatoPage` |
| `/parlamentar/filiacao` | `ParlamentarFiliacaoPage` |

### Redirects legados

URLs antigas (`/parlamentares`, `/normas`, etc.) redirecionam via `legacy.routes.tsx`.

---

## Camada API

### `api/client.ts`

| Função | Uso |
|--------|-----|
| `api<T>(path, options)` | GET/POST/PATCH/DELETE JSON |
| `apiList<T>(path, params)` | Listagem paginada (`page`, `limit`) |
| `apiFormData<T>(path, formData)` | Upload multipart |

**Auth:** `Authorization: Bearer {access_token}` do `localStorage`.  
**401:** limpa sessão e redireciona para `/login`.  
**Content-Type:** `application/json` só quando há body (fix DELETE sem body).

### `api/paths.ts`

Espelha controllers NestJS. Exemplos:

```ts
API_PATHS.tenantPartners          // /identidade/tenant-partners
API_PATHS.tenantPartnerUsuario(id)
API_PATHS.materias
API_PATHS.sessoes
API_PATHS.normas
```

### Módulos `*.api.ts`

| Arquivo | Backend |
|---------|---------|
| `tenant-partners.api.ts` | `identidade/tenant-partners` |
| `usuarios.api.ts` | `identidade/usuarios` |
| `legislative/materias.api.ts` | `legislative/materias` |
| `legislative/sessoes.api.ts` | `legislative/sessoes-plenarias` |
| `legislative/parlamentares.api.ts` | `legislative/parlamentares` |
| `legislative/comissoes.api.ts` | `legislative/comissoes` |
| `legislative/frentes.api.ts` | `legislative/frentes-parlamentares` |
| `legislative/mesa-diretora.api.ts` | `legislative/mesa-diretora` |
| `legislative/legislaturas.api.ts` | `legislative/legislaturas` |
| `legislative/agenda.api.ts` | `legislative/agenda-legislativa` |
| `normas.api.ts` | `normas` |
| `atos.api.ts` | `atos` |
| `dominios.api.ts` | `dominios` |

---

## Tenant Partner (Autores)

Tela: `AutoresPage` → `/camara/autores`

| Componente | Função |
|------------|--------|
| `TenantPartnerCreateDialog` | Cadastra instituição (nome obrigatório) |
| `TenantPartnerEditDialog` | Abas **Instituição** e **Usuário** (`TabView`) |
| `TenantPartnerVerDialog` | Visualização somente leitura |

### Fluxo usuário vinculado

1. Criar instituição (sem User)
2. Editar → aba Usuário → vincular (`nome`, `CPF`, foto)
3. Editar / remover usuário vinculado
4. `tenantPartnersApi`: `provisionUser`, `updateUser`, `removeUser`

Estilo das abas: classe `sigl-dialog-tabview` em `styles/sigl-ui-patterns.css`.

---

## Padrões de UI

### Layout de formulários em dialog

```html
<div class="sigl-dialog-body">
  <div class="sigl-dialog-secao">
    <span class="sigl-dialog-secao-titulo">Título</span>
    <div class="sigl-dialog-grid sigl-dialog-grid-2">...</div>
  </div>
</div>
```

- `sigl-dialog-grid-2` / `sigl-dialog-grid-3` — colunas responsivas
- `sigl-col-full` — campo largura total
- `sigl-filtro-campo` — label + input

### Filtros de listagem

- `FiltroLayout` + campos `sigl-filtro-campo`
- `DataTableLayout` — tabelas PrimeReact padronizadas

### Feedback

- `useAppToast()` — success, error, `showApiError`, `confirmDestructive`
- `AppFeedbackProvider` — Toast + ConfirmDialog global

### Upload de foto

- `FileUpload` (`components/ui`)
- `preparePhotoDataUrl()` — compressão antes do JSON (max ~2 MB)

### Ícones

- Menu staff: `SidebarIcon` (MUI)
- Headers/botões: PrimeIcons (`pi pi-*`)
- Mapa: `MODULE_ICONS` em `navigation.ts`

---

## Componentes por domínio

| Pasta | Principais componentes |
|-------|------------------------|
| `materias/` | Create/Edit/Ver/Delete dialogs, status badges |
| `sessoes/` | Create/Edit/Ver, Abrir/Encerrar, DeliberacaoPanel, RegistrarVoto |
| `parlamentares/` | Create/Edit, Mandatos, Comissões, ListCard |
| `normas/` | Create/Edit/Ver, workflow jurídico |
| `atos/` | Create/Edit/Ver |
| `comissoes/` | Form/Ver dialogs |
| `frentes/` | Form/Ver dialogs |
| `mesa-diretora/` | Create/Ver, composição |
| `autores/` | TenantPartner *Dialog |
| `usuarios/` | UsuarioFormDialog |
| `workflow/` | Pipeline do fluxo legislativo (matéria → sessão → norma/ato) |

---

## Autenticação

```ts
// Login
authApi.login({ cpf, password, tenantId })

// Sessão
authApi.me()  // GET /auth/me

// Storage
localStorage: access_token, user
```

Tipos em `types/auth.ts`.

---

## Estilos

| Arquivo | Conteúdo |
|---------|----------|
| `styles/prime-theme-tokens.css` | Cores SIGL, variáveis CSS |
| `styles/sigl-ui-patterns.css` | Dialogs, filtros, tabview, cards |
| `styles/prime-overrides.css` | Ajustes PrimeReact |
| `styles/spacing-layout.css` | Espaçamento global |
| `index.css` | Entrada + utilitários |

Cor accent institucional: `#2563a8`.

---

## Scripts

```bash
cd frontend
npm run dev              # Vite :5173
npm run build            # tsc + vite build
npm run validate:routes  # Valida rotas vs navigation.ts
```

---

## Mapeamento FE → BE (resumo)

| Tela FE | Endpoints BE principais |
|---------|-------------------------|
| AutoresPage | `CRUD tenant-partners`, `usuario` |
| MateriasPage | `legislative/materias` |
| SessoesPage | `legislative/sessoes-plenarias` |
| NormasPage | `normas` |
| AtosPage | `atos` |
| ParlamentaresPage | `legislative/parlamentares` |
| UsuariosPage | `identidade/usuarios` |
| ParlamentarPerfil | `PATCH parlamentares/me/perfil` |
| ParlamentarBiografia | `PATCH parlamentares/me/biografia` |

---

## Gaps conhecidos (BE pronto, FE incompleto)

| Feature backend | Status frontend |
|-----------------|-----------------|
| `GET sessao-ativa` | Sem path em `paths.ts` |
| `POST minha-presenca` | Sem integração |
| `POST pedir-palavra` | Sem integração |
| `PATCH fase` sessão | Sem integração |
| `GET materias/minhas` | ParlamentarMateriasPage parcial |
| WebSocket sessão ao vivo | Não implementado |
| App mobile parlamentar | Planejado (RN/PWA) |

---

## Documentação complementar

| Arquivo | Conteúdo |
|---------|----------|
| `frontend/docs/tasks/` | Tasks FE (ex.: TASK-FE-008 tenant-partner) |
| `docs/DECISAO-APPS-staff-parlamentar.md` | Staff vs Parlamentar |
| `backend/backend.md` | Documentação da API |
| `CLAUDE.md` | Regras globais do monorepo |

---

## Convenções de desenvolvimento

1. Novas rotas API → adicionar em `api/paths.ts` + `*.api.ts`
2. Novas telas → `pages/` + registrar em `app/routes/lazy-pages.ts`
3. Validar menu → `npm run validate:routes`
4. Mensagens de erro → `showApiError(err)` (extrai message da API)
5. Confirmação de exclusão → `confirmDestructive()` do `useAppToast`
6. Não commitar `.env` com secrets
