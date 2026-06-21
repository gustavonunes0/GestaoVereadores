# PROMPT — FE: Matérias Legislativas

> Cole este prompt no Claude Code após `cd frontend && claude`.

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-MATERIAS-criar-editar.md

Confirme o escopo antes de escrever qualquer linha de código.

══════════════════════════════════════════════════════════════════
REGRAS DE AUTORIA — LER ANTES DE QUALQUER COMPONENTE
══════════════════════════════════════════════════════════════════

Autor e coautor usam o mesmo campo dinâmico (AutorField).
Tipos disponíveis — TODOS são Dropdown:

  PARLAMENTAR    → Dropdown com ParlamentarianUser ativos (vereadores)
                   Exibe: parliamentaryName (negrito) + user.nome (menor)
                   Busca: GET /legislative/parlamentares/usuarios/ativos
                   filter=true para busca dentro do dropdown

  TENANT_PARTNER → Dropdown com TenantPartners
                   Busca: GET /identidade/tenant-partners (com usuario incluído)
                   Exibe: nome da instituição + user.nome vinculado
                   Parceiro sem usuario → item visível mas com aviso vermelho
                   Se selecionado sem usuario → toast aviso, limpar seleção
                   O autor salvo é o tenantPartnerUser.id, não o partner.id

  COMISSAO       → Dropdown com comissões cadastradas
                   Busca: GET /legislative/comissoes
                   filter=true

Sem InputText livre. Sem PREFEITO. Sem EXECUTIVO.
Trocar tipo → limpar seleção anterior.

Coautores:
  Lista dinâmica, sem limite de quantidade.
  Cada item tem seu próprio AutorField completo (tipo + campo).
  localId = crypto.randomUUID() — só para key do React, nunca vai ao backend.
  Campo "Relator" REMOVIDO de todos os formulários.

══════════════════════════════════════════════════════════════════
BLOCO 1 — TIPOS E PATHS
══════════════════════════════════════════════════════════════════

types/materias.ts:
  StatusMateria (9 valores)
  TipoAutorMateria = 'PARLAMENTAR' | 'TENANT_PARTNER' | 'COMISSAO'

  AutorSelecionado {
    tipo: TipoAutorMateria
    parlamentarianUserId?, parlamentarianUserNome?
    tenantPartnerUserId?, tenantPartnerUserNome?, tenantPartnerNome?
    comissaoId?, comissaoNome?
  }

  Autor { id, tipoAutor, parlamentarianUser?, tenantPartnerUser?, comissao? }
  Coautor { id, tipoCoautor, parlamentarianUser?, tenantPartnerUser?, comissao? }

  CoautorFormItem {
    localId: string          ← crypto.randomUUID(), só no frontend
    tipo: TipoAutorMateria | ''
    selecionado: AutorSelecionado | null
  }

  Materia (completa com autores[], coautores[], tramitacaoHistorico?)
  CreateMateriaDto (com tipoAutor, ids dos autor e coautores[])

utils/materiaIdentificacao.ts:
  formatarIdentificacao(m)         → "REQ 83/2026"
  formatarIdentificacaoCompleta(m) → "REQ 83/2026 — REQUERIMENTO LEGISLATIVO"

api/paths.ts:
  materias, materiaById, materiaTramitar, materiaTramitacao,
  materiaTextoOriginal, materiaCoautores, materiaCoautorById,
  materiasMinhas, tiposMateria,
  parlamentarianUsers  '/legislative/parlamentares/usuarios/ativos'
  tenantPartners       '/identidade/tenant-partners'
  comissoes            '/legislative/comissoes'

══════════════════════════════════════════════════════════════════
BLOCO 2 — MateriaStatusBadge
══════════════════════════════════════════════════════════════════

<Tag> com severity e icon para 9 status:
  RASCUNHO                 secondary  pi-file-edit
  PROTOCOLADA              info       pi-file-check
  LIDA_NO_PLENARIO         info       pi-book
  EM_ANALISE_NAS_COMISSOES warning    pi-search
  PRONTA_PARA_ORDEM_DO_DIA warning    pi-list-check
  EM_VOTACAO               warning    pi-circle
  APROVADA_PELO_LEGISLATIVO success   pi-check-circle
  VETADA                   danger     pi-times-circle
  SANCIONADA               success    pi-verified

══════════════════════════════════════════════════════════════════
BLOCO 3 — AutorField (componente reutilizável)
══════════════════════════════════════════════════════════════════

