# SPEC-001 — Matérias Legislativas

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/materias/`
**API prefix:** `/api/legislative/materias`
**Depende de:** Migrations M1, M2, M3 do TASK-001

---

## Background

Matéria é o núcleo do processo legislativo. O schema atual tem três problemas estruturais:
1. `tramitacaoJson` no lugar de histórico auditável
2. Autoria polimórfica sem validação (três FKs opcionais em `Autor`, sem `AutorExterno`)
3. Publicação oficial inexistente como entidade

Este spec cobre a implementação DDD completa do submódulo após as migrations.

---

## O que JÁ EXISTE no schema (não recriar)

```prisma
// Já existem — só adicionar campos faltantes via migration
model Materia {
  id · tenantId · tipoId · ementa · numero? · numeroProtocolo? · anoId?
  status StatusMateria @default(DRAFT)
  tramitacaoJson Json  // LEGADO — não usar em código novo
  autorId? → Autor ("AutorMateria")
  primeiroAutorId? → Parlamentar  // legado
  relatorId? → Parlamentar        // legado
  authorParliamentarianId? → Parliamentarian ("MatterAuthor")
  rapporteurParliamentarianId? → Parliamentarian ("MatterRapporteur")
  pautaItens · materiaAutores · coautores · matterCoauthors · normas
  @@unique([tenantId, tipoId, numero, anoId])  // já existe
}

model Autor {
  parlamentarId? → Parlamentar    // legado
  parliamentarianId? → Parliamentarian
  guestUserId? → GuestUser
  // FALTA: autorExternoId? → AutorExterno
}

model TipoMateria {
  id · tenantId · nome
  // FALTA: sigla · ordem · isRemoved · removedAt
}

model MatterCoauthor { // já existe (novo EN)
  matterId · parliamentarianId · ordem
}
```

## O que as migrations criam (ver TASK-001)

```prisma
// MIGRATION M1 — adiciona a TipoMateria
sigla     String   // PLO, REQ, MOÇ, PIL, PAR, PLC, PLOE, PR, ELOM, IND, PVPLO, PDL, SUB, REC
ordem     Int?
isRemoved Boolean  @default(false)
removedAt DateTime?

// MIGRATION M2 — adiciona a Materia
sigla                   String    // copiado de TipoMateria no momento de criação
textoOriginalUrl        String?
textoIntegralUrl        String?
audioUrl                String?
dataPublicacao          DateTime?
veiculoPublicacao       String?
paginaInicio            Int?
paginaFim               Int?
identificadorPublicacao String?
urlExternaPublicacao    String?
isRemoved               Boolean   @default(false)
removedAt               DateTime?
// relações novas:
tramitacaoHistorico     TramitacaoHistorico[]
publicacoesOficiais     PublicacaoOficial[]

// MIGRATION M3 — novos models
model TramitacaoHistorico { ... }
model AutorExterno { ... }
model PublicacaoOficial { ... }
// campo em Autor:
autorExternoId String?
```

---

## Estrutura de arquivos do submódulo

```
src/legislativo/materias/
├── materias.module.ts
├── application/
│   ├── controllers/materias.controller.ts
│   ├── dto/
│   │   ├── create-materia.dto.ts
│   │   ├── update-materia.dto.ts
│   │   ├── tramitar-materia.dto.ts
│   │   ├── list-materias-query.dto.ts
│   │   ├── add-autor-materia.dto.ts
│   │   └── create-publicacao.dto.ts
│   ├── use-cases/
│   │   ├── create-materia.use-case.ts
│   │   ├── list-materias.use-case.ts
│   │   ├── get-materia-by-id.use-case.ts
│   │   ├── update-materia.use-case.ts
│   │   ├── tramitar-materia.use-case.ts
│   │   ├── add-autor-materia.use-case.ts
│   │   ├── remove-autor-materia.use-case.ts
│   │   └── add-publicacao-materia.use-case.ts
│   └── view-models/
│       ├── materia.view-model.ts
│       ├── tramitacao-historico.view-model.ts
│       └── publicacao-oficial.view-model.ts
├── domain/
│   ├── entities/
│   │   ├── materia.entity.ts
│   │   ├── tramitacao-historico.entity.ts
│   │   └── publicacao-oficial.entity.ts
│   ├── enums/
│   │   ├── status-materia.enum.ts        ← espelha enum Prisma existente
│   │   └── papel-autor-materia.enum.ts
│   ├── repositories/
│   │   ├── materia.repository.ts
│   │   └── tramitacao-historico.repository.ts
│   └── services/
│       ├── numeracao-materia.service.ts
│       └── autor-resolver.service.ts
└── infra/
    └── prisma/
        ├── prisma-materia.repository.ts
        ├── prisma-tramitacao-historico.repository.ts
        └── mappers/
            ├── materia.mapper.ts
            └── tramitacao-historico.mapper.ts
