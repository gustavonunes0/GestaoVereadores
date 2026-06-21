# PROMPT — FE: Criar e Gerenciar Parlamentar

> Cole este prompt no Claude Code após `cd frontend && claude`.

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-PARLAMENTARES-criar.md
4. backend/docs/specs/SPEC-007-parliamentarian-user.md
5. backend/docs/tasks/TASK-007-parliamentarian-user.md

Confirme o escopo antes de escrever qualquer linha de código.

══════════════════════════════════════════════════════════════════
MODELO — LER E INTERNALIZAR ANTES DE QUALQUER COMPONENTE
══════════════════════════════════════════════════════════════════

Parliamentarian              ← âncora legislativa. Só tem id e tenantId.
  parliamentarianUsers[]     ← 1:N — um por legislatura/vínculo

ParlamentarianUser           ← TUDO fica aqui
  userId                     ← User já existente
  parliamentaryName          ← nome de urna
  officeNumber?              ← gabinete
  biography?
  politicalPartyId?
  status: ACTIVE | INACTIVE
  legislaturaId
  condicao: TITULAR | SUPLENTE
  titularAfastadoId?
  dataPosse?
  user: { id, nome, cpf, foto }

User                         ← pessoa já cadastrada no sistema
  id, nome, cpf, foto, senha

Não existe PessoaFisica.
Não existe tenantUserId em Parliamentarian.
Não existe TenantUserRole.PARLIAMENTARIAN.
Parliamentarian não tem nome, partido, gabinete — isso fica no ParlamentarianUser.

══════════════════════════════════════════════════════════════════
BLOCO 1 — TIPOS E PATHS
══════════════════════════════════════════════════════════════════

types/parlamentares.ts:

  ParliamentarianUserStatus = 'ACTIVE' | 'INACTIVE'
  CondicaoMandato = 'TITULAR' | 'SUPLENTE'

  Parliamentarian {
    id: string
    tenantId: string
    parliamentarianUsers: ParlamentarianUser[]
  }

  ParlamentarianUser {
    id: string
    parliamentarianId: string
    status: ParliamentarianUserStatus
    parliamentaryName: string
    officeNumber?: string
    biography?: string
    politicalParty?: { id, nome, sigla }
    legislatura: { id, descricao, anoInicio, anoFim }
    condicao: CondicaoMandato
    titularAfastado?: { id: string; parliamentaryName: string }
    dataPosse?: string
    user: { id: string; nome: string; cpf: string; foto?: string }
    lastAccessAt?: string
    createdAt: string
  }

  UserResumo { id, nome, cpf, foto? }

  CreateParlamentarianDto {
    userId: string
    parliamentaryName: string
    officeNumber?: string
    politicalPartyId?: string
    legislaturaId: string
    condicao: CondicaoMandato
    titularAfastadoId?: string
    dataPosse?: string
  }

  CreateParlamentarianUserDto {
    userId: string
    parliamentaryName: string
    officeNumber?: string
    politicalPartyId?: string
    legislaturaId: string
    condicao: CondicaoMandato
    titularAfastadoId?: string
    dataPosse?: string
  }

  UpdateParlamentarianUserDto {
    parliamentaryName?: string
    officeNumber?: string
    politicalPartyId?: string
    biography?: string
    status?: ParliamentarianUserStatus
    dataPosse?: string
  }

api/paths.ts:
  parlamentares:           '/legislative/parlamentares'
  parlamentarById:         (id) => `/legislative/parlamentares/${id}`
  parlamentarUsers:        (id) => `/legislative/parlamentares/${id}/usuarios`
  parlamentarUserById:     (pid, uid) =>
                             `/legislative/parlamentares/${pid}/usuarios/${uid}`
  parlamentarMe:           '/legislative/parlamentares/me/perfil'
  parlamentarMeBiografia:  '/legislative/parlamentares/me/biografia'
  usuariosBusca:           '/identidade/usuarios'
  legislaturas:            '/legislative/legislaturas'
  partidos:                '/legislative/partidos-politicos'

══════════════════════════════════════════════════════════════════
BLOCO 2 — UserSearchField
══════════════════════════════════════════════════════════════════

components/parlamentares/UserSearchField.tsx
Usa <AutoComplete> do PrimeReact. Nunca Dropdown.

  busca min 2 chars: GET /identidade/usuarios?busca={query}
  forceSelection: true
  emptyMessage: "Nenhum usuário encontrado"

  itemTemplate:
    avatar (foto ou inicial do nome, círculo 28px)
    linha 1: u.nome (600, 0.875rem)
    linha 2: "CPF: {u.cpf}" (0.75rem, secondary)

  Props: value, onChange, label?, hint?, disabled?

══════════════════════════════════════════════════════════════════
BLOCO 3 — ParlamentarCreateDialog
══════════════════════════════════════════════════════════════════

Cria Parliamentarian + primeiro ParlamentarianUser em uma operação.

3 seções (sigl-dialog-secao):

SEÇÃO 1 — Usuário:
  UserSearchField (full-width)
    hint: "Busca entre os usuários já cadastrados no sistema."
  Ao selecionar user → auto-preencher parliamentaryName com user.nome (editável)

SEÇÃO 2 — Identificação parlamentar:
  Nome Parlamentar* (InputText, full-width)
    hint: "Nome de urna. Usado nas proposições e documentos oficiais."
  grid-2:
    Partido Político [Dropdown GET /partidos, opcional, opção "Sem partido"]
    Nº do Gabinete   [InputText — aceita "31", "31A", "Térreo"]

