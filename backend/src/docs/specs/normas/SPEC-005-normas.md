# SPEC-005 — Normas Jurídicas e Atos Administrativos

**Status:** Aprovada | **Versão:** 1.0
**Módulos:** `src/controle-juridico/normas/` · `src/atos-administrativos/`
**API prefix:** `/api/juridico/normas` · `/api/atos`
**Depende de:** TASK-001 Migration M7

---

## Background

### Norma
O modelo atual de `Norma` registra o número e a ementa, mas não o ciclo jurídico completo que uma lei municipal atravessa:
1. **Sanção ou veto** pelo Prefeito (prazo regimental: 15 dias úteis)
2. **Promulgação** pela Câmara (se vetada e veto derrubado, ou se Prefeito não sanciona no prazo)
3. **Publicação** no Diário Oficial do Município
4. **Vigência** (pode ser na data de publicação ou prazo diferido)
5. **Revogação** por norma posterior

Sem esses campos, o controle jurídico exigido pela LAI e pelo TCE-CE fica incompleto.

### Ato Administrativo
`Ato` é o único model de negócio no schema inteiro sem `tenantId`. Portarias, editais e atos da Mesa Diretora são por câmara (tenant), não globais.

---

## O que JÁ EXISTE no schema (não recriar)

```prisma
model Norma {
  id · tenantId · tipoId → TipoNorma · numero · anoId? · data?
  dataPublicacaoInicio? · dataPublicacaoFim?   // campos de pesquisa, não do ciclo
  esferaFederacaoId? · ementa · identificadorId? · materiaOrigemId?
  mensagem? · isRemoved · createdAt · updatedAt
}

model Ato {
  id · tipoId → TipoAto · classificacaoId → ClassificacaoAto
  numero · dataInicio? · dataFim?
  dataPublicacaoInicio? · dataPublicacaoFim?   // campos de pesquisa, não do ciclo
  mensagem? · createdAt · updatedAt
  // SEM tenantId — PROBLEMA CRÍTICO
}

model TipoNorma    { id · nome @unique }  // global
model EsferaFederacao { id · nome @unique } // 3 valores: Municipal, Estadual, Federal
model IdentificadorNorma { id · nome @unique }
model TipoAto         { id · nome @unique }  // global
model ClassificacaoAto{ id · nome @unique }  // global
```

## O que as migrations criam (ver TASK-001 Migration M7)

```prisma
// Campos adicionados em Norma — ciclo jurídico completo
dataSancao       DateTime?  // data de sanção pelo Executivo
dataVeto         DateTime?  // data de veto (se houver)
tipoVeto         String?    // "TOTAL" | "PARCIAL"
motivoVeto       String?    // texto do veto
dataPromulgacao  DateTime?  // data de promulgação (pela Câmara ou Executivo)
dataPublicacao   DateTime?  // data de publicação no DOM
dataVigencia     DateTime?  // data de entrada em vigor
dataRevogacao    DateTime?  // data de revogação
normaRevoganteId String?    // FK para a Norma que revogou esta
textoUrl         String?    // URL do texto completo da lei
publicacoesOficiais PublicacaoOficial[]  // via PublicacaoOficial

// Campo adicionado em Ato
tenantId         String     // CRÍTICO — isolamento multi-tenant
tenant           Tenant     @relation(fields: [tenantId], references: [id])

// Enum para tipo de veto
enum TipoVeto { TOTAL PARCIAL }
```

---

## Estrutura de arquivos

### Normas
```
src/controle-juridico/normas/
├── normas.module.ts
├── application/
│   ├── controllers/normas.controller.ts
│   ├── dto/
│   │   ├── create-norma.dto.ts
│   │   ├── update-norma.dto.ts
│   │   ├── registrar-sancao.dto.ts
│   │   ├── registrar-veto.dto.ts
│   │   ├── registrar-promulgacao.dto.ts
│   │   ├── registrar-publicacao.dto.ts
│   │   └── list-normas-query.dto.ts
│   ├── use-cases/
│   │   ├── create-norma.use-case.ts
│   │   ├── list-normas.use-case.ts
│   │   ├── get-norma-by-id.use-case.ts
│   │   ├── registrar-sancao.use-case.ts
│   │   ├── registrar-veto.use-case.ts
│   │   ├── registrar-promulgacao.use-case.ts
│   │   ├── registrar-publicacao.use-case.ts
│   │   └── revogar-norma.use-case.ts
│   └── view-models/norma.view-model.ts
├── domain/
│   ├── entities/norma.entity.ts
│   ├── enums/status-norma.enum.ts   ← calculado, não armazenado
│   ├── repositories/norma.repository.ts
│   └── services/
│       ├── ciclo-juridico.service.ts  ← orquestra eventos do ciclo
│       └── status-norma.service.ts    ← deriva status dos campos de data
└── infra/
    └── prisma/
        ├── prisma-norma.repository.ts
        └── mappers/norma.mapper.ts
```

