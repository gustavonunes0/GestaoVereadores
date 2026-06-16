# TASK-FE-002 — MatériasPage: Completa

**Leia antes:** `CLAUDE-FRONTEND.md` · `PATTERNS-FE.md`
**Depende de:** TASK-FE-001 concluída

---

## Fase 1 — Filtros

### T-01 · Atualizar filtros da MateriasPage

- [x] Usar `FiltroLayout` (criado em TASK-FE-001 T-14)
- [ ] Campos de filtro conforme documento operacional:
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
- [ ] Todos em grid `col-12 md:col-6 lg:col-4` — mobile-first
- [ ] Limpar filtros reseta todos os campos e chama `buscar()`

---

## Fase 2 — DataTable

### T-02 · Atualizar colunas da DataTable

- [ ] Usar `DataTableLayout` (criado em TASK-FE-001 T-15)
- [ ] Colunas:
  ```
  Identificação  → materia.identificacao ("PLO nº 3/2025") — sortable
  Ementa         → truncada com tooltip
  Status         → Badge colorido por status (usar MATERIA_STATUS)
  Autor          → nome do autor principal
  Data Protocolo → formatDate(materia.dataProtocolo)
  Ações          → Ver / Editar (só Admin) / Deletar (só Admin)
  ```
- [ ] Ação "Ver" → abre `MateriaVerDialog` (exibe Texto Original como link/viewer)
- [ ] Ordenação descendente por `createdAt` como padrão
- [ ] `size="small"` conforme requisito

---

## Fase 3 — Dialog Ver

### T-03 · Criar `MateriaVerDialog`

- [ ] Usar `VerDialog` base (TASK-FE-001 T-17)
- [ ] Exibir campos:
  - Identificação, Status (badge), Ementa, Justificativa
  - Autor principal + coautores + relatores (separados em seções)
  - Data protocolo, Data publicação
  - Link para Texto Original (PDF/DOC) — `<a>` com `aria-label`
- [ ] Seção "Histórico de Tramitação" — timeline `<Timeline>` PrimeReact
  - cada entrada: status anterior → status novo, despacho, data, responsável
- [ ] Responsivo: `width: min(90vw, 800px)`

---

## Fase 4 — Dialog Criar

### T-04 · Atualizar `MateriaCreateDialog`

Campos conforme documento operacional:
- [ ] **Tipo de Matéria** * → `Dropdown` com sigla+nome (ex: "PLO — Projeto de Lei Ordinária")
- [ ] **Data Protocolo** → `Calendar`
- [ ] **Tipo de Autor** * → `Dropdown` (tiposAutor, 26 tipos)
- [ ] **Autor** * → campo dinâmico conforme tipo selecionado:
  - Se tipo = Parlamentar → `Dropdown` de parlamentares ativos
  - Se tipo = AutorExterno → `Dropdown` de autores externos (busca por tipo)
  - (Ambos filtram por `tipoAutorId`)
- [ ] **Coautor(es)** → `MultiSelect` de parlamentares ou autores externos
- [ ] **Relator(es)** → `MultiSelect` (múltiplos permitidos)
- [ ] **Ementa** * → `InputTextarea` 3 linhas
- [ ] **Justificativa** → `InputTextarea` 5 linhas
- [ ] **Texto Original** → `FileUpload` PrimeReact — aceita PDF e DOC
  - Usar `apiFormData()` para enviar multipart
  - Preview do nome do arquivo após seleção

Validação:
- [ ] Tipo, TipoAutor, Autor e Ementa são obrigatórios
- [ ] Se PARLIAMENTARIAN está logado → Autor preenchido automaticamente (do JWT), campo desabilitado

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

- [ ] Mesmos campos do Criar, pré-populados com dados da matéria
- [ ] Botão "Editar" visível apenas para `canEdit` (ADMIN_STAFF)
- [ ] Campos não editáveis: Tipo de Matéria, Número, Ano (exibir como texto)
- [ ] Usar `PATCH /legislative/materias/:id`

---

## Fase 6 — Dialog Deletar

### T-06 · Criar `MateriaDeleteDialog`

- [ ] Usar `DeleteDialog` base (TASK-FE-001 T-16)
- [ ] Mensagem: `Deseja excluir a matéria "${materia.identificacao}"? Esta ação não pode ser desfeita.`
- [ ] Apenas `canDelete` (ADMIN_STAFF) vê o botão na tabela

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

- [ ] Filtros em grid responsivo col-12/md:col-6/lg:col-4
- [ ] DataTable com paginação lazy server-side
- [ ] Identificação exibida como "PLO nº 3/2025" (não só número)
- [ ] Ações Editar/Deletar visíveis apenas para `canEdit`
- [ ] Parlamentar logado → autor preenchido do JWT, campo desabilitado
- [ ] Upload de Texto Original via `apiFormData()`
- [ ] Múltiplos relatores via MultiSelect
- [ ] Histórico de tramitação no dialog Ver
- [ ] Status PROTOCOLADA e EM_PAUTA com badge correto

---
---

# TASK-FE-003 — SessoesPage e Votações

**Depende de:** TASK-FE-001 concluída

---

## Fase 1 — Ciclo de vida da sessão

### T-01 · Atualizar `SessoesPage` com novos status

