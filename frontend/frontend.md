# Frontend — GestaoVereadores (SIGL)

SPA React para gestão legislativa municipal — plataforma **Staff** (operadores) e portal **Parlamentar** (mesmo codebase, rotas e layouts separados).

---

## Visão geral

| Item | Valor |
|------|-------|
| Pacote | `gestao-vereadores-web` |
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| UI | PrimeReact 10 + PrimeIcons |
| Ícones sidebar | MUI Icons (outline → filled no ativo) |
| Estilo | Tailwind CSS 4 + tokens SIGL (`styles/`) |
| Roteamento | React Router 7 (`createBrowserRouter`) |
| Tempo real | Socket.IO (`useSessaoRealtime`) |
| Vídeo | Jitsi (`@jitsi/react-sdk`) |
| API | `/api` (proxy Vite → `:3000` em dev) |

### Ambientes

| Modo | URL | API |
|------|-----|-----|
| Dev (`npm run dev`) | http://localhost:5173 | proxy `/api` → `127.0.0.1:3000` |
| Docker | http://localhost:8080 | `VITE_API_URL=/api` |
| Rede LAN | http://\<IP\>:5173 | backend em `http://\<IP\>:3000` |

---

## Arquitetura de rotas

```
App.tsx → RouterProvider
├── PÚBLICO     /login
├── STAFF       StaffRoute
│   ├── /sessoes/:id/painel     (sem sidebar — telão)
│   └── Layout + SidebarNav
│       └── páginas staff + /camara/*
├── PARLAMENTAR ParlamentarRoute → ParlamentarLayout + SidebarNav
└── CATCH-ALL   * → redireciona por tipo de sessão
```

**Arquivos:** `src/app/routes/router.tsx`, `staff.routes.tsx`, `parlamentar.routes.tsx`, `camara.routes.tsx`, `legacy.routes.tsx`, `lazy-pages.ts`, `navigation.ts`.

### Guards

| Guard | Arquivo | Regra |
|-------|---------|-------|
| `StaffRoute` | `components/StaffRoute.tsx` | Sem user → `/login`; parlamentar → `/parlamentar/perfil` |
| `ParlamentarRoute` | `components/ParlamentarRoute.tsx` | Sem user → `/login`; staff → `/` |
| `AdminRoute` | `components/AdminRoute.tsx` | Só `ADMIN_STAFF` (ex.: `/usuarios`) |
| `CatchAllRoute` | `app/routes/catch-all.route.tsx` | 404 suave — redireciona conforme sessão |

---

## Sidebar

Componente único: `components/SidebarNav.tsx`  
Definição dos menus: `app/navigation.ts` (`STAFF_NAV_MENU`, `PARLAMENTAR_NAV_MENU`)  
Ícones: `app/sidebar-icons.ts` (pares MUI outlined/filled)

### Comportamento

- Item ativo: `/` só com match exato; demais rotas usam `pathname.startsWith(route)`.
- Accordion: apenas **"Câmara Gestão"** (clique expande/recolhe).
- `adminOnly: true`: item **Usuários** oculto para quem não é `ADMIN_STAFF`.
- Mobile: classe `sidebar-open` no body + backdrop; fecha ao navegar.

### Menu STAFF (`Layout.tsx`)

```
┌─ Logo SIGL ─────────────────────────┐
│ GERAL                               │
│   Dashboard                    /    │
│ LEGISLATIVO                         │
│   Sessões Legislativas    /sessoes  │
│   Matérias               /materias  │
│   Normas Jurídicas   /normas-jur... │
│   Atos Administrativos /atos-adm... │
│ PESSOAS                             │
│   Parlamentares    /camara/parlam...│
│   Mesa Diretora    /camara/mesa-... │
│   Comissões        /camara/comis... │
│   Frentes Parl.    /camara/frentes  │
│   Autor Externo    /camara/autores  │
│ SISTEMA                             │
│   Agenda                  /agenda   │
│   Relatórios          /relatorios   │
│   ▼ Câmara Gestão                   │
│       Portal Institucional          │
│       Usuários (admin only)         │
└─────────────────────────────────────┘
```