components/materias/AutorField.tsx

Props: value, onChange, labelTipo?, labelAutor?, disabled?

Render:
  Linha 1: Dropdown de tipo (PARLAMENTAR | TENANT_PARTNER | COMISSAO)
    label: labelTipo ?? "Tipo de Autor *"
    ao trocar tipo → onChange(null) para limpar seleção

  Linha 2: campo dinâmico conforme tipo selecionado

── ParlamentarDropdown ─────────────────────────────────────────

  GET /legislative/parlamentares/usuarios/ativos (no useEffect ao montar)
  <Dropdown filter filterPlaceholder="Buscar vereador…">
  itemTemplate:
    linha 1: parliamentaryName (600, 0.875rem)
    linha 2: user.nome (0.75rem, secondary)
  onChange → AutorSelecionado { tipo:'PARLAMENTAR', parlamentarianUserId, parlamentarianUserNome }

── TenantPartnerDropdown ───────────────────────────────────────

  GET /identidade/tenant-partners (no useEffect ao montar)
  <Dropdown filter>
  itemTemplate:
    linha 1: partner.nome (600)
    linha 2: partner.usuario?.nome (secondary)
           ou "Sem usuário vinculado" (color red-500) se null
  onChange:
    se partner.usuario === null → showWarning("...") + onChange(null)
    se ok → onChange({ tipo:'TENANT_PARTNER', tenantPartnerUserId, tenantPartnerUserNome, tenantPartnerNome })
  Após seleção válida → mostrar hint:
    <small>Autor: {tenantPartnerUserNome}</small>

── ComissaoDropdown ────────────────────────────────────────────

  GET /legislative/comissoes (no useEffect ao montar)
  <Dropdown filter filterPlaceholder="Buscar comissão…">
  onChange → AutorSelecionado { tipo:'COMISSAO', comissaoId, comissaoNome }

══════════════════════════════════════════════════════════════════
BLOCO 4 — CoautorList (lista dinâmica)
══════════════════════════════════════════════════════════════════

components/materias/CoautorList.tsx

Props: value: CoautorFormItem[], onChange, disabled?

Render:
  Se value.length === 0:
    "Nenhum coautor adicionado."

  Para cada item:
    .coautor-item (border, border-radius, padding 12px)
    header: "Coautor {index+1}" + botão [✕] (remover)
    <AutorField
      value={item.selecionado}
      onChange={(v) => atualizar(item.localId, v)}
      labelTipo="Tipo de Coautor *"
      labelAutor="Coautor *"
    />

  [+ Adicionar coautor] (Button text, pi-plus)
    → adicionar { localId: crypto.randomUUID(), tipo: '', selecionado: null }

CSS:
  .coautor-item { border: 0.5px solid var(--surface-border);
    border-radius: var(--border-radius-md); padding: 12px;
    display: flex; flex-direction: column; gap: 10px; }
  .coautor-item-header { display: flex; align-items: center;
    justify-content: space-between; }

══════════════════════════════════════════════════════════════════
BLOCO 5 — MateriaCreateDialog
══════════════════════════════════════════════════════════════════

4 seções (sigl-dialog-secao):

SEÇÃO 1 — Identificação:
  grid-3: [Tipo de Matéria*] [Número] [Data de Protocolo]
  Tipo → Dropdown GET /dominios/tipos-materia
  Número → InputText, placeholder "Gerado automaticamente"
    tooltip: "Deixe em branco para gerar automaticamente."
  Preview em tempo real abaixo do grid:
    quando tipo e numero preenchidos:
    <small>Identificação: <strong>{sigla} {numero}/{ano}</strong></small>

SEÇÃO 2 — Autor principal:
  <AutorField labelTipo="Tipo de Autor *" labelAutor="Autor *" />

SEÇÃO 3 — Coautores:
  <CoautorList value={coautores} onChange={setCoautores} />

SEÇÃO 4 — Conteúdo:
  Ementa* (Textarea rows=3)
  Justificativa (Textarea rows=4)
  Texto Original (FileUpload drag-and-drop, accept=".pdf,.doc,.docx", max 10MB)

FOOTER:
  [Cancelar]  [Salvar rascunho]  [Protocolar ▶]

