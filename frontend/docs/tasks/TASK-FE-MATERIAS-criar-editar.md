# TASK-FE-MATERIAS — MateriasPage: Criar, Editar e Visualizar Matérias

**Leia antes:**
- `frontend/docs/CLAUDE-FRONTEND.md`
- `frontend/docs/architecture/PATTERNS-FE.md`
- `backend/docs/specs/SPEC-001-materias.md` (se existir)

**Roles:** `STAFF_AND_ABOVE` para visualizar · `ADMIN_ONLY` para criar/editar

---

## Modelo de dados relevante

```
Materia
  id, tenantId, numero, ano, ementa, justificativa
  tipoMateriaId
  statusMateria
  dataProtocolo?
  textoOriginalUrl?

Autor (1:N em Materia)
  tipoAutor: PARLAMENTAR | TENANT_PARTNER | COMISSAO
  parlamentarianUserId?   ← se PARLAMENTAR
  tenantPartnerUserId?    ← se TENANT_PARTNER (usuário vinculado ao parceiro)
  comissaoId?             ← se COMISSAO

MatterCoauthor (0:N em Materia)
  tipoCoautor: PARLAMENTAR | TENANT_PARTNER | COMISSAO
  parlamentarianUserId?
  tenantPartnerUserId?
  comissaoId?
```

**Regras de autoria:**
- Autor e coautor usam os mesmos tipos e o mesmo campo dinâmico
- `PARLAMENTAR` → Dropdown com `ParlamentarianUser` ativos (vereadores)
- `TENANT_PARTNER` → Dropdown de parceiros → auto-preenche `TenantPartnerUser` vinculado
- `COMISSAO` → Dropdown de comissões cadastradas
- Coautores: lista dinâmica, sem limite de quantidade
- Campo "Relator" **removido** de todos os formulários

---

## Mapa de arquivos

```
frontend/src/
├── api/
│   ├── paths.ts                                     ← ATUALIZAR
│   └── legislative/materias.api.ts                  ← ATUALIZAR
├── types/
│   └── materias.ts                                  ← CRIAR
├── utils/
│   └── materiaIdentificacao.ts                      ← CRIAR
└── components/materias/
    ├── MateriaCreateDialog.tsx                      ← CRIAR
    ├── MateriaEditDialog.tsx                        ← CRIAR
    ├── MateriaVerDialog.tsx                         ← CRIAR
    ├── MateriaStatusBadge.tsx                       ← CRIAR
    ├── AutorField.tsx                               ← CRIAR (campo dinâmico reutilizável)
    └── CoautorList.tsx                              ← CRIAR (lista dinâmica de coautores)
```

---

## Tipos TypeScript — `types/materias.ts`

```ts
export type StatusMateria =
  | 'RASCUNHO'
  | 'PROTOCOLADA'
  | 'LIDA_NO_PLENARIO'
  | 'EM_ANALISE_NAS_COMISSOES'
  | 'PRONTA_PARA_ORDEM_DO_DIA'
  | 'EM_VOTACAO'
  | 'APROVADA_PELO_LEGISLATIVO'
  | 'VETADA'
  | 'SANCIONADA';

export type TipoAutorMateria = 'PARLAMENTAR' | 'TENANT_PARTNER' | 'COMISSAO';

export interface TipoMateria {
  id: string;
  nome: string;
  sigla: string;
}

// Opção resolvida de autor/coautor — o que foi selecionado no dropdown
export interface AutorSelecionado {
  tipo: TipoAutorMateria;
  // PARLAMENTAR
  parlamentarianUserId?: string;
  parlamentarianUserNome?: string;  // parlamentaryName
  // TENANT_PARTNER
  tenantPartnerUserId?: string;
  tenantPartnerUserNome?: string;   // user.nome do TenantPartnerUser
  tenantPartnerNome?: string;       // nome da instituição
  // COMISSAO
  comissaoId?: string;
  comissaoNome?: string;
}

export interface Autor {
  id: string;
  tipoAutor: TipoAutorMateria;
  parlamentarianUser?: {
    id: string;
    parliamentaryName: string;
    user: { nome: string; cpf: string };
  };
  tenantPartnerUser?: {
    id: string;
    user: { nome: string };
    tenantPartner: { id: string; nome: string };
  };
  comissao?: { id: string; nome: string };
}

export interface Coautor {
  id: string;
  tipoCoautor: TipoAutorMateria;
  parlamentarianUser?: Autor['parlamentarianUser'];
  tenantPartnerUser?: Autor['tenantPartnerUser'];
  comissao?: Autor['comissao'];
}

export interface Materia {
  id: string;
  tenantId: string;
  numero: string;
  ano: number;
  tipoMateria: TipoMateria;
  ementa: string;
  justificativa?: string;
  dataProtocolo?: string;
  statusMateria: StatusMateria;
  autores: Autor[];
  coautores: Coautor[];
  textoOriginalUrl?: string;
  tramitacaoHistorico?: TramitacaoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TramitacaoItem {
  id: string;
  status: StatusMateria;
  observacao?: string;
  criadoEm: string;
}

// DTO de criação
export interface CreateMateriaDto {
  tipoMateriaId: string;
  numero?: string;
  dataProtocolo?: string;
  ementa: string;
  justificativa?: string;
  statusMateria?: StatusMateria;
  // Autor principal
  tipoAutor: TipoAutorMateria;
  parlamentarianUserId?: string;
  tenantPartnerUserId?: string;
  comissaoId?: string;
  // Coautores
  coautores?: CreateCoautorDto[];
}

export interface CreateCoautorDto {
  tipoCoautor: TipoAutorMateria;
  parlamentarianUserId?: string;
  tenantPartnerUserId?: string;
  comissaoId?: string;
}

// Item local do formulário de coautor (antes de submeter)
export interface CoautorFormItem {
  localId: string;           // id temporário só no frontend (crypto.randomUUID())
  tipo: TipoAutorMateria | '';
  selecionado: AutorSelecionado | null;
}
```

