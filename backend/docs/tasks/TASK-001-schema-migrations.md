# TASK-001 — Migrations do Schema (base para tudo)

**Bloqueia:** TASK-002, TASK-003, TASK-004, TASK-005
**Schema atual:** `backend/prisma/schema.prisma`
**Regras:** `CLAUDE.md` raiz do projeto

> Executar as migrations em ordem. Nunca pular uma etapa.
> Cada migration é atômica — se falhar, corrigir antes de avançar.
> Após TODA migration: rodar `npx prisma generate` e `npx tsc --noEmit`.

---

## M1 — TipoMateria: sigla, ordem e soft delete

### O que fazer
- [ ] Abrir `backend/prisma/schema.prisma`
- [ ] Localizar model `TipoMateria` (tem: `id · tenantId · nome`)
- [ ] Adicionar os campos:

```prisma
model TipoMateria {
  id       String  @id @default(uuid())
  tenantId String
  tenant   Tenant  @relation(fields: [tenantId], references: [id])
  nome     String
  sigla     String   // NOVO: PLO, REQ, MOÇ, PIL, PAR, PLC, PLOE, PR, ELOM, IND, PVPLO, PDL, SUB, REC
  ordem     Int?     // NOVO: para ordenação nas listagens
  isRemoved Boolean  @default(false)  // NOVO
  removedAt DateTime?                 // NOVO

  materias Materia[]

  @@unique([tenantId, nome])
  @@index([tenantId])
  @@index([tenantId, isRemoved])  // NOVO
}
```

- [ ] Rodar: `npx prisma migrate dev --name add_sigla_ordem_tipo_materia`

### Seed após migration
- [ ] Popular `sigla` para todos os `TipoMateria` existentes no banco:
  ```sql
  -- Exemplos baseados no documento operacional
  UPDATE tipo_materia SET sigla = 'PLO'  WHERE nome ILIKE '%lei ordinária%';
  UPDATE tipo_materia SET sigla = 'PLC'  WHERE nome ILIKE '%lei complementar%';
  UPDATE tipo_materia SET sigla = 'PDL'  WHERE nome ILIKE '%decreto legislativo%';
  UPDATE tipo_materia SET sigla = 'PR'   WHERE nome ILIKE '%resolução%';
  UPDATE tipo_materia SET sigla = 'REQ'  WHERE nome ILIKE '%requerimento%';
  UPDATE tipo_materia SET sigla = 'IND'  WHERE nome ILIKE '%indicação%';
  UPDATE tipo_materia SET sigla = 'SUB'  WHERE nome ILIKE '%substitutivo%';
  UPDATE tipo_materia SET sigla = 'SUBE' WHERE nome ILIKE '%sub-emenda%';
  UPDATE tipo_materia SET sigla = 'PAR'  WHERE nome ILIKE '%parecer%';
  UPDATE tipo_materia SET sigla = 'REC'  WHERE nome ILIKE '%recurso%';
  UPDATE tipo_materia SET sigla = 'ELOM' WHERE nome ILIKE '%emenda%lei orgânica%';
  UPDATE tipo_materia SET sigla = 'EMD'  WHERE nome ILIKE 'emenda';
  UPDATE tipo_materia SET sigla = 'PIL'  WHERE nome ILIKE '%indicação de lei%';
  UPDATE tipo_materia SET sigla = 'PLOE' WHERE nome ILIKE '%executivo%';
  UPDATE tipo_materia SET sigla = 'MOÇ'  WHERE nome ILIKE '%moção%';
  -- Verificar: todos devem ter sigla antes de tornar NOT NULL
  SELECT id, nome FROM tipo_materia WHERE sigla IS NULL;
  ```

**Aceite:** todos os TipoMateria têm `sigla` não-nulo.

---

## M2 — Materia: campos de documentos, publicação e soft delete

### O que fazer
- [ ] Localizar model `Materia` no schema
- [ ] ⚠️ Verificar constraint unique existente: `@@unique([tenantId, tipoId, numero, anoId])` — já existe, não duplicar
- [ ] Adicionar campos novos:

