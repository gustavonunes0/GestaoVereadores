# TASK-FE-PARLAMENTARES — Criar e Gerenciar Parlamentar

**Leia antes:**
- `frontend/docs/CLAUDE-FRONTEND.md`
- `frontend/docs/architecture/PATTERNS-FE.md`
- `backend/docs/specs/SPEC-007-parliamentarian-user.md`
- `backend/docs/tasks/TASK-007-parliamentarian-user.md`

**Roles:** `ADMIN_ONLY` para criar/editar parlamentar e gerenciar vínculos

---

## Modelo de dados — fonte de verdade

```
Parliamentarian              ← âncora legislativa, sem dados pessoais
  id
  tenantId
  parliamentarianUsers[]     ← 1:N — um por legislatura/vínculo

ParlamentarianUser           ← vínculo com dados completos
  id
  parliamentarianId
  userId                     ← User já existente no sistema
  status: ACTIVE | INACTIVE

  — Dados do vínculo —
  parliamentaryName          ← nome de urna / nome nas proposições
  officeNumber?              ← número do gabinete
  biography?
  politicalPartyId?

  — Mandato —
  legislaturaId
  condicao: TITULAR | SUPLENTE
  titularAfastadoId?
  dataPosse?

User                         ← pessoa já cadastrada
  id, nome, cpf, foto, senha
```

**Regras:**
- Um `Parliamentarian` pode ter N `ParlamentarianUser` (um por legislatura/vínculo)
- Dados como nome de urna, gabinete e partido pertencem ao `ParlamentarianUser`, não ao `Parliamentarian`
- `Parliamentarian` sozinho não tem nome — o nome vem sempre do `ParlamentarianUser` ativo

---

## Mapa de arquivos

```
frontend/src/
├── api/
│   ├── paths.ts                                        ← ATUALIZAR
│   └── legislative/
│       └── parlamentares.api.ts                        ← ATUALIZAR
├── types/
│   └── parlamentares.ts                                ← CRIAR
└── components/parlamentares/
    ├── ParlamentarCreateDialog.tsx                     ← REFATORAR
    ├── ParlamentarEditDialog.tsx                       ← ATUALIZAR
    ├── ParlamentarVerDialog.tsx                        ← ATUALIZAR
    ├── ParlamentarVincularDialog.tsx                   ← CRIAR (novo vínculo)
    └── UserSearchField.tsx                             ← CRIAR
```

---

## Tipos TypeScript — `types/parlamentares.ts`

```ts
export type ParliamentarianUserStatus = 'ACTIVE' | 'INACTIVE';
export type CondicaoMandato = 'TITULAR' | 'SUPLENTE';

// Âncora legislativa — sem dados pessoais
export interface Parliamentarian {
  id: string;
  tenantId: string;
  parliamentarianUsers: ParlamentarianUser[];  // lista de vínculos
  createdAt: string;
  updatedAt: string;
}

// Vínculo completo — tudo fica aqui
export interface ParlamentarianUser {
  id: string;
  parliamentarianId: string;
  status: ParliamentarianUserStatus;

  // Dados do vínculo
  parliamentaryName: string;
  officeNumber?: string;
  biography?: string;
  politicalParty?: { id: string; nome: string; sigla: string };

  // Mandato
  legislatura: { id: string; descricao: string; anoInicio: number; anoFim: number };
  condicao: CondicaoMandato;
  titularAfastado?: { id: string; parliamentaryName: string };
  dataPosse?: string;

  // User vinculado
  user: {
    id: string;
    nome: string;
    cpf: string;
    foto?: string;
  };

  lastAccessAt?: string;
  createdAt: string;
}

// Para listagem — retorna Parliamentarian com o vínculo ativo da legislatura atual
export interface ParlamentarianResumo {
  id: string;
  // vínculo ativo (ACTIVE) da legislatura vigente, se houver
  activeUser?: ParlamentarianUser;
}

export interface UserResumo {
  id: string;
  nome: string;
  cpf: string;
  foto?: string;
}

// DTOs
export interface CreateParlamentarianDto {
  // Cria Parliamentarian + primeiro ParlamentarianUser em uma operação
  // Dados do User vinculado
  userId: string;

  // Dados do vínculo
  parliamentaryName: string;
  officeNumber?: string;
  politicalPartyId?: string;

  // Mandato
  legislaturaId: string;
  condicao: CondicaoMandato;
  titularAfastadoId?: string;
  dataPosse?: string;
}

export interface CreateParlamentarianUserDto {
  // Adicionar novo vínculo a um Parliamentarian existente
  userId: string;
  parliamentaryName: string;
  officeNumber?: string;
  politicalPartyId?: string;
  legislaturaId: string;
  condicao: CondicaoMandato;
  titularAfastadoId?: string;
  dataPosse?: string;
}

export interface UpdateParlamentarianUserDto {
  parliamentaryName?: string;
  officeNumber?: string;
  politicalPartyId?: string;
  biography?: string;
  status?: ParliamentarianUserStatus;
  dataPosse?: string;
}
```