---

## api/paths.ts — adicionar

```ts
materias:              '/legislative/materias',
materiaById:           (id: string) => `/legislative/materias/${id}`,
materiaTramitar:       (id: string) => `/legislative/materias/${id}/tramitar`,
materiaTramitacao:     (id: string) => `/legislative/materias/${id}/tramitacao`,
materiaTextoOriginal:  (id: string) => `/legislative/materias/${id}/texto-original`,
materiaCoautores:      (id: string) => `/legislative/materias/${id}/coautores`,
materiaCoautorById:    (mid: string, cid: string) =>
                         `/legislative/materias/${mid}/coautores/${cid}`,
materiasMinhas:        '/legislative/materias/minhas',
tiposMateria:          '/dominios/tipos-materia',
// Para os dropdowns de autor/coautor
parlamentarianUsers:   '/legislative/parlamentares/usuarios/ativos',
tenantPartners:        '/identidade/tenant-partners',
comissoes:             '/legislative/comissoes',
```

---

## FEATURE 1 — `MateriaStatusBadge`

```tsx
const CFG: Record<StatusMateria, { label: string; severity: string; icon: string }> = {
  RASCUNHO:                  { label: 'Rascunho',                 severity: 'secondary', icon: 'pi pi-file-edit'    },
  PROTOCOLADA:               { label: 'Protocolada',              severity: 'info',      icon: 'pi pi-file-check'   },
  LIDA_NO_PLENARIO:          { label: 'Lida no plenário',         severity: 'info',      icon: 'pi pi-book'         },
  EM_ANALISE_NAS_COMISSOES:  { label: 'Em análise nas comissões', severity: 'warning',   icon: 'pi pi-search'       },
  PRONTA_PARA_ORDEM_DO_DIA:  { label: 'Pronta para ordem do dia', severity: 'warning',   icon: 'pi pi-list-check'   },
  EM_VOTACAO:                { label: 'Em votação',               severity: 'warning',   icon: 'pi pi-circle'       },
  APROVADA_PELO_LEGISLATIVO: { label: 'Aprovada',                 severity: 'success',   icon: 'pi pi-check-circle' },
  VETADA:                    { label: 'Vetada',                   severity: 'danger',    icon: 'pi pi-times-circle' },
  SANCIONADA:                { label: 'Sancionada',               severity: 'success',   icon: 'pi pi-verified'     },
};
```

---

## FEATURE 2 — `AutorField` (componente reutilizável)

Campo dinâmico de autor/coautor. Usado tanto para o autor principal
quanto para cada item da lista de coautores.

### T-01 · Props e estrutura