- [ ] Exibir `statusSessao` (AGENDADA/ABERTA/SUSPENSA/ENCERRADA/CANCELADA) como badge
- [ ] Botões de ação por status:
  ```
  AGENDADA  → [Abrir sessão] [Cancelar]
  ABERTA    → [Suspender] [Encerrar]  + exibir quórum atual
  SUSPENSA  → [Retomar (Abrir)] [Encerrar]
  ENCERRADA → apenas visualização
  CANCELADA → apenas visualização
  ```
- [ ] Botões visíveis apenas para `canManageSessao` (ADMIN_STAFF e STAFF)

### T-02 · Criar `AbrirSessaoDialog`

- [ ] Exibir quórum calculado: `GET /sessoes-plenarias/:id/quorum`
  - "Quórum mínimo: X / Presentes: Y — ✅ Tem quórum / ⚠️ Sem quórum"
- [ ] Campo `observacoes` opcional
- [ ] Confirmar → `POST /sessoes-plenarias/:id/abrir`
- [ ] Aviso se sem quórum (mas não bloqueia — backend valida)

### T-03 · Criar `EncerrarSessaoDialog`

- [ ] Campo `observacoes` opcional
- [ ] Confirmar → `POST /sessoes-plenarias/:id/encerrar`
- [ ] Aviso: "Ao encerrar, a pauta será fechada automaticamente"

---

## Fase 2 — Votações

### T-04 · Atualizar painel de votação

- [ ] Exibir contadores calculados: `votosSim`, `votosNao`, `abstencoes` (vêm do backend)
- [ ] Para votação NOMINAL: exibir lista de votos individuais com nome + voto
- [ ] Para votação SECRETA: exibir apenas contadores, nunca nomes
- [ ] Botão "Registrar meu voto" visível apenas para `canVotar` (PARLIAMENTARIAN)
- [ ] Botão "Encerrar votação" visível apenas para `canManageSessao`

### T-05 · Criar `RegistrarVotoDialog` (PARLIAMENTARIAN)

- [ ] Opções: SIM / NÃO / ABSTENÇÃO
- [ ] Confirmar → `POST /votacoes/:id/votos`
- [ ] Feedback visual do voto atual (pode alterar até encerrar)

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

- [ ] Botões de ciclo de vida aparecem conforme status atual
- [ ] `canManageSessao` controla botões de abertura/encerramento
- [ ] `canVotar` controla botão de voto
- [ ] Votação SECRETA não exibe nomes dos votantes
- [ ] Contadores vêm do backend (não calculados no frontend)

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

- [ ] Campos detalhados: tipo, número, ano, esfera, ementa
- [ ] Ciclo jurídico em timeline: sanção → veto/promulgação → publicação → vigência → revogação
- [ ] Links: URL externa, Texto Integral (PDF), Áudio
- [ ] Campo "Complementar" exibido como badge/chip
- [ ] Matéria de origem como link (se existir)

### T-04 · Criar `NormaCreateDialog`

Campos conforme documento operacional:
- [ ] **Tipo da Norma Jurídica** * → `Dropdown`
- [ ] **Ano** * → `Dropdown`
- [ ] **Número** * → `InputText`
- [ ] **Data** * → `Calendar`
- [ ] **Esfera Federação** * → `Dropdown` (Municipal / Estadual / Federal)
- [ ] **Complementar?** → `Checkbox`
- [ ] **Tipo de Matéria** → `Dropdown` (opcional — para vínculo)
- [ ] **Ano Matéria** → `Dropdown` (aparece quando Tipo Matéria selecionado)
- [ ] **Matéria** → `Dropdown` filtrado por tipo+ano (busca `/legislative/materias`)
- [ ] **Data Publicação** → `Calendar`
- [ ] **Veículo Publicação** → `InputText`
- [ ] **Pg. Início / Pg. Fim** → `InputNumber`
- [ ] **Identificador** → `Dropdown` (identificadoresNorma do useDominios)
- [ ] **URL externa** → `InputText`
- [ ] **Texto Integral** → `FileUpload` (PDF/DOC) — `apiFormData()`
- [ ] **Áudio** → `FileUpload` (MP3/WAV)
- [ ] **Ementa** * → `InputTextarea`

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
- [ ] **Tipo do Ato** * → `Dropdown` (tiposAto)
- [ ] **Classificação** → `Dropdown` (classificacoesAto)
- [ ] **Identificador** → `Dropdown` (identificadoresNorma — mesma lista da Norma)
- [ ] **Número** * → `InputText`
- [ ] **Data** * → `Calendar` (dataAto)
- [ ] **Data Publicação** → `Calendar`
- [ ] **Anexo** * → `FileUpload` (PDF/DOC) — `apiFormData()`
- [ ] **Texto** → `InputTextarea`
- [ ] **Ementa** → `InputTextarea`

### T-09 · `AtoVerDialog`

- [ ] Todos os campos + link para Anexo
- [ ] Ementa em destaque no topo

---

## Checklist — Normas e Atos

- [ ] `normasApi` e `atosApi` usados (não chamadas inline)
- [ ] Filtros em grid responsivo
- [ ] Status da norma exibido como badge derivado
- [ ] Upload de arquivo via `apiFormData()`
- [ ] Campo "Complementar?" no formulário e no dialog Ver
- [ ] `ato.dataAto` exibido como "Data" (não `dataInicio`)
- [ ] Atos visíveis apenas quando `authType !== 'camara'` (já existe `showAdministrativo`)