```

---

## Regras de domínio

### Numeração
- Chave única: `(tenantId, tipoId, numero, anoId)` — constraint já existe no schema
- `NumeracaoMateriaService.proximoNumero()` usa `SELECT MAX(numero)+1 ... FOR UPDATE`
- Identificação pública: getter `${sigla} nº ${numero}/${ano}` na entity

### Transições de status (em `Materia.podeTransicionarPara()`)
```
DRAFT           → PROTOCOLADA
PROTOCOLADA     → EM_TRAMITACAO
EM_TRAMITACAO   → EM_PAUTA | ARQUIVADA | RETIRADA
EM_PAUTA        → APROVADA | REJEITADA | EM_TRAMITACAO
APROVADA        → TRANSFORMADA_EM_NORMA
REJEITADA/ARQUIVADA/RETIRADA/TRANSFORMADA_EM_NORMA → (terminal)
```

### Autoria polimórfica
`AutorResolverService.validar()` garante exatamente uma FK em `Autor`:
- `parlamentarId` → legado (Parlamentar PT)
- `parliamentarianId` → novo (Parliamentarian EN)
- `autorExternoId` → entidades institucionais (Executivo, OAB, sindicatos...)
- `guestUserId` → convidados com acesso ao sistema

### TramitacaoHistorico — append-only
- Transaction: `UPDATE materia.status + INSERT tramitacao_historico`
- Nunca chamar `update()` ou `delete()` em `TramitacaoHistorico`
- `despacho` obrigatório para transições: `EM_TRAMITACAO`, `APROVADA`, `REJEITADA`

---

## Endpoints

Todos com `@UseGuards(JwtAuthGuard, TenantGuard)`. `tenantId` via `@CurrentTenant()`.

| Método | Rota | Use Case |
|--------|------|----------|
| GET | `/legislative/materias` | ListMateriasUseCase |
| GET | `/legislative/materias/:id` | GetMateriaByIdUseCase |
| POST | `/legislative/materias` | CreateMateriaUseCase |
| PATCH | `/legislative/materias/:id` | UpdateMateriaUseCase |
| DELETE | `/legislative/materias/:id` | soft delete |
| POST | `/legislative/materias/:id/tramitar` | TramitarMateriaUseCase |
| GET | `/legislative/materias/:id/tramitacao` | histórico completo |
| POST | `/legislative/materias/:id/autores` | AddAutorMateriaUseCase |
| DELETE | `/legislative/materias/:id/autores/:aId` | RemoveAutorMateriaUseCase |
| POST | `/legislative/materias/:id/publicacoes` | AddPublicacaoMateriaUseCase |

---

## View Model — campos expostos

**Resumo (listagem):** `id · identificacao · ementa · status · autorPrincipal · createdAt · updatedAt`
**Detalhe:** resumo + `justificativa · textoOriginalUrl · textoIntegralUrl · audioUrl · autoresAdicionais · tramitacaoHistorico · publicacoesOficiais`
**Nunca expor:** `tenantId · isRemoved · removedAt · tramitacaoJson`

---

## Tipos de autor (do documento operacional)

| ID | Descrição | Entidade |
|----|-----------|----------|
| 1 | Parlamentar | `Parliamentarian` (novo) |
| 2-6 | Frente, Comissão, Órgão, Bancada, Bloco | `AutorExterno` |
| 7-26 | Executivo, OAB, Sindicatos, Procurador... | `AutorExterno` |

---

## Gathering Results

- [ ] `POST /legislative/materias` → identificação `PLO nº 1/2025`
- [ ] Tenant A não lê matérias do tenant B → 404
- [ ] Transição inválida → 400 com mensagem em português
- [ ] Tramitar cria novo `TramitacaoHistorico`, nunca atualiza existente
- [ ] Response nunca contém `tenantId`, `isRemoved`, `tramitacaoJson`
- [ ] Soft delete → `isRemoved: true`, some das listagens
- [ ] Histórico de tramitação em ordem decrescente
