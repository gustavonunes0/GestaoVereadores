# TASK-FE-005 — AutoresPage: Migrar de GuestUser para AutorExterno

**Depende de:** TASK-FE-001 (autoresExternosApi criado)
**Contexto:** A página `/camara/autores` hoje usa GuestUser.
O backend criou AutorExterno (TASK-001 M3) — entidade separada para autores sem login.
Esta task migra a page para o novo modelo.

---

## Fase 1 — Filtros

### T-01 · Filtros da AutoresPage

- [ ] Campos:
  ```
  Tipo de Autor  → Dropdown (tiposAutor do useDominios, 26 tipos com idNegocio)
  Nome           → InputText
  Cargo          → InputText
  Instituição    → InputText
  ```
- [ ] Grid responsivo `col-12 md:col-6 lg:col-3`

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

---

## Fase 3 — Dialogs

### T-03 · `AutorExternoCreateDialog`

Campos dinâmicos conforme Categoria do tipo de autor:

```tsx
// Categoria A — entidade coletiva (IDs 2,3,4,5,6,7,10,17,20,25,26)
// Mostra: nome, tipoAutorId
// Oculta: cargo, cpf, registro, partido, uf

// Categoria B — cargo + pessoa (IDs 8,9,11,12,14,16,21,22,23,24)
// Mostra: nome, cargo, instituicao, email, telefone, cpf

// Categoria C — registro profissional (IDs 13, 15)
// Mostra: nome, cargo, instituicao, registro (OAB/CRM), email

// Categoria D — político externo (IDs 23, 24)
// Mostra: nome, cargo, partido, uf (se ID 23)
```

Implementação:
- [ ] **Tipo de Autor** * → `Dropdown` (26 tipos)
- [ ] **Nome** * → `InputText` (label muda: "Nome da Pessoa" para categoria B, "Nome da Entidade" para A)
- [ ] **Cargo** → `InputText` (visível apenas categorias B, C, D)
- [ ] **Instituição** → `InputText` (visível apenas B e C)
- [ ] **Registro** → `InputText` (visível apenas C — label: "Nº OAB / CRM")
- [ ] **Partido** → `InputText` (visível apenas D)
- [ ] **UF** → `Dropdown` (27 estados + DF — visível apenas ID 23 Deputado Federal)
- [ ] **CPF** → `InputMask` `999.999.999-99` (opcional, B e C)
- [ ] **E-mail** → `InputText` (opcional)
- [ ] **Telefone** → `InputMask` `(99) 9 9999-9999` (opcional)

Lógica de categorias:
```ts
const CATEGORIA_A_IDS = [2, 3, 4, 5, 6, 7, 10, 17, 20, 25, 26];
const CATEGORIA_C_IDS = [13, 15];
const CATEGORIA_D_IDS = [23, 24];
const ID_DEPUTADO_FEDERAL = 23;

function getCategoria(idNegocio: number): 'A' | 'B' | 'C' | 'D' {
  if (CATEGORIA_A_IDS.includes(idNegocio)) return 'A';
  if (CATEGORIA_C_IDS.includes(idNegocio)) return 'C';
  if (CATEGORIA_D_IDS.includes(idNegocio)) return 'D';
  return 'B';
}
```

### T-04 · `AutorExternoVerDialog`

- [ ] Exibir todos os campos preenchidos
- [ ] Campo "Registro" com label contextual (OAB, CRM etc.)
- [ ] Seção "Matérias como autor" → lista simples com link para MateriasPage filtrada

### T-05 · `AutorExternoEditDialog`

- [ ] Mesmos campos do Criar, pré-populados
- [ ] Apenas `canEdit` (ADMIN_STAFF)

### T-06 · Remover referências a `GuestUser` como autor de matéria

- [ ] `MateriaCreateDialog` — campo Autor não usa mais `guestUsersApi`
- [ ] Tipo `Autor` em `types/` — remover `guestUserId` como opção de exibição de nome
- [ ] `AutorResolverService` do frontend resolve nome via `autorExterno.nome`

---

## Checklist

- [ ] `/camara/autores` usa `autoresExternosApi` (não `guestUsersApi`)
- [ ] Formulário dinâmico oculta campos irrelevantes por categoria de tipo
- [ ] Campo UF visível apenas para Deputado Federal (ID 23)
- [ ] Campo Registro com label contextual
- [ ] `canManagePessoas` controla Criar/Editar/Deletar (apenas ADMIN_STAFF)

---
---

# TASK-FE-006 — Agenda, Roles/Usuários e Correções Gerais

**Depende de:** TASK-FE-001 concluída

---

## AgendaPage

### T-01 · Atualizar filtros da AgendaPage

