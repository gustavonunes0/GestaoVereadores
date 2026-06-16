# Prompt de Inicialização — Claude Code / GestaoVereadores

Cole este prompt inteiro na primeira mensagem de cada sessão do Claude Code.
Ele contém o contexto completo, ordem de execução e regras de trabalho.

---

## PROMPT SESSÃO 1 — Leitura e migrations (TASK-001 + PATCH)

```
Antes de qualquer ação, leia os seguintes arquivos nesta ordem exata:

1. CLAUDE.md                                              ← regras absolutas do projeto
2. backend/docs/architecture/PATTERNS.md                  ← padrões de código com exemplos reais
3. backend/docs/decisions/ADR-001-008.md                  ← por que cada decisão foi tomada
4. backend/docs/review/REVIEW-001-gaps-vs-requisitos.md   ← gaps encontrados vs documento operacional
5. backend/docs/review/REVIEW-002-autor-externo.md        ← análise completa de AutorExterno
6. backend/docs/tasks/TASK-001-schema-migrations.md       ← 7 migrations em sequência
7. backend/docs/tasks/TASK-001-PATCH-correcoes-requisitos.md ← correções obrigatórias antes das migrations

Após ler tudo, responda com um resumo confirmando que entendeu:
- As 7 migrations (M1 a M7) e sua ordem
- Os 15 gaps do REVIEW-001 e os 10 gaps do REVIEW-002
- Quais correções do PATCH devem ser incorporadas em M2, M3 e M7 antes de executá-las
- As 3 regras mais importantes do CLAUDE.md

NÃO execute nenhuma migration ainda. Aguarde minha confirmação do resumo.

---

Após confirmar o resumo, execute na seguinte ordem:

PASSO 1 — Incorporar correções do PATCH nas migrations antes de rodá-las:
- M2: adicionar `dataProtocolo DateTime?` e `justificativa String? @db.Text` em Materia
- M3: modelo AutorExterno CORRIGIDO (ver abaixo)
- M7: adicionar `complementar Boolean`, `textoIntegralUrl`, `audioUrl` em Norma
      adicionar `ementa`, `dataAto`, `anexoUrl`, `textoUrl`, `identificadorId` em Ato

Modelo AutorExterno CORRETO para M3 (substituir o da TASK-001):
```prisma
model AutorExterno {
  id          String    @id @default(uuid())
  tenantId    String
  tipoAutorId String
  nome        String                    // nome da entidade OU nome da pessoa física
  cargo       String?                   // ex: "Secretário de Educação"
  instituicao String?                   // ex: "Prefeitura de Juazeiro do Norte"
  cpf         String?
  email       String?
  telefone    String?                   // NOVO (gap AE-01)
  registro    String?                   // NOVO (gap AE-02) — OAB/CE 12345, CRM etc
  partido     String?                   // NOVO (gap AE-03) — para Deputado Federal, Presidente PSL
  uf          String?                   // NOVO (gap AE-03) — para Deputado Federal
  isRemoved   Boolean   @default(false)
  removedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant    Tenant       @relation(fields: [tenantId], references: [id])
  tipoAutor TipoAutor    @relation(fields: [tipoAutorId], references: [id])
  autores   Autor[]

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("autores_externos")
}
```

TipoAutor CORRIGIDO — tenantId nullable (gap AE-05):
```prisma
model TipoAutor {
  id         String  @id @default(uuid())
  tenantId   String?                    // MUDANÇA: nullable — NULL = tipo global
  idNegocio  Int?                       // NOVO (gap AE-04) — ID legado 1–26
  nome       String
  autores    Autor[]
  autoresExternos AutorExterno[]

  tenant Tenant? @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, nome])
  @@index([tenantId])
  @@map("tipos_autor")
}
```

Autor.nome nullable (gap AU-01):
```prisma
// Em model Autor, alterar:
nome String?   // era String — agora nullable, resolvido via AutorResolverService
```

PASSO 2 — Executar migrations M1 a M7 em sequência:
- Após cada migration: npx prisma generate && npx tsc --noEmit
- Se falhar: parar, mostrar o erro, aguardar instrução

PASSO 3 — Executar todos os seeds (após M7 concluída):
Seeds a criar em backend/prisma/seed.ts:
  - EsferaFederacao: ['Municipal', 'Estadual', 'Federal']
  - TipoNorma: 16 tipos (ver REVIEW-001 C4c)
  - IdentificadorNorma: todos os valores incluindo 'Diária' e 'Procuradoria da Mulher' (ver REVIEW-001 C4d)
  - TipoAto: ['Decreto Legislativo', 'Edital de Convocação', 'Edital de Publicação', 'Portaria']
  - ClassificacaoAto: 11 valores (ver REVIEW-001 C4g)
  - TipoAutor (GLOBAL — tenantId null): 26 tipos com idNegocio (ver REVIEW-002 seção 2)
  - TipoMateria (por tenant existente): 18 siglas incluindo OFC, PVPLO, PLCTC

Ao final desta sessão, marque todos os itens do TASK-001 e TASK-001-PATCH como [x].

REGRAS DESTA SESSÃO:
- Nunca alterar migrations já aplicadas — criar nova se precisar corrigir
- Após cada migration: generate + tsc antes de avançar
- Perguntar antes de qualquer decisão não coberta pelos docs
- Mensagens de erro sempre em português brasileiro
```