```tsx
interface AutorFieldProps {
  value: AutorSelecionado | null;
  onChange: (v: AutorSelecionado | null) => void;
  labelTipo?: string;        // "Tipo de Autor" ou "Tipo de Coautor"
  labelAutor?: string;       // "Autor" ou "Coautor"
  disabled?: boolean;
}

export function AutorField({ value, onChange, labelTipo, labelAutor, disabled }: AutorFieldProps) {
  const [tipo, setTipo] = useState<TipoAutorMateria | ''>(value?.tipo ?? '');

  // Limpar seleção ao trocar tipo
  const handleTipoChange = (novoTipo: TipoAutorMateria) => {
    setTipo(novoTipo);
    onChange(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Linha 1: Tipo */}
      <div className="sigl-filtro-campo">
        <label>{labelTipo ?? 'Tipo de Autor *'}</label>
        <Dropdown
          value={tipo}
          options={TIPOS_AUTOR_OPTIONS}
          onChange={(e) => handleTipoChange(e.value)}
          placeholder="Selecionar tipo…"
          disabled={disabled}
          style={{ width: '100%' }}
        />
      </div>

      {/* Linha 2: campo dinâmico conforme tipo */}
      {tipo === 'PARLAMENTAR'    && <ParlamentarDropdown    value={value} onChange={onChange} label={labelAutor} disabled={disabled} />}
      {tipo === 'TENANT_PARTNER' && <TenantPartnerDropdown  value={value} onChange={onChange} label={labelAutor} disabled={disabled} />}
      {tipo === 'COMISSAO'       && <ComissaoDropdown       value={value} onChange={onChange} label={labelAutor} disabled={disabled} />}
    </div>
  );
}

const TIPOS_AUTOR_OPTIONS = [
  { value: 'PARLAMENTAR',    label: 'Parlamentar'         },
  { value: 'TENANT_PARTNER', label: 'Instituição parceira'},
  { value: 'COMISSAO',       label: 'Comissão'            },
];
```

### T-02 · `ParlamentarDropdown`

```tsx
// Busca: GET /legislative/parlamentares/usuarios/ativos
// Retorna lista de ParlamentarianUser ativos com parlamentaryName + user.nome + user.cpf

function ParlamentarDropdown({ value, onChange, label, disabled }) {
  const [opcoes, setOpcoes] = useState<ParlamentarianUserOpcao[]>([]);

  useEffect(() => {
    api<ParlamentarianUserOpcao[]>(API_PATHS.parlamentarianUsers)
      .then(setOpcoes);
  }, []);

  const handleSelect = (parlUserId: string) => {
    const parl = opcoes.find(o => o.id === parlUserId);
    if (!parl) return;
    onChange({
      tipo: 'PARLAMENTAR',
      parlamentarianUserId: parl.id,
      parlamentarianUserNome: parl.parliamentaryName,
    });
  };

  return (
    <div className="sigl-filtro-campo">
      <label>{label ?? 'Parlamentar *'}</label>
      <Dropdown
        value={value?.parlamentarianUserId ?? null}
        options={opcoes.map(o => ({
          value: o.id,
          label: o.parliamentaryName,
        }))}
        onChange={(e) => handleSelect(e.value)}
        filter
        filterPlaceholder="Buscar vereador…"
        placeholder="Selecionar vereador…"
        disabled={disabled}
        style={{ width: '100%' }}
        emptyMessage="Nenhum vereador encontrado"
        itemTemplate={(opt) => {
          const parl = opcoes.find(o => o.id === opt.value);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {parl?.parliamentaryName}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                {parl?.user?.nome}
              </span>
            </div>
          );
        }}
      />
    </div>
  );
}
```

### T-03 · `TenantPartnerDropdown`