```prisma
// Adicionar APÓS os campos existentes, ANTES das relações:
sigla                   String?   // copiado de TipoMateria.sigla no momento de criação
textoOriginalUrl        String?   // URL do arquivo (PDF/DOC) no storage
textoIntegralUrl        String?   // URL do texto integral
audioUrl                String?   // URL do áudio da leitura

// Publicação direta (campos de acesso rápido)
dataPublicacao          DateTime?
veiculoPublicacao       String?
paginaInicio            Int?
paginaFim               Int?
identificadorPublicacao String?
urlExternaPublicacao    String?

// Soft delete — padrão do projeto
isRemoved               Boolean   @default(false)
removedAt               DateTime?
```

- [ ] Adicionar relações novas no model `Materia`:

```prisma
tramitacaoHistorico     TramitacaoHistorico[]   // NOVO
publicacoesOficiais     PublicacaoOficial[]      // NOVO (model criado em M3)
```

- [ ] Adicionar index:

```prisma
@@index([tenantId, isRemoved])  // NOVO
```

- [ ] Rodar: `npx prisma migrate dev --name add_campos_materia_v2`

**⚠️ Verificar antes:** `sigla` começa como `String?` (nullable) para não quebrar dados existentes. Tornar NOT NULL só após popular via seed.

---

## M3 — Novos models: AutorExterno, TramitacaoHistorico, PublicacaoOficial

### 3a — AutorExterno

```prisma
model AutorExterno {
  id          String    @id @default(uuid())
  tenantId    String
  tipoAutorId String
  nome        String
  cargo       String?
  instituicao String?
  cpf         String?
  email       String?
  isRemoved   Boolean   @default(false)
  removedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  tipoAutor TipoAutor @relation(fields: [tipoAutorId], references: [id])
  autores   Autor[]

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("autores_externos")
}
```

- [ ] Adicionar `autorExternoId String?` e relação em `Autor`:

```prisma
// Adicionar em model Autor (após guestUserId):
autorExternoId  String?
autorExterno    AutorExterno? @relation(fields: [autorExternoId], references: [id])
```

- [ ] Adicionar relação inversa em `Tenant`:
```prisma
autoresExternos AutorExterno[]
```

### 3b — TramitacaoHistorico

```prisma
model TramitacaoHistorico {
  id               String         @id @default(uuid())
  materiaId        String
  dataHora         DateTime       @default(now())
  statusAnterior   StatusMateria?
  statusNovo       StatusMateria
  unidadeOrigemId  String?
  unidadeDestinoId String?
  responsavelId    String?
  despacho         String?
  observacao       String?

  materia        Materia             @relation(fields: [materiaId], references: [id])
  unidadeOrigem  UnidadeTramitacao?  @relation("HistOrigem",  fields: [unidadeOrigemId],  references: [id])
  unidadeDestino UnidadeTramitacao?  @relation("HistDestino", fields: [unidadeDestinoId], references: [id])
  responsavel    TenantUser?         @relation(fields: [responsavelId], references: [id])

  @@index([materiaId])
  @@index([materiaId, dataHora])
  @@map("tramitacao_historico")
}
```

> Adicionar relações inversas em `UnidadeTramitacao`:
> ```prisma
> historicoOrigem  TramitacaoHistorico[] @relation("HistOrigem")
> historicoDestino TramitacaoHistorico[] @relation("HistDestino")
> ```

### 3c — PublicacaoOficial

```prisma
model PublicacaoOficial {
  id             String    @id @default(uuid())
  tenantId       String
  materiaId      String?
  normaId        String?
  dataPublicacao DateTime
  veiculo        String
  paginaInicio   Int?
  paginaFim      Int?
  identificador  String?
  urlExterna     String?
  textoIntegral  String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  tenant  Tenant   @relation(fields: [tenantId], references: [id])
  materia Materia? @relation(fields: [materiaId], references: [id])
  norma   Norma?   @relation(fields: [normaId],   references: [id])

  @@index([tenantId])
  @@index([materiaId])
  @@index([normaId])
  @@map("publicacoes_oficiais")
}
```

