# TASK-FE-002 — MatériasPage: Completa

**Leia antes:** `CLAUDE-FRONTEND.md` · `PATTERNS-FE.md`
**Depende de:** TASK-FE-001 concluída

---

## Fase 1 — Filtros

### T-01 · Atualizar filtros da MateriasPage

- [x] Usar `FiltroLayout` (criado em TASK-FE-001 T-14)
- [x] Campos de filtro conforme documento operacional:
  ```
  Tipo de Matéria    → Dropdown (tiposMateria do useDominios, mostra sigla+nome)
  Ementa             → InputText (busca parcial)
  Núm. Protocolo     → InputText
  Ano da Matéria     → Dropdown (anos do useDominios)
  Data Apresentação  → Calendar range (dataInicio / dataFim)
  Data Publicação    → Calendar range
  Tipo de Autor      → Dropdown (tiposAutor do useDominios)
  Autor              → InputText ou Dropdown condicional
  ```
- [x] Todos em grid `col-12 md:col-6 lg:col-4` — mobile-first
- [x] Limpar filtros reseta todos os campos e chama `buscar()`

---

## Fase 2 — DataTable

### T-02 · Atualizar colunas da DataTable

- [x] Usar `DataTableLayout` (criado em TASK-FE-001 T-15)
- [x] Colunas:
  ```
  Identificação  → materia.identificacao ("PLO nº 3/2025") — sortable
  Ementa         → truncada com tooltip
  Status         → Badge colorido por status (usar MATERIA_STATUS)
  Autor          → nome do autor principal
  Data Protocolo → formatDate(materia.dataProtocolo)
  Ações          → Ver / Editar (só Admin) / Deletar (só Admin)
  ```
- [x] Ação "Ver" → abre `MateriaVerDialog` (exibe Texto Original como link/viewer)
- [x] Ordenação descendente por `createdAt` como padrão
- [x] `size="small"` conforme requisito

---

## Fase 3 — Dialog Ver

### T-03 · Criar `MateriaVerDialog`

- [x] Usar `VerDialog` base (TASK-FE-001 T-17)
- [x] Exibir campos:
  - Identificação, Status (badge), Ementa, Justificativa
  - Autor principal + coautores + relatores (separados em seções)
  - Data protocolo, Data publicação
  - Link para Texto Original (PDF/DOC) — `<a>` com `aria-label`
- [x] Seção "Histórico de Tramitação" — timeline `<Timeline>` PrimeReact
  - cada entrada: status anterior → status novo, despacho, data, responsável
- [x] Responsivo: `width: min(90vw, 800px)`

---

## Fase 4 — Dialog Criar

### T-04 · Atualizar `MateriaCreateDialog`

Campos conforme documento operacional:
- [x] **Tipo de Matéria** * → `Dropdown` com sigla+nome (ex: "PLO — Projeto de Lei Ordinária")
- [x] **Data Protocolo** → `Calendar`
- [x] **Tipo de Autor** * → `Dropdown` (tiposAutor, 26 tipos)
- [x] **Autor** * → campo dinâmico conforme tipo selecionado:
  - Se tipo = Parlamentar → `Dropdown` de parlamentares ativos
  - Se tipo = AutorExterno → `Dropdown` de autores externos (busca por tipo)
  - (Ambos filtram por `tipoAutorId`)
- [x] **Coautor(es)** → `MultiSelect` de parlamentares ou autores externos
- [x] **Relator(es)** → `MultiSelect` (múltiplos permitidos)
- [x] **Ementa** * → `InputTextarea` 3 linhas
- [x] **Justificativa** → `InputTextarea` 5 linhas
- [x] **Texto Original** → `FileUpload` PrimeReact — aceita PDF e DOC
  - Usar `apiFormData()` para enviar multipart
  - Preview do nome do arquivo após seleção

Validação:
- [x] Tipo, TipoAutor, Autor e Ementa são obrigatórios
- [x] Se PARLIAMENTARIAN está logado → Autor preenchido automaticamente (do JWT), campo desabilitado

Lógica de submit:
```
1. Montar FormData com todos os campos
2. Se textoOriginal selecionado: append ao FormData
3. await apiFormData('/legislative/materias', fd)
4. showSuccess('Matéria criada com sucesso')
5. onSaved() → rebusca lista
```

---

## Fase 5 — Dialog Editar

### T-05 · Criar `MateriaEditDialog`

- [x] Mesmos campos do Criar, pré-populados com dados da matéria
- [x] Botão "Editar" visível apenas para `canEdit` (ADMIN_STAFF)
- [x] Campos não editáveis: Tipo de Matéria, Número, Ano (exibir como texto)
- [x] Usar `PATCH /legislative/materias/:id`

---

## Fase 6 — Dialog Deletar

### T-06 · Criar `MateriaDeleteDialog`