---

## api/paths.ts — adicionar

```ts
parlamentares:              '/legislative/parlamentares',
parlamentarById:            (id: string) => `/legislative/parlamentares/${id}`,
parlamentarUsers:           (id: string) => `/legislative/parlamentares/${id}/usuarios`,
parlamentarUserById:        (pid: string, uid: string) =>
                              `/legislative/parlamentares/${pid}/usuarios/${uid}`,
parlamentarMe:              '/legislative/parlamentares/me/perfil',
parlamentarMeBiografia:     '/legislative/parlamentares/me/biografia',
materiasMinhas:             '/legislative/materias/minhas',
usuariosBusca:              '/identidade/usuarios',
legislaturas:               '/legislative/legislaturas',
partidos:                   '/legislative/partidos-politicos',
```

---

## FEATURE 1 — `UserSearchField`

Busca `User` já existente no sistema para vincular ao parlamentar.

```tsx
// components/parlamentares/UserSearchField.tsx
// <AutoComplete> do PrimeReact, não Dropdown

interface UserSearchFieldProps {
  value: UserResumo | null;
  onChange: (u: UserResumo | null) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function UserSearchField({ value, onChange, label, hint, disabled }: UserSearchFieldProps) {
  const [sugestoes, setSugestoes] = useState<UserResumo[]>([]);

  const buscar = async (query: string) => {
    if (query.length < 2) { setSugestoes([]); return; }
    const resultado = await api<UserResumo[]>(
      `${API_PATHS.usuariosBusca}?busca=${encodeURIComponent(query)}`
    );
    setSugestoes(resultado);
  };

  return (
    <div className="sigl-filtro-campo">
      <label>{label ?? 'Usuário *'}</label>
      <AutoComplete
        value={value}
        suggestions={sugestoes}
        completeMethod={(e) => buscar(e.query)}
        field="nome"
        itemTemplate={(u: UserResumo) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {u.foto
              ? <img src={u.foto} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} alt="" />
              : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                  {u.nome.charAt(0)}
                </div>
            }
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.nome}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-color-secondary)' }}>
                CPF: {u.cpf}
              </span>
            </div>
          </div>
        )}
        onChange={(e) => onChange(typeof e.value === 'string' ? null : e.value)}
        onSelect={(e) => onChange(e.value)}
        placeholder="Digite o nome ou CPF…"
        minLength={2}
        disabled={disabled}
        forceSelection
        style={{ width: '100%' }}
        emptyMessage="Nenhum usuário encontrado"
      />
      {hint && <small style={{ color: 'var(--text-color-secondary)' }}>{hint}</small>}
    </div>
  );
}
```

---

## FEATURE 2 — `ParlamentarCreateDialog`

Cria `Parliamentarian` + primeiro `ParlamentarianUser` em uma operação.

### T-01 · Layout