> Adicionar relações inversas:
> - `Tenant`: `publicacoesOficiais PublicacaoOficial[]`
> - `Norma`: `publicacoesOficiais PublicacaoOficial[]`

- [ ] Rodar: `npx prisma migrate dev --name add_autor_externo_tramitacao_publicacao`
- [ ] `npx prisma generate`
- [ ] `npx tsc --noEmit`

---

## M4 — Sessões: StatusSessao enum e campos de ciclo de vida

### Novos enums

```prisma
enum StatusSessao {
  AGENDADA
  ABERTA
  SUSPENSA
  ENCERRADA
  CANCELADA
}

enum StatusPautaItem {
  RASCUNHO
  PUBLICADA
  ENCERRADA
}
```

### Campos adicionados em SessaoPlenaria

```prisma
// Adicionar após campo situacaoId (que é legado):
statusSessao          StatusSessao  @default(AGENDADA)
dataAbertura          DateTime?
dataEncerramento      DateTime?
dataSuspensao         DateTime?
quorumMinimo          Int?
quorumPresente        Int?          // registrado no momento de abertura
responsavelAberturaId String?
observacoes           String?

// Relação nova:
responsavelAbertura   TenantUser?   @relation("SessaoAbertaPor", fields: [responsavelAberturaId], references: [id])
```

> Adicionar relação inversa em `TenantUser`:
> ```prisma
> sessoesAbertas SessaoPlenaria[] @relation("SessaoAbertaPor")
> ```

### Campos adicionados em PautaItem

```prisma
// Adicionar após campo resultado:
statusPauta  StatusPautaItem  @default(RASCUNHO)
publicadaEm  DateTime?
ordemDia     Int?
```

- [ ] Rodar: `npx prisma migrate dev --name add_status_sessao_pauta`

---

## M5 — Votações: campos de rastreabilidade e FK dual em VotoParlamentar

### Campos adicionados em Votacao

```prisma
// Adicionar após realizadaAt:
encerradaAt      DateTime?
responsavelId    String?
quorumVotacao    Int?
motivoEmpate     String?
observacoes      String?

responsavel      TenantUser? @relation("VotacaoEncerradaPor", fields: [responsavelId], references: [id])
```

### FK dual em VotoParlamentar (migração de legado → novo)

```prisma
model VotoParlamentar {
  id            String      @id @default(uuid())
  votacaoId     String
  votacao       Votacao     @relation(fields: [votacaoId], references: [id], onDelete: Cascade)

  // Legado (manter)
  parlamentarId    String?
  parlamentar      Parlamentar?    @relation(fields: [parlamentarId], references: [id])

  // Novo (adicionar)
  parliamentarianId String?
  parliamentarian   Parliamentarian? @relation(fields: [parliamentarianId], references: [id])

  voto Voto

  @@unique([votacaoId, parlamentarId])
  // NOVO unique para o modelo novo:
  @@unique([votacaoId, parliamentarianId])
}
```

> Adicionar relação inversa em `Parliamentarian`:
> ```prisma
> votos VotoParlamentar[]
> ```

**Regra de validação (no service):** pelo menos uma das FKs (`parlamentarId` ou `parliamentarianId`) deve estar preenchida.

- [ ] Rodar: `npx prisma migrate dev --name add_votacao_rastreabilidade_parlamentarian`

---

## M6 — Agenda: campos de enriquecimento e vínculo com SessaoPlenaria

```prisma
// Adicionar em AgendaLegislativa:
descricao          String?
local              String?
sessaoPlenariaId   String?
comissaoId         String?
publicoExterno     Boolean   @default(false)
linkTransmissao    String?
recorrencia        String?
recorrenciaPaiId   String?

sessaoPlenaria     SessaoPlenaria?     @relation("AgendaSessao", fields: [sessaoPlenariaId], references: [id])
comissao           Committee?          @relation(fields: [comissaoId], references: [id])
recorrenciaPai     AgendaLegislativa?  @relation("RecorrenciaSerie", fields: [recorrenciaPaiId], references: [id])
ocorrencias        AgendaLegislativa[] @relation("RecorrenciaSerie")
```