```tsx
// Busca: GET /identidade/tenant-partners (com usuario incluído)
// Ao selecionar → verificar se tem usuario vinculado
// Se não tiver → toast de aviso, limpar seleção

function TenantPartnerDropdown({ value, onChange, label, disabled }) {
  const [parceiros, setParceiros] = useState<TenantPartner[]>([]);

  useEffect(() => {
    api<TenantPartner[]>(API_PATHS.tenantPartners).then(setParceiros);
  }, []);

  const handleSelect = (partnerId: string) => {
    const partner = parceiros.find(p => p.id === partnerId);
    if (!partner) return;

    if (!partner.usuario) {
      showWarning('Esta instituição não possui usuário vinculado. Vincule em Câmara > Autores.');
      onChange(null);
      return;
    }

    onChange({
      tipo: 'TENANT_PARTNER',
      tenantPartnerUserId: partner.usuario.id,
      tenantPartnerUserNome: partner.usuario.nome,
      tenantPartnerNome: partner.nome,
    });
  };

  return (
    <div className="sigl-filtro-campo">
      <label>{label ?? 'Instituição parceira *'}</label>
      <Dropdown
        value={value?.tenantPartnerUserId
          ? parceiros.find(p => p.usuario?.id === value.tenantPartnerUserId)?.id
          : null}
        options={parceiros.map(p => ({ value: p.id, label: p.nome }))}
        onChange={(e) => handleSelect(e.value)}
        filter
        filterPlaceholder="Buscar instituição…"
        placeholder="Selecionar instituição…"
        disabled={disabled}
        style={{ width: '100%' }}
        itemTemplate={(opt) => {
          const p = parceiros.find(x => x.id === opt.value);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p?.nome}</span>
              {p?.usuario
                ? <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                    {p.usuario.nome}
                  </span>
                : <span style={{ fontSize: '0.75rem', color: 'var(--red-500)' }}>
                    Sem usuário vinculado
                  </span>
              }
            </div>
          );
        }}
      />
      {value?.tenantPartnerUserNome && (
        <small style={{ color: 'var(--text-color-secondary)' }}>
          Autor: {value.tenantPartnerUserNome}
        </small>
      )}
    </div>
  );
}
```

### T-04 · `ComissaoDropdown`

```tsx
// Busca: GET /legislative/comissoes

function ComissaoDropdown({ value, onChange, label, disabled }) {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);

  useEffect(() => {
    api<Comissao[]>(API_PATHS.comissoes).then(setComissoes);
  }, []);

  return (
    <div className="sigl-filtro-campo">
      <label>{label ?? 'Comissão *'}</label>
      <Dropdown
        value={value?.comissaoId ?? null}
        options={comissoes.map(c => ({ value: c.id, label: c.nome }))}
        onChange={(e) => {
          const c = comissoes.find(x => x.id === e.value);
          if (!c) return;
          onChange({ tipo: 'COMISSAO', comissaoId: c.id, comissaoNome: c.nome });
        }}
        filter
        filterPlaceholder="Buscar comissão…"
        placeholder="Selecionar comissão…"
        disabled={disabled}
        style={{ width: '100%' }}
      />
    </div>
  );
}
```

---

## FEATURE 3 — `CoautorList` (lista dinâmica)

### T-05 · Estrutura

```tsx
// components/materias/CoautorList.tsx

interface CoautorListProps {
  value: CoautorFormItem[];
  onChange: (items: CoautorFormItem[]) => void;
  disabled?: boolean;
}

export function CoautorList({ value, onChange, disabled }: CoautorListProps) {
  const adicionar = () => {
    onChange([
      ...value,
      { localId: crypto.randomUUID(), tipo: '', selecionado: null },
    ]);
  };

  const remover = (localId: string) => {
    onChange(value.filter(i => i.localId !== localId));
  };

  const atualizar = (localId: string, selecionado: AutorSelecionado | null) => {
    onChange(value.map(i =>
      i.localId === localId
        ? { ...i, tipo: selecionado?.tipo ?? i.tipo, selecionado }
        : i
    ));
  };

  const atualizarTipo = (localId: string, tipo: TipoAutorMateria) => {
    onChange(value.map(i =>
      i.localId === localId ? { ...i, tipo, selecionado: null } : i
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {value.length === 0 && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-color-secondary)' }}>
          Nenhum coautor adicionado.
        </p>
      )}

      {value.map((item, index) => (
        <div key={item.localId} className="coautor-item">
          <div className="coautor-item-header">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-color-secondary)' }}>
              Coautor {index + 1}
            </span>
            {!disabled && (
              <Button
                icon="pi pi-times"
                text rounded size="small" severity="danger"
                onClick={() => remover(item.localId)}
                aria-label="Remover coautor"
              />
            )}
          </div>

          <AutorField
            value={item.selecionado}
            onChange={(v) => atualizar(item.localId, v)}
            labelTipo="Tipo de Coautor *"
            labelAutor="Coautor *"
            disabled={disabled}
          />
        </div>
      ))}

      {!disabled && (
        <Button
          label="Adicionar coautor"
          icon="pi pi-plus"
          size="small"
          text
          onClick={adicionar}
          style={{ alignSelf: 'flex-start' }}
        />
      )}
    </div>
  );
}
```