| Grupo | Item | Rota | Ícone | Página |
|-------|------|------|-------|--------|
| Geral | Dashboard | `/` | dashboard | `DashboardPage` |
| Legislativo | Sessões Legislativas | `/sessoes` | gavel | `SessoesPage` |
| | Matérias | `/materias` | description | `MateriasPage` |
| | Normas Jurídicas | `/normas-juridicas` | balance | `NormasPage` |
| | Atos Administrativos | `/atos-administrativos` | task | `AtosPage` |
| Pessoas | Parlamentares | `/camara/parlamentares` | groups | `ParlamentaresPage` |
| | Mesa Diretora | `/camara/mesa-diretora` | recent_actors | `MesaDiretoraPage` |
| | Comissões | `/camara/comissoes` | people | `ComissoesPage` |
| | Frentes Parlamentares | `/camara/frentes` | flag | `FrentesPage` |
| | Autor Externo | `/camara/autores` | person_add | `AutoresPage` |
| Sistema | Agenda | `/agenda` | calendar_month | `AgendaPage` |
| | Relatórios | `/relatorios` | bar_chart | `RelatoriosPage` |
| | Câmara Gestão ▼ | — | account_balance | accordion |
| | → Portal Institucional | `/camara/portal` | public | `PortalInstitucionalPage` |
| | → Usuários | `/usuarios` | manage_accounts | `UsuariosPage` |

### Menu PARLAMENTAR (`ParlamentarLayout.tsx`)

| Grupo | Item | Rota | Página |
|-------|------|------|--------|
| Perfil | Perfil Parlamentar | `/parlamentar/perfil` | `ParlamentarPerfilPage` |
| | Biografia | `/parlamentar/biografia` | `ParlamentarBiografiaPage` (stub) |
| | Dashboard | `/parlamentar/dashboard` | `ParlamentarDashboardPage` (stub) |
| Atuação | Matérias | `/parlamentar/materias` | `ParlamentarMateriasPage` |
| | Comissões | `/parlamentar/comissoes` | `ParlamentarComissoesPage` |
| | Mandato | `/parlamentar/mandato` | `ParlamentarMandatoPage` |
| | Filiação | `/parlamentar/filiacao` | `ParlamentarFiliacaoPage` |

### Rotas fora da sidebar

| Rota | Acesso | Contexto |
|------|--------|----------|
| `/sessoes/:id` | Lista de sessões | Workspace: Pauta, Presenças, Transmissão |
| `/sessoes/:id/painel` | Botão "Abrir telão" | Telão do plenário (fullscreen) |
| `/camara/legislaturas` | Redirect de `/camara` | Legislaturas — sem item no menu |
| `/login` | Público | Autenticação |

### Redirects legados (`legacy.routes.tsx`)

| Antiga | Nova |
|--------|------|
| `/parlamentares` | `/camara/parlamentares` |
| `/comissoes` | `/camara/comissoes` |
| `/frentes` | `/camara/frentes` |
| `/mesa-diretora` | `/camara/mesa-diretora` |
| `/autores` | `/camara/autores` |
| `/legislaturas` | `/camara/legislaturas` |
| `/normas` | `/normas-juridicas` |
| `/atos` | `/atos-administrativos` |
| `/publicacao` | `/normas-juridicas` |
| `/publicacao/normas` | `/normas-juridicas` |
| `/publicacao/atos` | `/atos-administrativos` |

---

## Páginas (`src/pages/`)

Padrão das listagens: `PageHeader` + `FiltroLayout` + `DataTableLayout` (20/página) + permissões via `usePermissions`.

### Legislative core