```
┌─ Novo Parlamentar ──────────────────────────────────────────────────┐
│                                                                      │
│  ┌─ Usuário ───────────────────────────────────────────────────┐   │
│  │  [🔍 UserSearchField — Digite o nome ou CPF…]               │   │
│  │  Busca entre os usuários já cadastrados no sistema.          │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Identificação parlamentar ─────────────────────────────────┐   │
│  │  Nome Parlamentar *                                           │   │
│  │  [InputText — nome de urna]                                  │   │
│  │                                                               │   │
│  │  grid-2:                                                      │   │
│  │  Partido Político            Nº do Gabinete                  │   │
│  │  [Dropdown ▾]                [InputText]                     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Mandato ───────────────────────────────────────────────────┐   │
│  │  grid-2:                                                      │   │
│  │  Legislatura *               Condição *                      │   │
│  │  [Dropdown ▾ vigente]        (•) Titular  ( ) Suplente      │   │
│  │                                                               │   │
│  │  ↳ [se Suplente] Titular afastado *                          │   │
│  │    [Dropdown ▾ titulares da mesma legislatura]               │   │
│  │                                                               │   │
│  │  Data da Posse (opcional)                                    │   │
│  │  [Calendar]                                                  │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
│                                       [Cancelar]  [Criar Parlamentar]│
└─────────────────────────────────────────────────────────────────────┘
```

### T-02 · Comportamentos

```tsx
// Ao selecionar User → auto-preencher "Nome Parlamentar" com user.nome (editável)

// Legislatura → pré-selecionar a vigente (dataFim >= hoje ou mais recente)

// Condição Suplente → exibir campo "Titular afastado"
//   GET /legislative/parlamentares?legislaturaId=X&condicao=TITULAR&status=ACTIVE
//   Dropdown com parlamentarianUsers ativos da mesma legislatura

// Submit → POST /legislative/parlamentares
// Body: CreateParlamentarianDto
// Após → fechar + rebuscar lista + toast "Parlamentar criado"
```

### T-03 · Validações

```
userId            → obrigatório (UserSearchField)
parliamentaryName → obrigatório, min 3 chars
legislaturaId     → obrigatório
condicao          → obrigatório
titularAfastadoId → obrigatório se condicao === 'SUPLENTE'
```

---

## FEATURE 3 — `ParlamentarVincularDialog`

Adicionar novo `ParlamentarianUser` a um `Parliamentarian` já existente
(ex.: mesmo parlamentar reeleito em nova legislatura).

### T-04 · Layout

```
┌─ Novo vínculo — João da Saúde ──────────────────────────────────┐
│                                                                   │
│  Vínculos existentes:                                            │
│  • 2021–2024 · Titular · Maria Silva (CPF: 123…) · INATIVO      │
│  • 2025–2028 · Titular · João Silva  (CPF: 456…) · ATIVO        │
│                                                                   │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Novo vínculo                                                     │
│                                                                   │
│  [UserSearchField]                                               │
│                                                                   │
│  Nome Parlamentar *     Partido          Gabinete               │
│  [InputText]            [Dropdown]       [InputText]            │
│                                                                   │
│  Legislatura *          Condição *                               │
│  [Dropdown]             (•) Titular  ( ) Suplente               │
│                                                                   │
│  ↳ [se Suplente] Titular afastado *                              │
│                                                                   │
│  Data da Posse                                                   │
│  [Calendar]                                                      │
│                                                                   │
│                            [Cancelar]  [Adicionar vínculo]      │
└─────────────────────────────────────────────────────────────────┘
```

```tsx
// Submit → POST /legislative/parlamentares/:id/usuarios
// Body: CreateParlamentarianUserDto
// Após → rebuscar parlamentar + toast "Vínculo adicionado"
```

---

## FEATURE 4 — `ParlamentarEditDialog`

Edita um `ParlamentarianUser` específico (o vínculo ativo ou selecionado).

### T-05 · Layout

```
┌─ Editar vínculo — João da Saúde ────────────────────────────────┐
│  TabView se houver mais de um vínculo:                           │
│  [2025–2028 ● ATIVO]  [2021–2024 INATIVO]                       │
│                                                                   │
│  ┌─ Identificação ──────────────────────────────────────────┐   │
│  │  Nome Parlamentar *     [InputText]                       │   │
│  │  grid-2:                                                  │   │
│  │  Partido [Dropdown]     Gabinete [InputText]              │   │
│  │  Status  [ACTIVE | INACTIVE]                              │   │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ Mandato ────────────────────────────────────────────────┐   │
│  │  Legislatura [readonly]   Condição [readonly]             │   │
│  │  Titular afastado [readonly se aplicável]                 │   │
│  │  Data da Posse [Calendar editável]                        │   │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ Usuário vinculado ──────────────────────────────────────┐   │
│  │  [foto] nome · CPF             [readonly]                 │   │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│                              [Cancelar]  [Salvar alterações]     │
└─────────────────────────────────────────────────────────────────┘
```