---

## Regras de domínio

### Status derivado da Norma (em `StatusNormaService`)

Status não é armazenado — é derivado dos campos de data no momento da consulta:

```ts
deriveStatus(norma: Norma): StatusNorma {
  if (norma.dataRevogacao && norma.dataRevogacao <= new Date()) return 'REVOGADA';
  if (!norma.dataVigencia) return 'EM_TRAMITE';
  if (norma.dataVigencia > new Date()) return 'PUBLICADA'; // aguardando vigência
  return 'VIGENTE';
}
```

Enum `StatusNorma` (não armazenado no banco, apenas calculado):
```
EM_TRAMITE → SANCIONADA | VETADA → (se vetada) PROMULGADA | ARQUIVADA
→ PUBLICADA → VIGENTE → REVOGADA
```

### Ciclo jurídico
1. Norma criada a partir de `Materia` aprovada (via `materiaOrigemId`)
2. `RegistrarSancaoUseCase`: seta `dataSancao`, emite evento de prazo de publicação
3. `RegistrarVetoUseCase`: seta `dataVeto`, `tipoVeto`, `motivoVeto`
4. `RegistrarPromulgacaoUseCase`: seta `dataPromulgacao`
5. `RegistrarPublicacaoUseCase`: seta `dataPublicacao`, cria `PublicacaoOficial`
6. Vigência: `dataVigencia` pode ser = `dataPublicacao` ou prazo diferido ("entra em vigor em 90 dias")
7. `RevogarNormaUseCase`: seta `dataRevogacao` + `normaRevoganteId`

### EsferaFederacao — candidato a enum
O lookup `EsferaFederacao` tem apenas 3 valores fixos (Municipal, Estadual, Federal). Pode ser convertido para enum Prisma na próxima oportunidade. Por ora, manter como tabela para não quebrar dados existentes.

---

## Endpoints — Normas

| Método | Rota | Use Case |
|--------|------|----------|
| GET | `/juridico/normas` | ListNormasUseCase |
| GET | `/juridico/normas/:id` | GetNormaByIdUseCase |
| POST | `/juridico/normas` | CreateNormaUseCase |
| PATCH | `/juridico/normas/:id` | UpdateNormaUseCase |
| POST | `/juridico/normas/:id/sancao` | RegistrarSancaoUseCase |
| POST | `/juridico/normas/:id/veto` | RegistrarVetoUseCase |
| POST | `/juridico/normas/:id/promulgacao` | RegistrarPromulgacaoUseCase |
| POST | `/juridico/normas/:id/publicacao` | RegistrarPublicacaoUseCase |
| POST | `/juridico/normas/:id/revogar` | RevogarNormaUseCase |
| GET | `/public/normas` | ListNormasUseCase (público) |

---

## View Model — Norma

**Resumo:** `id · tipo · numero · ano · ementa · statusDerived · dataVigencia`
**Detalhe:** resumo + `dataSancao · dataVeto · dataPromulgacao · dataPublicacao · dataRevogacao · normaRevogante · materiaOrigem · publicacoesOficiais · textoUrl`
**Nunca expor:** `tenantId · isRemoved`

---

## Atos Administrativos — nota

A implementação de `Ato` aguarda a migration M7 que adiciona `tenantId`. Após a migration:
- Todo `findMany` e `findOne` filtra por `{ tenantId, isRemoved: false }`
- Criar `AtoModule` com estrutura DDD padrão
- Endpoints: `GET/POST/PATCH/DELETE /atos`

---

## Gathering Results

- [ ] `statusDerived` retornado corretamente: VIGENTE para norma publicada com vigência passada
- [ ] Norma revogada aparece como REVOGADA com link para a revogante
- [ ] `GET /public/normas` funciona sem autenticação
- [ ] Ato sem `tenantId` retorna erro após migration M7
- [ ] Tenant A não acessa normas do tenant B → 404