| Página | Rota | Contexto | Filtros | Diálogos |
|--------|------|----------|---------|----------|
| `DashboardPage` | `/` | KPIs, pipeline, atalhos | — | — |
| `MateriasPage` | `/materias` | CRUD proposições | Tipo, ementa, protocolo, ano, tipo autor, datas apresentação/publicação | Create, Edit, Ver, Delete |
| `SessoesPage` | `/sessoes` | Lista sessões plenárias | `SessaoPesquisaFilters` (legislatura, sessão legislativa, tipo, situação, período) | Create, Edit, Delete |
| `AgendaPage` | `/agenda` | Calendário legislativo | Tipo evento, período, só públicos | Inline create, Delete |
| `NormasPage` | `/normas-juridicas` | Normas jurídicas | Espécie, número, ementa, ano, esfera, data | Create, Edit, Ver, Delete |
| `AtosPage` | `/atos-administrativos` | Atos administrativos | Tipo, número, datas ato/publicação | Create, Edit, Ver, Delete |
| `RelatoriosPage` | `/relatorios` | Relatórios atividade/presença | UUID sessão legislativa | — |

### Câmara / organização

| Página | Rota | Contexto | Filtros | Diálogos |
|--------|------|----------|---------|----------|
| `CamaraPage` | `/camara` | Wrapper `<Outlet>` | — | — |
| `ParlamentaresPage` | `/camara/parlamentares` | Vereadores | Nome, partido, status | Create, Ver/Edit, Mandatos, Comissões, Delete |
| `ComissoesPage` | `/camara/comissoes` | Comissões | Nome/sigla, tipo, situação | Form, Ver, Delete |
| `FrentesPage` | `/camara/frentes` | Frentes parlamentares | Nome, tema, situação | Form, Ver, Delete |
| `MesaDiretoraPage` | `/camara/mesa-diretora` | Mesa por legislatura | Legislatura ativa, situação | Create |
| `LegislaturasPage` | `/camara/legislaturas` | Legislaturas | — | Modal criar |
| `AutoresPage` | `/camara/autores` | Instituições parceiras | Nome | Create, Ver, Edit, Delete |
| `PortalInstitucionalPage` | `/camara/portal` | Portal público | — | stub |

### Admin e auth

| Página | Rota | Contexto |
|--------|------|----------|
| `UsuariosPage` | `/usuarios` | Staff users (admin) |
| `LoginPage` | `/login` | CPF + senha |

### Parlamentar (`pages/parlamentar/`)

| Página | Rota | Estado |
|--------|------|--------|
| `ParlamentarPerfilPage` | `/parlamentar/perfil` | Completo |
| `ParlamentarMateriasPage` | `/parlamentar/materias` | Read-only |
| `ParlamentarComissoesPage` | `/parlamentar/comissoes` | Read-only |
| `ParlamentarMandatoPage` | `/parlamentar/mandato` | Completo |
| `ParlamentarFiliacaoPage` | `/parlamentar/filiacao` | Completo |
| `ParlamentarBiografiaPage` | `/parlamentar/biografia` | Stub |
| `ParlamentarDashboardPage` | `/parlamentar/dashboard` | Stub |

### Páginas fora de `pages/` (rotas lazy)

| Componente | Rota | Contexto |
|------------|------|----------|
| `SessaoDetalhePage` | `/sessoes/:id` | Abas Pauta · Presenças · Transmissão; banner votação; WebSocket |
| `SessaoPainelPage` | `/sessoes/:id/painel` | Telão: logo, pauta do dia, leitura, placar, resultado |

---

## Sessão plenária — detalhe (`SessaoDetalhePage`)

### Abas

| Aba | Componente | Função |
|-----|------------|--------|
| Pauta | `PautaManager` | CRUD itens polimórficos, publicar, abrir/fechar votação, telão |
| Presenças | `PresencaPanel` | Mapa do plenário, quórum, toggle presença |
| Transmissão | `TransmissaoPanel` | Jitsi, câmeras, áudio, YouTube |

### Pauta (`components/sessoes/pauta/`)