---

## PROMPT SESSÃO 2 — Módulo Matérias (TASK-001b)

```
Leia antes de começar:
1. CLAUDE.md
2. backend/docs/architecture/PATTERNS.md
3. backend/docs/specs/materias/SPEC-001-materias.md
4. backend/docs/tasks/TASK-001b-materias.md
5. backend/docs/review/REVIEW-001-gaps-vs-requisitos.md  ← seção 1.5 (múltiplos relatores)
6. backend/docs/review/REVIEW-002-autor-externo.md       ← seções 6 (AutorResolverService)

Confirme que entendeu antes de começar:
- Onde ficam os arquivos do módulo: src/legislativo/materias/
- Que múltiplos relatores usam MateriaAutorNew com papel=RELATOR (não rapporteurParliamentarianId)
- Que AutorResolverService.resolverNomeCompleto() compõe "Nome — Cargo (Instituição)" para Categoria B
- Que tramitacaoJson nunca é escrito em código novo
- Que contadores de voto são calculados, não inseridos

Execute em ordem:
  Fase 1 — Domain Layer (T-01 a T-04)
  Fase 2 — Infra Layer (T-05 a T-06)
  Fase 3 — Application Layer (T-07 a T-12)
  Fase 4 — Testes (T-13)
  Seed de TipoMateria (T-14)

ADIÇÕES ao TASK-001b não documentadas (incorporar):

1. AutorResolverService deve ter método adicional:
   resolverNomeCompleto(autorExterno: AutorExterno): string
   → Categoria A (entidade): retorna autorExterno.nome
   → Categoria B (cargo+pessoa): retorna `${nome} — ${cargo} (${instituicao})`
   → Categoria C (registro): retorna `${nome} — ${cargo} (${registro})`

2. Novo use case obrigatório: ListAutoresExternosUseCase
   → GET /legislative/materias/autores-externos?tipoAutorId=xxx
   → Lista AutorExterno do tenant filtrando por tipo
   → Necessário para o frontend montar o select de autores por tipo

3. CreateMateriaDto deve incluir campo para múltiplos relatores:
   relatoresIds?: string[]  // array de autorId com papel=RELATOR

Ao concluir cada fase, rodar: npx jest --testPathPattern=legislativo/materias
Ao final, marcar todos os itens do TASK-001b como [x].

REGRAS DESTA SESSÃO:
- Todo query filtra { tenantId, isRemoved: false }
- Nunca retornar Prisma model direto — sempre via View Model
- Controller só chama use cases, zero lógica de negócio nele
- Perguntar se algo não estiver coberto na spec
```

---

## PROMPT SESSÃO 3 — Sessões Plenárias e Votações (TASK-002 + TASK-003)