CSS:

```css
.coautor-item {
  border: 0.5px solid var(--surface-border);
  border-radius: var(--border-radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coautor-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

---

## FEATURE 4 — `MateriaCreateDialog`

### T-06 · Layout

```
┌─ Nova Matéria Legislativa ──────────────────────────────────────────┐
│  ┌─ Identificação ─────────────────────────────────────────────┐   │
│  │  grid-3:                                                      │   │
│  │  Tipo de Matéria *    Número              Data de Protocolo  │   │
│  │  [Dropdown ▾]         [InputText]         [Calendar]        │   │
│  │                                                               │   │
│  │  Preview: PLO 102/2026                                        │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌─ Autor principal ────────────────────────────────────────────┐   │
│  │  <AutorField labelTipo="Tipo de Autor *" labelAutor="Autor *">│   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌─ Coautores ──────────────────────────────────────────────────┐   │
│  │  <CoautorList />                                              │   │
│  │  [+ Adicionar coautor]                                        │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌─ Conteúdo ───────────────────────────────────────────────────┐   │
│  │  Ementa *  [Textarea rows=3]                                  │   │
│  │  Justificativa  [Textarea rows=4]                             │   │
│  │  Texto Original  [FileUpload drag-and-drop]                   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│           [Cancelar]  [Salvar rascunho]  [Protocolar ▶]             │
└─────────────────────────────────────────────────────────────────────┘
```

### T-07 · Preview de identificação em tempo real

```tsx
// Exibir abaixo do campo Número quando tipoMateria e numero estão preenchidos
<small style={{ color: 'var(--text-color-secondary)' }}>
  Identificação: <strong>{sigla} {numero}/{anoAtual}</strong>
</small>
```

### T-08 · Submit

```tsx
// Montar body a partir do estado do formulário
const body: CreateMateriaDto = {
  tipoMateriaId,
  numero: numero || undefined,
  dataProtocolo: dataProtocolo || undefined,
  ementa,
  justificativa: justificativa || undefined,
  statusMateria,   // 'RASCUNHO' ou 'PROTOCOLADA'
  // Autor principal
  tipoAutor: autorPrincipal!.tipo,
  parlamentarianUserId: autorPrincipal?.parlamentarianUserId,
  tenantPartnerUserId:  autorPrincipal?.tenantPartnerUserId,
  comissaoId:           autorPrincipal?.comissaoId,
  // Coautores
  coautores: coautoresForm
    .filter(c => c.selecionado !== null)
    .map(c => ({
      tipoCoautor: c.selecionado!.tipo,
      parlamentarianUserId: c.selecionado?.parlamentarianUserId,
      tenantPartnerUserId:  c.selecionado?.tenantPartnerUserId,
      comissaoId:           c.selecionado?.comissaoId,
    })),
};

// POST /legislative/materias
// Após → fechar + rebuscar + toast "PLO 102/2026 protocolada"
```

### T-09 · Validações

```
tipoMateriaId          → obrigatório
ementa                 → obrigatório
autorPrincipal         → obrigatório (tipo + seleção)
coautores[n].selecionado → obrigatório se o item existe (não deixar incompleto)
```

---

## FEATURE 5 — `MateriaEditDialog`

### T-10 · TabView com 3 abas

```
[Identificação]  [Autoria]  [Conteúdo]
```

**Aba Identificação:**
- Tipo (readonly se `status !== 'RASCUNHO'`)
- Número (readonly se `status !== 'RASCUNHO'`)
- Preview identificação
- Data Protocolo
- Status (Dropdown progressivo — só avança)

**Aba Autoria:**
- `AutorField` com autor atual (readonly se já protocolada)
- `CoautorList` (editável — pode adicionar/remover)

**Aba Conteúdo:**
- Ementa, Justificativa, FileUpload

### T-11 · Status progressivo

```ts
const ORDEM_STATUS: StatusMateria[] = [
  'RASCUNHO', 'PROTOCOLADA', 'LIDA_NO_PLENARIO',
  'EM_ANALISE_NAS_COMISSOES', 'PRONTA_PARA_ORDEM_DO_DIA',
  'EM_VOTACAO', 'APROVADA_PELO_LEGISLATIVO',
];