| Componente | Função |
|------------|--------|
| `PautaManager` | Tabela da pauta, reordenar, publicar, abrir telão |
| `PautaItemRow` | Linha: leitura, votar, telão, remover |
| `PautaItemLeitura` | Expansão com texto integral |
| `PautaBadges` | Categoria, fase, tipo |
| `AddPautaItemDialog` | Adicionar item (MATERIA, COMISSAO, ATO, NORMA, AVISO) |
| `PublicarPautaDialog` | Confirmar publicação |
| `AbrirVotacaoDialog` | Nominal / Simbólica / Secreta |
| `FecharVotacaoDialog` | Encerrar com placar ou totais manuais |

**Categorias de pauta:** `MATERIA`, `COMISSAO` (parecer), `ATO`, `NORMA`, `AVISO`.  
**Votação:** só `MATERIA` e `COMISSAO` em deliberação.

### Presenças (`components/sessoes/presencas/`)

| Componente | Função |
|------------|--------|
| `PresencaPanel` | Orquestra painel + realtime |
| `PresencaMetrics` | Contadores presentes/ausentes |
| `QuorumBar` | Barra visual de quórum |
| `PlenarioMapa` | Mapa de assentos |
| `CadeiraParlamentar` | Clique alterna presença |
| `ParlamentarTooltip` | Tooltip no assento |

### Transmissão (`components/sessoes/transmissao/`)

| Componente | Função |
|------------|--------|
| `TransmissaoPanel` | Hub: Jitsi, abas Câmeras/Áudio/Stream |
| `CameraSelector` | Embed Jitsi + grid de câmeras |
| `ConvidarParticipantesJitsi` | Copiar/abrir link da sala para outros dispositivos |
| `StatusConexaoJitsi` | Status conexão, sala, participantes |
| `AudioMixer` | Sliders de volume por canal |
| `TransmissaoStreamTab` | Iniciar/parar, duração, YouTube |
| `YoutubeConfigForm` | Link YouTube da sessão |
| `TransmissaoFullscreenOverlay` | Preview fullscreen (pré-Jitsi) |

### Telão (`components/sessoes/painel/`)

| Componente | Função |
|------------|--------|
| `SessaoPainelPage` | Monitor da câmara: logo, pauta do dia, item em leitura, votação ao vivo, resultado |

**Modos do telão (prioridade):** votação → resultado (~25s) → item destacado → pauta do dia → aguardando.

**Sincronização mesa → telão:** `BroadcastChannel` via `utils/sessaoPainelChannel.ts` (botão monitor em `PautaItemRow`).

### Votação — diálogos globais

| Diálogo | Quem usa | Campos |
|---------|----------|--------|
| `RegistrarVotoDialog` | Parlamentar | Sim / Não / Abstenção |
| `FecharVotacaoDialog` | Staff | Placar ou totais manuais; voto de qualidade |

### Tempo real (`hooks/useSessaoRealtime.ts`)

Socket namespace `/sessao`, auth JWT + `sessaoId` na query.

| Evento | Efeito no FE |
|--------|--------------|
| `votacao:aberta` | Banner + modal de voto (parlamentar) |
| `votacao:convocada` | Igual aberta |
| `votacao:placar` | Atualiza contadores |
| `votacao:encerrada` | Fecha banner; telão mostra resultado |
| `sessao:fase` | Atualiza fase |
| `presenca:atualizada` | Atualiza mapa de presença |
| `sessao:encerrada` | Fase encerrada |

---

## Inventário de diálogos

### Wrappers genéricos

| Arquivo | Uso |
|---------|-----|
| `common/VerDialog.tsx` | Visualização read-only |
| `common/DeleteDialog.tsx` | Confirmação de exclusão |
| `Modal.tsx` | Modal CSS customizado |

### Por domínio

| Domínio | Diálogos |
|---------|----------|
| Sessões | Create, Edit, Abrir, Encerrar, Ver (legado), RegistrarVoto |
| Pauta | AddPautaItem, Publicar, AbrirVotacao, FecharVotacao |
| Matérias | Create, Edit, Ver, Delete, AddCoautor (interno) |
| Normas | Create, Edit, Ver, Delete |
| Atos | Create, Edit, Ver, Delete |
| Comissões | Form, Ver, Delete |
| Frentes | Form, Ver, Delete |
| Mesa Diretora | Create, Ver + Modal composição |
| Parlamentares | Create, Edit, Ver, Mandatos, Comissões, Vincular |
| Autores | TenantPartner Create/Edit/Ver |
| Usuários | UsuarioFormDialog |

