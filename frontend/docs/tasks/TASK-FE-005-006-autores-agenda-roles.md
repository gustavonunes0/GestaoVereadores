# TASK-FE-005 — AutoresPage: Migrar de GuestUser para AutorExterno

**Depende de:** TASK-FE-001 (autoresExternosApi criado)
**Contexto:** A página `/camara/autores` hoje usa GuestUser.
O backend criou AutorExterno (TASK-001 M3) — entidade separada para autores sem login.
Esta task migra a page para o novo modelo.

---

## Fase 1 — Filtros

### T-01 · Filtros da AutoresPage

- [x] Campos:
  ```
  Tipo de Autor  → Dropdown (tiposAutor do useDominios, 26 tipos com idNegocio)
  Nome           → InputText
  Cargo          → InputText
  Instituição    → InputText
  ```
- [x] Grid responsivo `col-12 md:col-6 lg:col-3`

---

## Fase 2 — DataTable

### T-02 · Colunas

```
Nome        → string
Tipo        → tipoAutor.nome
Cargo       → string (opcional)
Instituição → string (opcional)
Ações       → Ver / Editar (Admin) / Deletar (Admin)
```

- [x] Implementado com DataTableLayout

---

## Fase 3 — Dialogs

### T-03 · `AutorExternoCreateDialog`

Campos dinâmicos conforme Categoria do tipo de autor:

```tsx
// Categoria A — entidade coletiva (IDs 2,3,4,5,6,7,10,17,20,25,26)
// Categoria B — cargo + pessoa (IDs 8,9,11,12,14,16,21,22,23,24)
// Categoria C — registro profissional (IDs 13, 15)
// Categoria D — político externo (IDs 23, 24)
```

- [x] **Tipo de Autor** * → `Dropdown` (26 tipos)
- [x] **Nome** * → `InputText` (label muda: "Nome da Pessoa" para categoria B, "Nome da Entidade" para A)
- [x] **Cargo** → `InputText` (visível apenas categorias B, C, D)
- [x] **Instituição** → `InputText` (visível apenas B e C)
- [x] **Registro** → `InputText` (visível apenas C — label: "Nº OAB / CRM")
- [x] **Partido** → `InputText` (visível apenas D)
- [x] **UF** → `Dropdown` (27 estados + DF — visível apenas ID 23 Deputado Federal)
- [x] **CPF** → `InputMask` `999.999.999-99` (opcional, B e C)
- [x] **E-mail** → `InputText` (opcional)
- [x] **Telefone** → `InputMask` `(99) 9 9999-9999` (opcional)

### T-04 · `AutorExternoVerDialog`

- [x] Exibir todos os campos preenchidos
- [x] Campo "Registro" com label contextual (OAB, CRM etc.)
- [x] Seção "Matérias como autor" → lista simples com link para MateriasPage filtrada

### T-05 · `AutorExternoEditDialog`

- [x] Mesmos campos do Criar, pré-populados
- [x] Apenas `canEdit` (ADMIN_STAFF)

### T-06 · Remover referências a `GuestUser` como autor de matéria

- [x] `MateriaCreateDialog` — campo Autor não usa mais `guestUsersApi`
- [x] Tipo `AutorMateria` em `materias.api.ts` — removido `guestUserId` e tipo `'guestUser'`
- [x] `MateriaVerDialog` resolve nome via `materia.autor.nome` (server-side)

---

## Checklist

- [x] `/camara/autores` usa `autoresExternosApi` (não `guestUsersApi`)
- [x] Formulário dinâmico oculta campos irrelevantes por categoria de tipo
- [x] Campo UF visível apenas para Deputado Federal (ID 23)
- [x] Campo Registro com label contextual
- [x] `canManagePessoas` controla Criar/Editar/Deletar (apenas ADMIN_STAFF)

---
---

# TASK-FE-006 — Agenda, Roles/Usuários e Correções Gerais

**Depende de:** TASK-FE-001 concluída

---

## AgendaPage

### T-01 · Atualizar filtros da AgendaPage