- [x] Usar `DeleteDialog` base (TASK-FE-001 T-16)
- [x] Mensagem: `Deseja excluir a matéria "${materia.identificacao}"? Esta ação não pode ser desfeita.`
- [x] Apenas `canDelete` (ADMIN_STAFF) vê o botão na tabela

---

## Fase 7 — Badge de status

### T-07 · Criar `MateriaStatusBadge`

```tsx
const STATUS_SEVERITY: Record<MateriaStatus, 'info' | 'warning' | 'success' | 'danger' | 'secondary'> = {
  DRAFT:                  'secondary',
  PROTOCOLADA:            'info',
  EM_TRAMITACAO:          'warning',
  EM_PAUTA:               'warning',
  APROVADA:               'success',
  REJEITADA:              'danger',
  ARQUIVADA:              'secondary',
  RETIRADA:               'secondary',
  TRANSFORMADA_EM_NORMA:  'success',
};

export function MateriaStatusBadge({ status }: { status: MateriaStatus }) {
  return (
    <Tag
      value={MATERIA_STATUS[status]}
      severity={STATUS_SEVERITY[status]}
    />
  );
}
```

---

## Checklist

- [x] Filtros em grid responsivo col-12/md:col-6/lg:col-4
- [x] DataTable com paginação lazy server-side
- [x] Identificação exibida como "PLO nº 3/2025" (não só número)
- [x] Ações Editar/Deletar visíveis apenas para `canEdit`
- [x] Parlamentar logado → autor preenchido do JWT, campo desabilitado
- [x] Upload de Texto Original via `apiFormData()`
- [x] Múltiplos relatores via MultiSelect
- [x] Histórico de tramitação no dialog Ver
- [x] Status PROTOCOLADA e EM_PAUTA com badge correto

---
---

# TASK-FE-003 — SessoesPage e Votações

**Depende de:** TASK-FE-001 concluída

---

## Fase 1 — Ciclo de vida da sessão

### T-01 · Atualizar `SessoesPage` com novos status

- [x] Exibir `statusSessao` (AGENDADA/ABERTA/SUSPENSA/ENCERRADA/CANCELADA) como badge
- [x] Botões de ação por status:
  ```
  AGENDADA  → [Abrir sessão] [Cancelar]
  ABERTA    → [Suspender] [Encerrar]  + exibir quórum atual
  SUSPENSA  → [Retomar (Abrir)] [Encerrar]
  ENCERRADA → apenas visualização
  CANCELADA → apenas visualização
  ```
- [x] Botões visíveis apenas para `canManageSessao` (ADMIN_STAFF e STAFF)

### T-02 · Criar `AbrirSessaoDialog`

- [x] Exibir quórum calculado: `GET /sessoes-plenarias/:id/quorum`
  - "Quórum mínimo: X / Presentes: Y — ✅ Tem quórum / ⚠️ Sem quórum"
- [x] Campo `observacoes` opcional
- [x] Confirmar → `POST /sessoes-plenarias/:id/abrir`
- [x] Aviso se sem quórum (mas não bloqueia — backend valida)

### T-03 · Criar `EncerrarSessaoDialog`

- [x] Campo `observacoes` opcional
- [x] Confirmar → `POST /sessoes-plenarias/:id/encerrar`
- [x] Aviso: "Ao encerrar, a pauta será fechada automaticamente"

---

## Fase 2 — Votações

### T-04 · Atualizar painel de votação

- [x] Exibir contadores calculados: `votosSim`, `votosNao`, `abstencoes` (vêm do backend)
- [x] Para votação NOMINAL: exibir lista de votos individuais com nome + voto
- [x] Para votação SECRETA: exibir apenas contadores, nunca nomes
- [x] Botão "Registrar meu voto" visível apenas para `canVotar` (PARLIAMENTARIAN)
- [x] Botão "Encerrar votação" visível apenas para `canManageSessao`

### T-05 · Criar `RegistrarVotoDialog` (PARLIAMENTARIAN)

- [x] Opções: SIM / NÃO / ABSTENÇÃO
- [x] Confirmar → `POST /votacoes/:id/votos`
- [x] Feedback visual do voto atual (pode alterar até encerrar)

### T-06 · Badge `SessaoStatusBadge`

```tsx
const SESSAO_STATUS_SEVERITY = {
  AGENDADA:  'info',
  ABERTA:    'success',
  SUSPENSA:  'warning',
  ENCERRADA: 'secondary',
  CANCELADA: 'danger',
};
```

---

## Checklist

- [x] Botões de ciclo de vida aparecem conforme status atual
- [x] `canManageSessao` controla botões de abertura/encerramento
- [x] `canVotar` controla botão de voto
- [x] Votação SECRETA não exibe nomes dos votantes
- [x] Contadores vêm do backend (não calculados no frontend)