Submit (montar body):
  {
    tipoMateriaId, numero?, dataProtocolo?, ementa, justificativa?,
    statusMateria: 'RASCUNHO' | 'PROTOCOLADA',
    tipoAutor: autorPrincipal.tipo,
    parlamentarianUserId? | tenantPartnerUserId? | comissaoId?,
    coautores: coautoresForm
      .filter(c => c.selecionado !== null)
      .map(c => ({
        tipoCoautor: c.selecionado.tipo,
        parlamentarianUserId?, tenantPartnerUserId?, comissaoId?
      }))
  }

Validações que bloqueiam submit:
  tipoMateriaId            → obrigatório
  ementa                   → obrigatório
  autorPrincipal           → tipo selecionado + seleção feita
  coautoresForm[n].selecionado === null quando item existe → bloquear

Toast após save: "{sigla} {numero}/{ano} protocolada" ou "salva como rascunho"

══════════════════════════════════════════════════════════════════
BLOCO 6 — MateriaEditDialog
══════════════════════════════════════════════════════════════════

TabView com 3 abas: [Identificação] [Autoria] [Conteúdo]

Aba Identificação:
  Tipo      → readonly se status !== 'RASCUNHO'
  Número    → readonly se status !== 'RASCUNHO'
  Preview identificação
  Data Protocolo → editável
  Status → Dropdown progressivo:
    gerarOpcoesStatus(statusAtual):
      ordem = ['RASCUNHO','PROTOCOLADA','LIDA_NO_PLENARIO',
               'EM_ANALISE_NAS_COMISSOES','PRONTA_PARA_ORDEM_DO_DIA',
               'EM_VOTACAO','APROVADA_PELO_LEGISLATIVO']
      retornar: [do statusAtual em diante] + VETADA + SANCIONADA (sem duplicatas)
    Status nunca volta atrás.

Aba Autoria:
  <AutorField> com autor atual
    readonly se status !== 'RASCUNHO'
  <CoautorList> editável (pode adicionar/remover coautores sempre)

Aba Conteúdo:
  Ementa, Justificativa, FileUpload

══════════════════════════════════════════════════════════════════
BLOCO 7 — MateriaVerDialog
══════════════════════════════════════════════════════════════════

Header: formatarIdentificacaoCompleta(materia) + MateriaStatusBadge

Linha de metadados: data protocolo

Seção Ementa: texto + [Ver mais] se > 3 linhas (-webkit-line-clamp: 3)

Seção Autor:
  Ícone por tipo: PARLAMENTAR=pi-user | TENANT_PARTNER=pi-building | COMISSAO=pi-users
  Nome resolvido do autor

Seção Coautores (se houver):
  "Coautores ({n})"
  Lista com ícone + nome de cada coautor

Seção Tramitação:
  "Última tramitação: {data} · {status}"
  [Ver histórico ▾] → Accordion com todas as tramitações

Ações: [Ver comprovante] [Baixar texto] [Editar]

══════════════════════════════════════════════════════════════════
ORDEM DE EXECUÇÃO
══════════════════════════════════════════════════════════════════

NÃO execute nada ainda. Confirme e aguarde aprovação.

BLOCO 1: types/materias.ts + utils/materiaIdentificacao.ts + paths
BLOCO 2: MateriaStatusBadge
BLOCO 3: AutorField (ParlamentarDropdown + TenantPartnerDropdown + ComissaoDropdown)
BLOCO 4: CoautorList
BLOCO 5: MateriaCreateDialog
BLOCO 6: MateriaEditDialog
BLOCO 7: MateriaVerDialog

AO FINAL: npm run build → zero erros TypeScript

══════════════════════════════════════════════════════════════════
REGRAS INVIOLÁVEIS
══════════════════════════════════════════════════════════════════

  1. Autor e coautor usam o mesmo AutorField
  2. Tipos PARLAMENTAR, TENANT_PARTNER, COMISSAO — todos Dropdown, sem InputText livre
  3. PARLAMENTAR → lista de ParlamentarianUser ativos (vereadores)
  4. TENANT_PARTNER → o autor é tenantPartnerUser.id, não o partner.id
  5. Parceiro sem usuário → toast de aviso, não permite selecionar
  6. Coautores: lista dinâmica, sem limite, cada um com AutorField próprio
  7. Campo "Relator" removido de todos os formulários
  8. localId dos CoautorFormItem nunca vai ao backend
  9. Status só avança — nunca volta
  10. Perguntar antes de qualquer decisão não coberta aqui
```