```tsx
// PATCH /legislative/parlamentares/:parliamentarianId/usuarios/:parliamentarianUserId
// Body: UpdateParlamentarianUserDto

// Legislatura e Condição → readonly (mandato não muda após criação)
// User vinculado → sempre readonly (troca de user = novo vínculo)
// Status INACTIVE com confirmDestructive():
//   "Desativar este vínculo remove o acesso do parlamentar ao sistema."
```

---

## FEATURE 5 — `ParlamentarVerDialog`

Exibe o `Parliamentarian` com todos os seus vínculos.

```
┌─ Parlamentar ───────────────────────────────────────────────────┐
│                                                                   │
│  Vínculos (2)                              [+ Novo vínculo]     │
│                                                                   │
│  ┌─ 2025–2028 · ATIVO ────────────────────────────────────┐    │
│  │  [foto] João da Saúde                                   │    │
│  │         PT · Gabinete 12 · Titular                      │    │
│  │         Posse: 01/01/2025                               │    │
│  │         CPF: 123.456.789-00                             │    │
│  │         Último acesso: 15/06/2026                       │    │
│  │                              [✏ Editar]                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ 2021–2024 · INATIVO ──────────────────────────────────┐    │
│  │  João da Saúde · Suplente · CPF: 123…                  │    │
│  │                              [✏ Editar]                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## CSS

```css
.parlamentar-vinculo-card {
  border: 0.5px solid var(--surface-border);
  border-radius: var(--border-radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parlamentar-vinculo-card.ativo {
  border-left: 3px solid var(--green-500);
}

.parlamentar-vinculo-card.inativo {
  opacity: 0.65;
}

.parlamentar-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.parlamentar-user-avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}
```

---

## Checklist

### Tipos e paths
- [ ] `types/parlamentares.ts` com modelo correto — `Parliamentarian` sem campos pessoais
- [ ] `ParlamentarianUser` com todos os campos: nome, gabinete, partido, mandato, user
- [ ] Sem nenhuma referência a `PessoaFisica`
- [ ] Paths incluindo `/usuarios` e `/usuarios/:id`

### UserSearchField
- [ ] `AutoComplete` com busca em `/identidade/usuarios?busca=`
- [ ] Template mostra foto (ou inicial), nome e CPF
- [ ] `forceSelection: true`
- [ ] Min 2 chars

### Criar parlamentar
- [ ] `ParlamentarCreateDialog` cria `Parliamentarian` + primeiro `ParlamentarianUser`
- [ ] `UserSearchField` como primeiro campo
- [ ] Auto-preencher `parliamentaryName` com `user.nome` ao selecionar
- [ ] Legislatura vigente pré-selecionada
- [ ] Campo titular afastado só aparece se Suplente
- [ ] Validações corretas

### Vincular
- [ ] `ParlamentarVincularDialog` lista vínculos existentes antes do form
- [ ] Submit → POST `/parlamentares/:id/usuarios`

### Editar vínculo
- [ ] `ParlamentarEditDialog` abre vínculo específico
- [ ] TabView se mais de um vínculo
- [ ] Legislatura e Condição readonly
- [ ] User vinculado readonly
- [ ] Desativar com `confirmDestructive()`

### Visualizar
- [ ] `ParlamentarVerDialog` lista todos os vínculos em cards
- [ ] Card ativo com borda verde esquerda
- [ ] Card inativo com opacidade reduzida
- [ ] Botão "+ Novo vínculo" abre `ParlamentarVincularDialog`

### Verificações finais
- [ ] `npm run build` → zero erros TypeScript
- [ ] Nenhuma referência a `tenantUserId` em `Parliamentarian`
- [ ] Nenhuma referência a `TenantUserRole.PARLIAMENTARIAN`
- [ ] `Parliamentarian` não tem campos pessoais — só `id` e `tenantId`