---
---

# TASK-FE-004 — NormasPage e AtosPage

**Depende de:** TASK-FE-001 concluída (normasApi e atosApi criados)

---

## NormasPage

### T-01 · Atualizar filtros

Campos conforme documento operacional:
```
Tipo Norma         → Dropdown (tiposNorma do useDominios)
Número             → InputText
Ano                → Dropdown
Data (range)       → Calendar range
Data Publicação (range) → Calendar range
Esfera Federação   → Dropdown (Municipal / Estadual / Federal)
Ementa contém      → InputText
```

### T-02 · Atualizar DataTable

Colunas:
```
Tipo    → nome abreviado
Número  → string
Ano     → number
Ementa  → truncada
Status  → badge derivado (VIGENTE / PUBLICADA / VETADA etc.)
Ações   → Ver / Editar (Admin) / Deletar (Admin)
```

### T-03 · Criar `NormaVerDialog`

- [x] Campos detalhados: tipo, número, ano, esfera, ementa
- [x] Ciclo jurídico em timeline: sanção → veto/promulgação → publicação → vigência → revogação
- [x] Links: URL externa, Texto Integral (PDF), Áudio
- [x] Campo "Complementar" exibido como badge/chip
- [x] Matéria de origem como link (se existir)

### T-04 · Criar `NormaCreateDialog`

Campos conforme documento operacional:
- [x] **Tipo da Norma Jurídica** * → `Dropdown`
- [x] **Ano** * → `Dropdown`
- [x] **Número** * → `InputText`
- [x] **Data** * → `Calendar`
- [x] **Esfera Federação** * → `Dropdown` (Municipal / Estadual / Federal)
- [x] **Complementar?** → `Checkbox`
- [x] **Tipo de Matéria** → `Dropdown` (opcional — para vínculo)
- [x] **Ano Matéria** → `Dropdown` (aparece quando Tipo Matéria selecionado)
- [x] **Matéria** → `Dropdown` filtrado por tipo+ano (busca `/legislative/materias`)
- [x] **Data Publicação** → `Calendar`
- [x] **Veículo Publicação** → `InputText`
- [x] **Pg. Início / Pg. Fim** → `InputNumber`
- [x] **Identificador** → `Dropdown` (identificadoresNorma do useDominios)
- [x] **URL externa** → `InputText`
- [x] **Texto Integral** → `FileUpload` (PDF/DOC) — `apiFormData()`
- [x] **Áudio** → `FileUpload` (MP3/WAV)
- [x] **Ementa** * → `InputTextarea`

### T-05 · Criar `NormaStatusBadge`

```tsx
const NORMA_STATUS_SEVERITY = {
  EM_TRAMITE:  'secondary',
  SANCIONADA:  'info',
  VETADA:      'danger',
  PROMULGADA:  'warning',
  PUBLICADA:   'info',
  VIGENTE:     'success',
  REVOGADA:    'secondary',
};
```

---

## AtosPage

### T-06 · Atualizar filtros

```
Tipo do Ato        → Dropdown (tiposAto do useDominios)
Número             → InputText
Data (range)       → Calendar range
Data Publicação (range) → Calendar range
```

### T-07 · Atualizar DataTable

Colunas:
```
Tipo           → nome
Número         → string
Data           → formatDate(ato.dataAto)
Data Publicação→ formatDate(ato.dataPublicacao)
Ementa         → truncada
Ações          → Ver / Editar (Admin) / Deletar (Admin)
```

### T-08 · Criar `AtoCreateDialog`

Campos conforme documento operacional:
- [x] **Tipo do Ato** * → `Dropdown` (tiposAto)
- [x] **Classificação** → `Dropdown` (classificacoesAto)
- [x] **Identificador** → `Dropdown` (identificadoresNorma — mesma lista da Norma)
- [x] **Número** * → `InputText`
- [x] **Data** * → `Calendar` (dataAto)
- [x] **Data Publicação** → `Calendar`
- [x] **Anexo** * → `FileUpload` (PDF/DOC) — `apiFormData()`
- [x] **Texto** → `InputTextarea`
- [x] **Ementa** → `InputTextarea`

### T-09 · `AtoVerDialog`

- [x] Todos os campos + link para Anexo
- [x] Ementa em destaque no topo

---

## Checklist — Normas e Atos

- [x] `normasApi` e `atosApi` usados (não chamadas inline)
- [x] Filtros em grid responsivo
- [x] Status da norma exibido como badge derivado
- [x] Upload de arquivo via `apiFormData()`
- [x] Campo "Complementar?" no formulário e no dialog Ver
- [x] `ato.dataAto` exibido como "Data" (não `dataInicio`)
- [x] Atos visíveis apenas quando `authType !== 'camara'` (já existe `showAdministrativo`)