---

## Filtros

### Componentes reutilizáveis

| Arquivo | Uso |
|---------|-----|
| `common/FiltroLayout.tsx` | Card com Limpar / Pesquisar |
| `common/PesquisaFiltersCard.tsx` | Filtros colapsáveis com chips |
| `sessoes/SessaoPesquisaFilters.tsx` | Filtros de sessões (embedded ou standalone) |
| `publicacao/AtosPesquisaFilters.tsx` | Atos (alternativo) |
| `publicacao/NormasPesquisaFilters.tsx` | Normas (alternativo) |

### Campos por página

| Página | Filtros |
|--------|---------|
| Matérias | Tipo, ementa, protocolo, ano, tipo autor, data apresentação, data publicação |
| Sessões | Legislatura, sessão legislativa, tipo, situação, ano/mês/dia ou range, presets |
| Agenda | Tipo evento, período, apenas públicos |
| Normas | Espécie, número, ementa, ano, esfera, data |
| Atos | Tipo, número, data ato, data publicação |
| Parlamentares | Nome, partido, status |
| Comissões | Nome/sigla, tipo, situação |
| Frentes | Nome, tema, situação |
| Mesa Diretora | Legislatura ativa, situação |
| Autores | Nome |

---

## UI primitives (`components/ui/`)

| Componente | Função |
|------------|--------|
| `Dropdown` | Select com busca, label externo |
| `MultiSelect` | Multi-select com filtro |
| `DatePicker` | Data (e hora opcional) |
| `DateRangePicker` | Intervalo de datas |
| `FileUpload` | Upload drag-drop + preview |
| `PreviewImg` | Overlay PDF/imagem fullscreen |
| `SidebarIcon` | Ícone MUI ativo/inativo |

### Padrões de layout em dialogs

```html
<div class="sigl-dialog-body">
  <div class="sigl-dialog-secao">
    <span class="sigl-dialog-secao-titulo">Título</span>
    <div class="sigl-grid-12">
      <div class="sigl-col-6 sigl-filtro-campo">...</div>
    </div>
  </div>
</div>
```

Classes principais: `sigl-grid-12`, `sigl-col-6`, `sigl-col-12`, `sigl-filtro-campo`, `sigl-ui-dropdown`.

---

## Estrutura de pastas

```
frontend/src/
├── api/
│   ├── client.ts              # api(), apiList(), apiFormData()
│   ├── paths.ts               # Rotas da API NestJS
│   └── legislative/           # materias, sessoes, parlamentares, ...
├── app/
│   ├── navigation.ts          # ROUTES, STAFF_NAV_MENU, PARLAMENTAR_NAV_MENU
│   ├── sidebar-icons.ts       # Ícones MUI da sidebar
│   └── routes/                # router, staff, parlamentar, camara, lazy-pages
├── pages/                     # Telas lazy-loaded
├── components/
│   ├── sessoes/               # Detalhe, pauta, presenças, transmissão, painel
│   ├── materias/
│   ├── normas/ · atos/ · comissoes/ · frentes/
│   ├── mesa-diretora/ · parlamentares/ · autores/ · usuarios/
│   ├── common/                # FiltroLayout, DataTableLayout, DeleteDialog
│   └── ui/                    # Dropdown, DatePicker, FileUpload, ...
├── hooks/                     # useAppToast, useSessaoRealtime, usePermissions
├── utils/                     # jitsiRoomUrl, sessaoPainelChannel, cpf, ...
├── styles/                    # sigl-ui-patterns.css, prime-overrides, tokens
└── types/                     # auth, sessoes, materias, legislative
```

---

## Camada API

### `api/client.ts`