SEÇÃO 3 — Mandato:
  grid-2:
    Legislatura* [Dropdown GET /legislaturas, pré-selecionar vigente]
    Condição*    [RadioButton: (•) Titular  ( ) Suplente]

  Condicional — só se Suplente:
    Titular afastado*
    GET /parlamentares?legislaturaId=X&condicao=TITULAR&status=ACTIVE
    Dropdown com parliamentaryName dos vínculos ativos dessa legislatura
    Obrigatório se condicao === 'SUPLENTE'

  Data da Posse [Calendar, opcional]
    hint: "Opcional — para relatórios oficiais."

FOOTER: [Cancelar]  [Criar Parlamentar]

Submit: POST /legislative/parlamentares
Body: CreateParlamentarianDto
Após → fechar + rebuscar + toast "Parlamentar criado"

Validações:
  userId            → obrigatório
  parliamentaryName → obrigatório, min 3 chars
  legislaturaId     → obrigatório
  condicao          → obrigatório
  titularAfastadoId → obrigatório se condicao === 'SUPLENTE'

══════════════════════════════════════════════════════════════════
BLOCO 4 — ParlamentarVincularDialog
══════════════════════════════════════════════════════════════════

Adiciona novo ParlamentarianUser a Parliamentarian existente.
Caso de uso: mesmo parlamentar reeleito em nova legislatura.

Header: "Novo vínculo — {parliamentaryName do vínculo ativo}"

Seção informativa:
  Lista dos vínculos existentes em cards compactos:
    "{legislatura.descricao} · {condicao} · {user.nome} · badge status"

Separador.

Formulário igual ao BLOCO 3 seções 1-3 (mesmos campos, mesma lógica).

Submit: POST /legislative/parlamentares/:id/usuarios
Body: CreateParlamentarianUserDto
Após → rebuscar parlamentar + toast "Vínculo adicionado"

══════════════════════════════════════════════════════════════════
BLOCO 5 — ParlamentarEditDialog
══════════════════════════════════════════════════════════════════

Edita um ParlamentarianUser específico.

Se o Parliamentarian tiver > 1 vínculo:
  TabView com abas por legislatura: [2025–2028 ● ATIVO]  [2021–2024]
  Editar abre a aba do vínculo selecionado

Campos EDITÁVEIS (UpdateParlamentarianUserDto):
  Nome Parlamentar
  Partido Político
  Nº do Gabinete
  Status (ACTIVE | INACTIVE)
    → INACTIVE: confirmDestructive()
    → hint: "Desativar remove o acesso do parlamentar ao sistema."
  Data da Posse

Campos READONLY:
  Legislatura (mandato não muda)
  Condição (mandato não muda)
  Titular afastado (se suplente)
  Usuário vinculado — exibir avatar + nome + CPF
    (trocar user = novo vínculo, não edição)

Submit: PATCH /legislative/parlamentares/:pid/usuarios/:uid
Body: UpdateParlamentarianUserDto
Após → rebuscar + toast "Vínculo atualizado"

══════════════════════════════════════════════════════════════════
BLOCO 6 — ParlamentarVerDialog
══════════════════════════════════════════════════════════════════

Lista o Parliamentarian com todos os vínculos.

Header: "Parlamentar" + botão [+ Novo vínculo] (→ ParlamentarVincularDialog)

Um card por ParlamentarianUser:
  Card ATIVO:
    borda esquerda verde (3px)
    avatar + parlamentaryName + badge ATIVO
    partido · gabinete · condicao
    legislatura.descricao · Posse: {dataPosse formatada}
    CPF: {user.cpf}
    Último acesso: {lastAccessAt formatado} (se disponível)
    [✏ Editar]

  Card INATIVO:
    opacidade .65
    nome + badge INATIVO + legislatura
    [✏ Editar]

══════════════════════════════════════════════════════════════════
CSS OBRIGATÓRIO
══════════════════════════════════════════════════════════════════

.parlamentar-vinculo-card {
  border: 0.5px solid var(--surface-border);
  border-radius: var(--border-radius-md);
  padding: 12px 14px;
}
.parlamentar-vinculo-card.ativo  { border-left: 3px solid var(--green-500); }
.parlamentar-vinculo-card.inativo { opacity: .65; }

.parlamentar-user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%; object-fit: cover; flex-shrink: 0;
}
.parlamentar-user-avatar-placeholder {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--surface-200);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  color: var(--text-color-secondary); flex-shrink: 0;
}

══════════════════════════════════════════════════════════════════
ORDEM DE EXECUÇÃO
══════════════════════════════════════════════════════════════════

NÃO execute nada ainda. Confirme e aguarde aprovação.

BLOCO 1: types/parlamentares.ts + api/paths.ts
BLOCO 2: UserSearchField
BLOCO 3: ParlamentarCreateDialog
BLOCO 4: ParlamentarVincularDialog
BLOCO 5: ParlamentarEditDialog
BLOCO 6: ParlamentarVerDialog

AO FINAL: npm run build → zero erros TypeScript

══════════════════════════════════════════════════════════════════
REGRAS INVIOLÁVEIS
══════════════════════════════════════════════════════════════════

  1. Parliamentarian só tem id e tenantId — sem nome, partido, gabinete
  2. Todos os dados pessoais e de mandato ficam em ParlamentarianUser
  3. Um Parliamentarian pode ter N ParlamentarianUsers
  4. Não existe PessoaFisica
  5. Não existe tenantUserId em Parliamentarian
  6. Não existe TenantUserRole.PARLIAMENTARIAN
  7. UserSearchField usa AutoComplete, nunca Dropdown
  8. Trocar user vinculado = novo ParlamentarianUser, não edição
  9. Legislatura e Condição são readonly no edit
  10. Desativar vínculo exige confirmDestructive()
  11. Perguntar antes de qualquer decisão não coberta aqui
```