- [x] Tipo de Evento → Dropdown (SESSAO / REUNIAO / AUDIENCIA / EVENTO / COMPROMISSO)
- [x] Data (range) → Calendar range
- [x] Público externo → Checkbox (mostrar apenas eventos públicos)

### T-02 · Atualizar DataTable da AgendaPage

Colunas implementadas:
- [x] Tipo → badge por tipo
- [x] Título → string
- [x] Data início → formatDate
- [x] Local → string (novo campo backend)
- [x] Sessão → link para sessão (se sessaoPlenariaId preenchido)
- [x] Ações → Ver / Editar (Admin) / Deletar (Admin)

### T-03 · `AgendaCreateDialog` — atualizar

- [x] Adicionar campo **Local** → `InputText` (novo campo backend)
- [x] Adicionar campo **Sessão vinculada** → `Dropdown` de sessões agendadas
  - Aparece quando `tipo === SESSAO`
  - Busca `GET /sessoes-plenarias?statusSessao=AGENDADA`
- [x] Adicionar campo **Link de transmissão** → `InputText` (URL)
- [x] Adicionar campo **Público externo** → `Checkbox`
  - Tooltip: "Eventos públicos aparecem no portal da câmara sem login"

---

## UsuariosPage

### T-04 · Atualizar UsuariosPage com novo TenantUserRole

- [x] Coluna "Perfil" exibe: `ADMIN_STAFF` / `STAFF` / `PARLIAMENTARIAN`
  - Labels PT-BR: "Administrador" / "Operador" / "Parlamentar"
- [x] Ao convidar usuário: `Dropdown` de perfil com as 3 opções
- [x] Ao editar perfil: trocar role via `PATCH /usuarios/:id` com `{ role }`
- [x] Remover referências a `isTenantAdmin`, `isTenantStaff`, `isParliamentarian` (deprecated)

---

## Correções gerais (gaps do MAPA-FRONTEND.md)

### T-05 · Remover `ContextBanner` das páginas

- [x] Removido de DashboardPage, SessoesPage, RelatoriosPage
- [x] MateriasPage e NormasPage nunca tiveram ContextBanner
- [x] `components/ContextBanner.tsx` deletado (zero importadores)

### T-06 · Atualizar `navigation.ts` com novos roles

- [x] "Autores" aparece na sidebar para todos os perfis (leitura livre; canManagePessoas controla ações)
- [x] "Usuários (SIGL)" controlado via `showAdmin={isMaster}` no Layout

### T-07 · `DashboardPage` — pipeline

- [ ] Pipeline é estático — badges de status de sessão dinâmicos não implementados
  - Não bloqueia uso; pipeline é informacional

### T-08 · `FrentesPage` — completar CRUD

- [x] Update e Remove implementados
- [x] Dialog Editar com campos: nome, tema, descrição, coordenador, datas
- [x] Dialog Deletar com confirmação

### T-09 · Adicionar `aria-label` em todos os botões de ícone

- [x] `DataTableLayout` — botões Ver/Editar/Deletar têm `aria-label`
- [x] `SessoesPage` — botões de ciclo de vida têm label visível

### T-10 · Garantir HTML semântico em todas as pages

- [x] `AutoresPage` — corrigido para `<main>` (estava `<section>`)
- [x] `MateriasPage`, `NormasPage`, `AtosPage` — usam `<main>`
- [x] Filtros em `<section aria-label="Filtros de pesquisa">` onde aplicável

---

## Checklist final geral

- [x] `npm run build` — zero erros TypeScript
- [x] Todas as 16 rotas lazy-loaded
- [x] `usePermissions.canEdit` retorna false para STAFF
- [x] `usePermissions.canVotar` retorna true apenas para PARLIAMENTARIAN
- [x] Formulário AutorExterno oculta campos corretamente por categoria
- [x] AgendaPage exibe campo Local e coluna Sessão vinculada
- [x] SessoesPage exibe botões de ciclo de vida corretos por status
- [x] NormasPage usa normasApi (não chamadas inline)
- [x] AtosPage usa atosApi (não chamadas inline)
- [x] ContextBanner removido de todas as páginas
- [ ] T-07 DashboardPage pipeline dinâmico — não implementado (opcional)