```
Leia antes de começar:
1. CLAUDE.md
2. backend/docs/architecture/PATTERNS.md
3. backend/docs/specs/sessoes/SPEC-002-sessoes.md
4. backend/docs/tasks/TASK-002-sessoes.md
5. backend/docs/specs/votacoes/SPEC-003-votacoes.md
6. backend/docs/tasks/TASK-003-005-votacoes-agenda-normas.md  ← seção TASK-003

Confirme que entendeu:
- Ciclo de vida da sessão: AGENDADA → ABERTA → SUSPENSA|ENCERRADA (nunca direto de AGENDADA para ENCERRADA)
- Que cicloVidaJson nunca é escrito em código novo
- Que contadores de voto (votosSim/Nao/abstencoes) são CALCULADOS via groupBy, nunca inseridos
- Que VotoParlamentar tem FK dual: parlamentarId (legado) E parliamentarianId (novo)
- Que VotoParlamentar.parliamentarianId deve ser preenchido em código novo
- Que votação SECRETA não expõe votos individuais no response

Execute TASK-002 completa primeiro, depois TASK-003.
A TASK-003 importa QuorumService do módulo sessoes — garantir que MateriasModule esteja registrado antes.

Ao final de cada módulo:
  npx jest --testPathPattern=legislativo/sessoes-plenarias
  npx jest --testPathPattern=legislativo/votacoes
  npx tsc --noEmit

REGRAS DESTA SESSÃO:
- SessaoPlenaria.podeTransicionarPara() fica na entity de domínio, não no use case
- Transaction de transição de status fica no repository Prisma, não no use case
- AbrirSessaoUseCase registra quorumPresente no momento de abertura
- EncerrarVotacaoUseCase chama calcularContagem() ANTES de gravar resultado
```

---

## PROMPT SESSÃO 4 — Agenda, Normas e Atos (TASK-004 + TASK-005)

```
Leia antes de começar:
1. CLAUDE.md
2. backend/docs/architecture/PATTERNS.md
3. backend/docs/specs/agenda/SPEC-004-agenda.md
4. backend/docs/specs/normas/SPEC-005-normas.md
5. backend/docs/tasks/TASK-003-005-votacoes-agenda-normas.md  ← seções TASK-004 e TASK-005

Confirme que entendeu:
- AgendaLegislativa agora tem sessaoPlenariaId (migration M6 já aplicada)
- StatusNorma é CALCULADO via getter na entity — nunca armazenado no banco
- Ato agora tem tenantId (migration M7 já aplicada) — todo query filtra tenantId
- Norma tem campo complementar Boolean (correction C2 já aplicada)
- Endpoint GET /public/normas e GET /public/agenda NÃO requerem autenticação

Execute TASK-004 (agenda) e TASK-005 (normas+atos) em paralelo se possível,
pois não dependem uma da outra.

Ao final:
  npx jest --testPathPattern=legislativo/agenda
  npx jest --testPathPattern=controle-juridico/normas
  npx jest --testPathPattern=atos-administrativos
  npx tsc --noEmit

ATENÇÃO para Ato:
- Após migration M7, campo tenantId em Ato pode ainda estar nullable
- Verificar: SELECT COUNT(*) FROM ato WHERE tenant_id IS NULL
- Se houver registros sem tenant_id, perguntar ao usuário qual tenant atribuir antes de tornar NOT NULL
```

---

## PROMPT GENÉRICO — Para retomar sessão interrompida

```
Antes de continuar, leia:
1. CLAUDE.md
2. backend/docs/architecture/PATTERNS.md
3. [arquivo da task que estava em andamento]

Liste quais tasks estão com [x] (concluídas) e quais ainda têm [ ] (pendentes).
Retome a partir da primeira task pendente.

Não refaça o que já está com [x].
Confirme o ponto de retomada antes de executar qualquer código.
```

---

## Ordem global das sessões

```
Sessão 1: TASK-001 (migrations M1→M7) + TASK-001-PATCH (correções) + seeds
    ↓ desbloqueada →
Sessão 2: TASK-001b (módulo materias)
    ↓ e em paralelo →
Sessão 3: TASK-002 (sessoes) → TASK-003 (votacoes)
Sessão 4: TASK-004 (agenda) + TASK-005 (normas + atos)
```

## Checklist de verificação antes de cada sessão

- [ ] Sessão anterior concluída e todas as tasks com [x]
- [ ] `npx prisma migrate status` — todas as migrations aplicadas
- [ ] `npx tsc --noEmit` — zero erros de tipo
- [ ] `npx jest` — todos os testes passando
- [ ] `docker-compose up -d` — banco rodando na porta 5433