```
Tipo de Evento  → Dropdown (SESSAO / REUNIAO / AUDIENCIA / EVENTO / COMPROMISSO)
Data (range)    → Calendar range
Público externo → Checkbox (mostrar apenas eventos públicos)
```

### T-02 · Atualizar DataTable da AgendaPage

Colunas novas:
```
Tipo         → badge por tipo
Título       → string
Data início  → formatDate
Local        → string (novo campo backend)
Sessão       → link para sessão (se sessaoPlenariaId preenchido)
Ações        → Ver / Editar (Admin) / Deletar (Admin)
```

### T-03 · `AgendaCreateDialog` — atualizar

- [ ] Adicionar campo **Local** → `InputText` (novo campo backend)
- [ ] Adicionar campo **Sessão vinculada** → `Dropdown` de sessões agendadas
  - Aparece quando `tipo === SESSAO`
  - Busca `GET /sessoes-plenarias?statusSessao=AGENDADA`
- [ ] Adicionar campo **Link de transmissão** → `InputText` (URL)
- [ ] Adicionar campo **Público externo** → `Checkbox`
  - Tooltip: "Eventos públicos aparecem no portal da câmara sem login"

---

## UsuariosPage

### T-04 · Atualizar UsuariosPage com novo TenantUserRole

- [ ] Coluna "Perfil" exibe: `ADMIN_STAFF` / `STAFF` / `PARLIAMENTARIAN`
  - Labels PT-BR: "Administrador" / "Operador" / "Parlamentar"
- [ ] Ao convidar usuário: `Dropdown` de perfil com as 3 opções
- [ ] Ao editar perfil: trocar role via `PATCH /usuarios/:id` com `{ role }`
- [ ] Remover referências a `isTenantAdmin`, `isTenantStaff`, `isParliamentarian` (deprecated)
- [ ] Ocultar opção PARLIAMENTARIAN no convite se já existe Parliamentarian com aquele email

---

## Correções gerais (gaps do MAPA-FRONTEND.md)

### T-05 · Remover `ContextBanner` das 5 páginas

- [ ] Identificar as 5 páginas que ainda importam `ContextBanner`
  (Dashboard, Matérias, Sessões, Normas, Relatórios)
- [ ] Remover import e uso em cada uma
- [ ] Deletar `components/ContextBanner.tsx` após confirmar zero importações

### T-06 · Atualizar `navigation.ts` com novos roles

- [ ] Verificar visibilidade de menus que usam `canWrite`
- [ ] Garantir que "Autores" mostra na sidebar para ADMIN_STAFF e STAFF
- [ ] Garantir que "Usuários (SIGL)" continua com guard `isMaster`

### T-07 · `DashboardPage` — atualizar pipeline

- [ ] Pipeline 5 etapas mostra status correto de cada módulo
- [ ] Contador de matérias segmenta por status (incluindo PROTOCOLADA e EM_PAUTA)
- [ ] Badge de sessão usa novo `statusSessao` (não `situacaoId`)

### T-08 · `FrentesPage` — completar CRUD

- [ ] Atualmente só tem list/create — adicionar Update e Remove
- [ ] `Dialog Editar` com campos: nome, tema, descrição, coordenador, datas
- [ ] `Dialog Deletar` com confirmação

### T-09 · Adicionar `aria-label` em todos os botões de ícone

- [ ] Varrer todos os `<Button icon="pi pi-*" />` sem texto visível
- [ ] Adicionar `aria-label` descritivo em cada um
- [ ] Prioridade: MateriasPage, NormasPage, AtosPage, SessoesPage

### T-10 · Garantir HTML semântico em todas as pages

- [ ] Verificar que cada page tem `<main>` como container raiz
- [ ] Verificar que filtros estão em `<section aria-label="Filtros">`
- [ ] Verificar que tabela está em `<section aria-label="Lista de ...">`

---

## Checklist final geral

- [ ] `npm run build` — zero erros TypeScript
- [ ] `npm run dev` — zero erros no console do browser
- [ ] Todas as 16 rotas lazy-loaded (verificar Network tab no DevTools)
- [ ] `usePermissions.canEdit` retorna false para STAFF → Editar/Deletar ocultos
- [ ] `usePermissions.canVotar` retorna true apenas para PARLIAMENTARIAN
- [ ] Upload de arquivo funciona para Texto Original (Matéria) e Anexo (Ato)
- [ ] Formulário AutorExterno oculta campos corretamente por categoria
- [ ] AgendaPage exibe campo Local
- [ ] SessoesPage exibe botões de ciclo de vida corretos por status
- [ ] NormasPage usa normasApi (não chamadas inline)
- [ ] AtosPage usa atosApi (não chamadas inline)
- [ ] ContextBanner removido de todas as 5 páginas
- [ ] Responsividade: sidebar colapsa em mobile, filtros empilham, tabela scroll horizontal