> Relações inversas em:
> - `SessaoPlenaria`: `agendas AgendaLegislativa[] @relation("AgendaSessao")`
> - `Committee`: `agendas AgendaLegislativa[]`

- [ ] Rodar: `npx prisma migrate dev --name add_agenda_vinculo_sessao`

---

## M7 — Norma: ciclo jurídico | Ato: tenantId

### Campos adicionados em Norma

```prisma
dataSancao       DateTime?
dataVeto         DateTime?
tipoVeto         String?       // "TOTAL" | "PARCIAL"
motivoVeto       String?
dataPromulgacao  DateTime?
dataPublicacao   DateTime?
dataVigencia     DateTime?
dataRevogacao    DateTime?
normaRevoganteId String?
textoUrl         String?

normaRevogante   Norma?  @relation("NormaRevogante", fields: [normaRevoganteId], references: [id])
normasRevogadas  Norma[] @relation("NormaRevogante")
publicacoesOficiais PublicacaoOficial[]  // se M3 já foi executada
```

### Ato: adicionar tenantId

```prisma
model Ato {
  id             String           @id @default(uuid())
  tenantId       String           // NOVO — crítico
  tipoId         String
  tipo           TipoAto          @relation(fields: [tipoId], references: [id])
  classificacaoId String
  classificacao  ClassificacaoAto @relation(fields: [classificacaoId], references: [id])
  numero         String
  dataInicio     DateTime?
  dataFim        DateTime?
  dataPublicacaoInicio DateTime?
  dataPublicacaoFim    DateTime?
  mensagem       String?
  isRemoved      Boolean   @default(false)   // NOVO
  removedAt      DateTime?                    // NOVO
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])  // NOVO

  @@index([tenantId])          // NOVO
  @@index([tenantId, isRemoved])  // NOVO
}
```

> Adicionar em `Tenant`: `atos Ato[]`

**⚠️ Atenção:** `tenantId` em `Ato` começa como `String?` (nullable) na migration para não quebrar dados existentes. Após popular `tenantId` para todos os atos existentes, criar outra migration para tornar NOT NULL.

- [ ] Rodar: `npx prisma migrate dev --name add_norma_ciclo_juridico_ato_tenantid`
- [ ] Popular `tenantId` nos atos existentes:
  ```sql
  -- Se todos os atos pertencem a um tenant único, identificar qual:
  SELECT id, nome FROM tenant LIMIT 10;
  UPDATE ato SET tenant_id = '<id-do-tenant>' WHERE tenant_id IS NULL;
  ```
- [ ] Criar migration para tornar NOT NULL: `npx prisma migrate dev --name ato_tenantid_not_null`

---

## Checklist final pós-migrations

- [ ] `npx prisma generate` executado após última migration
- [ ] `npx tsc --noEmit` sem erros
- [ ] Seed executado: `npx prisma db seed`
- [ ] Todos os `TipoMateria` têm `sigla` não-nulo
- [ ] `TramitacaoHistorico` existe como tabela no banco
- [ ] `AutorExterno` existe como tabela no banco
- [ ] `PublicacaoOficial` existe como tabela no banco
- [ ] `Ato` tem coluna `tenant_id` NOT NULL
- [ ] `VotoParlamentar` tem coluna `parliamentarian_id` nullable
- [ ] `SessaoPlenaria` tem coluna `status_sessao` com default AGENDADA
- [ ] `AgendaLegislativa` tem coluna `sessao_plenaria_id` nullable

---

## Notas para o Claude Code

- Executar migrations em ordem M1→M7, sem pular
- Cada migration tem sua própria seed quando necessário
- Após erros: `npx prisma migrate resolve --rolled-back <nome>` antes de tentar novamente
- Verificar `npx prisma migrate status` entre migrations
- Não alterar o histórico de migrations já aplicadas