const gerarOpcoesStatus = (atual: StatusMateria): StatusMateria[] => {
  const idx = ORDEM_STATUS.indexOf(atual);
  const progressivos = idx >= 0 ? ORDEM_STATUS.slice(idx) : [atual];
  return [...new Set([...progressivos, 'VETADA', 'SANCIONADA'])] as StatusMateria[];
};
// Status nunca volta atrás
```

---

## FEATURE 6 — `MateriaVerDialog`

```
┌─ REQ 83/2026 — REQUERIMENTO LEGISLATIVO ───────────────────────────┐
│  [PROTOCOLADA ✓]                                                     │
│  15/06/2026 · Data de protocolo                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Ementa                                                              │
│  Requer que seja encaminhado Ofício…   [Ver mais]                   │
├─────────────────────────────────────────────────────────────────────┤
│  Autor                                                               │
│  👤 WILL MACIEL · Parlamentar                                        │
│                                                                      │
│  Coautores (2)                                                       │
│  👤 Carlos Mendes · Parlamentar                                      │
│  🏢 João Silva (Câmara de Fortaleza) · Inst. Parceira               │
├─────────────────────────────────────────────────────────────────────┤
│  Última tramitação                                                   │
│  15/06/2026 · PROTOCOLADO                                           │
│  [Ver histórico ▾]                                                  │
├─────────────────────────────────────────────────────────────────────┤
│  [📄 Ver comprovante]  [⬇ Baixar texto]  [✏ Editar]                │
└─────────────────────────────────────────────────────────────────────┘
```

**Ícone por tipo de autor/coautor:**
- `PARLAMENTAR` → `pi pi-user`
- `TENANT_PARTNER` → `pi pi-building`
- `COMISSAO` → `pi pi-users`

---

## `utils/materiaIdentificacao.ts`

```ts
export const formatarIdentificacao = (m: Materia): string =>
  `${m.tipoMateria.sigla} ${m.numero}/${m.ano}`;

export const formatarIdentificacaoCompleta = (m: Materia): string =>
  `${formatarIdentificacao(m)} — ${m.tipoMateria.nome.toUpperCase()}`;
```

---

## Checklist

### Tipos e paths
- [ ] `types/materias.ts` com `CoautorFormItem` e `AutorSelecionado`
- [ ] `utils/materiaIdentificacao.ts`
- [ ] Paths em `api/paths.ts` incluindo `parlamentarianUsers`, `tenantPartners`, `comissoes`

### AutorField (reutilizável)
- [ ] `AutorField` com Dropdown de tipo + campo dinâmico
- [ ] Trocar tipo limpa a seleção anterior
- [ ] `ParlamentarDropdown` com `filter=true`, mostra `parliamentaryName` + `user.nome`
- [ ] `TenantPartnerDropdown` → aviso se parceiro sem usuário
- [ ] Itens sem usuário vinculado visíveis com indicador vermelho "Sem usuário vinculado"
- [ ] `ComissaoDropdown` com `filter=true`

### CoautorList
- [ ] Lista dinâmica sem limite de itens
- [ ] Cada item tem seu próprio `AutorField` completo (tipo + campo)
- [ ] `localId` com `crypto.randomUUID()` para key do React
- [ ] [+ Adicionar coautor] adiciona item novo vazio
- [ ] [✕] remove o item correspondente
- [ ] Estado vazio com mensagem "Nenhum coautor adicionado."

### Criar matéria
- [ ] `MateriaCreateDialog` com 4 seções
- [ ] Preview de identificação em tempo real
- [ ] `AutorField` para autor principal
- [ ] `CoautorList` para coautores (0 ou mais)
- [ ] Dois botões: Salvar rascunho + Protocolar
- [ ] Body do POST monta coautores corretamente
- [ ] Validação: coautor incompleto (tipo sem seleção) bloqueia submit

### Editar matéria
- [ ] `MateriaEditDialog` com TabView (3 abas)
- [ ] Status progressivo — nunca volta atrás
- [ ] `CoautorList` editável na aba Autoria
- [ ] Campo "Relator" ausente em todos os formulários

### Visualizar
- [ ] `MateriaVerDialog` com identificação completa no header
- [ ] Lista de coautores com ícone por tipo
- [ ] Histórico de tramitação colapsável

### Verificações finais
- [ ] `npm run build` → zero erros TypeScript
- [ ] Sem nenhuma referência a campo "Relator"
- [ ] `CoautorFormItem.localId` nunca enviado ao backend
- [ ] Identificação exibida como "PLO 102/2026" em todas as telas