| Função | Uso |
|--------|-----|
| `api<T>(path, options)` | GET/POST/PATCH/DELETE JSON |
| `apiList<T>(path, params)` | Listagem paginada |
| `apiFormData<T>(path, formData)` | Upload multipart |

Auth: `Authorization: Bearer {access_token}` em `localStorage`.  
401: limpa sessão → `/login`.

### Módulos principais

| Arquivo | Backend |
|---------|---------|
| `legislative/materias.api.ts` | `legislative/materias` |
| `legislative/sessoes.api.ts` | `legislative/sessoes-plenarias` (+ pauta, presença, jitsi-token, votação) |
| `legislative/parlamentares.api.ts` | `legislative/parlamentares` |
| `legislative/comissoes.api.ts` | `legislative/comissoes` |
| `legislative/agenda.api.ts` | `legislative/agenda-legislativa` |
| `normas.api.ts` | `normas` |
| `atos.api.ts` | `atos` |
| `usuarios.api.ts` | `identidade/usuarios` |
| `tenant-partners.api.ts` | `identidade/tenant-partners` |

---

## Autenticação

```ts
authApi.login({ cpf, password })
authApi.me()  // GET /auth/me
localStorage: access_token, user
```

Tipos: `types/auth.ts` — `StaffUser` (`ADMIN_STAFF` | `STAFF`) e `ParlamentarianUser`.

Login em `/login` redireciona: staff → `/`, parlamentar → `/parlamentar/perfil`.

---

## Estilos

| Arquivo | Conteúdo |
|---------|----------|
| `styles/prime-theme-tokens.css` | Cores SIGL, variáveis CSS |
| `styles/sigl-ui-patterns.css` | Dialogs, filtros, grid 12 col, telão, transmissão, pauta |
| `styles/prime-overrides.css` | Ajustes PrimeReact |
| `styles/spacing-layout.css` | Espaçamento global |
| `index.css` | Entrada |

Cor accent: `#2563a8`.

---

## Scripts

```bash
cd frontend
npm run dev              # Vite :5173
npm run build            # tsc + vite build
npm run validate:routes  # Menu vs rotas registradas
```

---

## Fluxos de votação (referência rápida)

```
Staff: PautaManager → AbrirVotacaoDialog
         ↓ WebSocket votacao:aberta
Parlamentar: SessaoDetalhePage → RegistrarVotoDialog (auto)
Staff: placar ao vivo no banner + FecharVotacaoDialog
         ↓ WebSocket votacao:encerrada
Telão: SessaoPainelPage → resultado → volta à pauta
```

---

## Gaps conhecidos

| Feature | Status |
|---------|--------|
| Portal Institucional | Stub |
| Parlamentar Biografia / Dashboard | Stub |
| ParlamentarMateriasPage filtro por autor | Lista geral, sem filtro `minhas` |
| ParlamentarComissoesPage | Sem filtro por parlamentar logado |
| Editar item de pauta | Só adicionar/remover/reordenar |
| App mobile parlamentar | Planejado |
| Pedir palavra / fase sessão (UI) | Backend existe; UI parcial |
| `GET sessao-ativa` | Sem uso no FE |

---

## Convenções de desenvolvimento

1. Nova rota API → `api/paths.ts` + `*.api.ts`
2. Nova tela → `pages/` + `lazy-pages.ts` + rota em `staff.routes.tsx` ou `parlamentar.routes.tsx`
3. Novo item de menu → `navigation.ts` + `npm run validate:routes`
4. Erros → `showApiError(err)` (`hooks/useAppToast`)
5. Exclusão → `confirmDestructive()` ou `DeleteDialog`
6. Domain layer do backend nunca importa Prisma no FE — tipos em `types/`
7. Mensagens de UI em português brasileiro

---

## Documentação relacionada

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Quick start dev/docker |
| `backend/backend.md` | API NestJS |
| `CLAUDE.md` | Regras globais do monorepo |
| `backend/src/docs/specs/sessoes/` | SPEC sessões |
| `backend/src/docs/specs/votacoes/` | SPEC votações |
