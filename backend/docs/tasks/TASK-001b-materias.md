# TASK-001b — Submódulo: Matérias (após migrations)

**Spec:** `backend/docs/specs/materias/SPEC-001-materias.md`
**Depende de:** TASK-001 M1, M2, M3 concluídas
**Módulo:** `src/legislativo/materias/`
**Pode rodar em paralelo com:** TASK-002, TASK-004, TASK-005

---

## Fase 1 — Domain Layer

### T-01 · Enums de domínio
- [ ] `domain/enums/status-materia.enum.ts` — espelha enum Prisma `StatusMateria` (já existe)
  ```ts
  export enum StatusMateria {
    DRAFT = 'DRAFT', PROTOCOLADA = 'PROTOCOLADA', EM_TRAMITACAO = 'EM_TRAMITACAO',
    EM_PAUTA = 'EM_PAUTA', APROVADA = 'APROVADA', REJEITADA = 'REJEITADA',
    ARQUIVADA = 'ARQUIVADA', RETIRADA = 'RETIRADA', TRANSFORMADA_EM_NORMA = 'TRANSFORMADA_EM_NORMA',
  }
  ```
- [ ] `domain/enums/papel-autor-materia.enum.ts`
  ```ts
  export enum PapelAutorMateria { COAUTOR = 'COAUTOR', RELATOR = 'RELATOR', REPRESENTANTE = 'REPRESENTANTE' }
  ```

### T-02 · Entities de domínio
- [ ] `domain/entities/materia.entity.ts`
  - Getter: `get identificacao(): string` → `${sigla} nº ${numero}/${ano}` ex: `PLO nº 3/2025`
  - Método: `podeTransicionarPara(novoStatus: StatusMateria): boolean`
    ```
    DRAFT           → PROTOCOLADA
    PROTOCOLADA     → EM_TRAMITACAO
    EM_TRAMITACAO   → EM_PAUTA | ARQUIVADA | RETIRADA
    EM_PAUTA        → APROVADA | REJEITADA | EM_TRAMITACAO
    APROVADA        → TRANSFORMADA_EM_NORMA
    Demais          → (terminal)
    ```
  - **Zero imports de @prisma/client ou @nestjs/***
- [ ] `domain/entities/tramitacao-historico.entity.ts`
- [ ] `domain/entities/publicacao-oficial.entity.ts`

### T-03 · Repository contracts (abstract class)
- [ ] `domain/repositories/materia.repository.ts`
  ```ts
  export abstract class MateriaRepository {
    abstract findMany(params: FindManyMateriasParams): Promise<{ data: Materia[]; total: number }>;
    abstract findById(id: string, tenantId: string): Promise<Materia | null>;
    abstract create(materia: Materia): Promise<Materia>;
    abstract save(materia: Materia): Promise<Materia>;
    abstract softDelete(id: string, tenantId: string): Promise<void>;
    abstract tramitar(id: string, tenantId: string, dados: TramitacaoDados): Promise<void>;
    abstract proximoNumero(tenantId: string, tipoId: string, anoId: string): Promise<number>;
  }
  ```
- [ ] `domain/repositories/tramitacao-historico.repository.ts`

### T-04 · Domain services
- [ ] `domain/services/numeracao-materia.service.ts`
  - `proximoNumero(tenantId, tipoId, anoId): Promise<number>` via `SELECT MAX(numero)+1 FOR UPDATE`
- [ ] `domain/services/autor-resolver.service.ts`
  - `validar(autorId, tenantId): Promise<void>`
    - Busca `Autor`, conta FKs preenchidas (`parlamentarId`, `parliamentarianId`, `autorExternoId`, `guestUserId`)
    - Lança `BadRequestException('Autor inválido: exatamente uma referência é obrigatória')` se != 1
  - `resolverNome(autor: Autor): string`

---

## Fase 2 — Infra Layer

### T-05 · Mappers
- [ ] `infra/prisma/mappers/materia.mapper.ts` — `toDomain(raw) · toPrisma(entity)`
- [ ] `infra/prisma/mappers/tramitacao-historico.mapper.ts`
- [ ] `infra/prisma/mappers/publicacao-oficial.mapper.ts`

### T-06 · Prisma repositories
- [ ] `infra/prisma/prisma-materia.repository.ts`
  - `findById`: `where: { id, tenantId, isRemoved: false }` — sempre os três
  - `findMany`: `where: { tenantId, isRemoved: false, ...filtros }`
  - `softDelete`: `{ isRemoved: true, removedAt: new Date() }` — **nunca `.delete()`**
  - `tramitar`: `prisma.$transaction([update materia.status, create tramitacao_historico])` — **append-only**
  - `proximoNumero`: `$queryRaw` com `SELECT COALESCE(MAX(numero),0)+1 ... FOR UPDATE`
- [ ] `infra/prisma/prisma-tramitacao-historico.repository.ts`

---

## Fase 3 — Application Layer

### T-07 · DTOs
- [ ] `create-materia.dto.ts` — `tipoId · anoId · ementa` (required) | `justificativa · autorId` (optional)
- [ ] `update-materia.dto.ts` — só campos editáveis com `@IsOptional()`; sem `status · numero · tipoId · anoId`
- [ ] `tramitar-materia.dto.ts` — `novoStatus · despacho` (required) | `unidadeDestinoId · observacao` (optional)
- [ ] `list-materias-query.dto.ts` — `page · limit · status · tipoId · ano · autorId · search`
- [ ] `add-autor-materia.dto.ts` — `autorId · papel PapelAutorMateria`
- [ ] `create-publicacao.dto.ts` — `dataPublicacao · veiculo` | opcionais: `paginaInicio · paginaFim · identificador · urlExterna`

Todos com `class-validator` + `@ApiProperty()`.

### T-08 · View Models
- [ ] `materia.view-model.ts`
  - `toHttp(materia)` — resumo: `id · identificacao · ementa · status · autorPrincipal · createdAt · updatedAt`
  - `toHttpDetalhe(materia)` — completo + `tramitacaoHistorico · autoresAdicionais · publicacoesOficiais`
  - **Nunca expor:** `tenantId · isRemoved · removedAt · tramitacaoJson`
- [ ] `tramitacao-historico.view-model.ts`
- [ ] `publicacao-oficial.view-model.ts`

### T-09 · Use Cases — leitura
- [ ] `list-materias.use-case.ts` — paginação com `{ data, meta: { total, page, limit, totalPages } }`
- [ ] `get-materia-by-id.use-case.ts` — `NotFoundException('Matéria não encontrada')` se null

### T-10 · Use Cases — escrita
- [ ] `create-materia.use-case.ts`
  - Buscar `sigla` do `TipoMateria`
  - Chamar `numeracaoMateriaService.proximoNumero()` dentro de transaction
  - Se `autorId` → `autorResolverService.validar()`
  - Criar `Materia` + 1° `TramitacaoHistorico` (status=DRAFT) em transaction
- [ ] `update-materia.use-case.ts` — bloqueia alteração de `status · numero · tipoId · anoId`
- [ ] `tramitar-materia.use-case.ts`
  - Carregar matéria → verificar `podeTransicionarPara()`
  - `BadRequestException('Transição inválida: ${atual} → ${novo}')` se bloqueada
  - `despacho` obrigatório para EM_TRAMITACAO, APROVADA, REJEITADA
  - Chamar `materiaRepo.tramitar()` (transaction fica na infra)
- [ ] `add-autor-materia.use-case.ts` — valida autor, verifica duplicata
- [ ] `remove-autor-materia.use-case.ts` — impede remoção do autor principal
- [ ] `add-publicacao-materia.use-case.ts`

### T-11 · Controller
- [ ] `controllers/materias.controller.ts` — todos os endpoints da SPEC-001
- [ ] `@UseGuards(JwtAuthGuard, TenantGuard)` na classe
- [ ] `tenantId` via `@CurrentTenant()` — nunca do body
- [ ] Responses sempre via View Model

### T-12 · Módulo
- [ ] `materias.module.ts` com todos os bindings domain → infra
- [ ] Exportar `GetMateriaByIdUseCase` para uso em outros módulos
- [ ] Registrar em `LegislativoModule`

---

## Fase 4 — Testes

### T-13 · Testes
- [ ] `get-materia-by-id.use-case.spec.ts` — NotFoundException, isolamento tenant
- [ ] `create-materia.use-case.spec.ts` — número sequencial, histórico criado, erro autor inválido
- [ ] `tramitar-materia.use-case.spec.ts` — transição válida, inválida (400 PT), não encontrado (404)
- [ ] `autor-resolver.service.spec.ts` — zero FKs → erro, duas FKs → erro, uma FK → ok

---

## Seed

### T-14 · TipoMateria
- [ ] Seed em `backend/prisma/seed.ts`:
  ```ts
  const tiposMateria = [
    { nome: 'Projeto de Lei Ordinária',        sigla: 'PLO',  ordem: 1 },
    { nome: 'Projeto de Lei Complementar',     sigla: 'PLC',  ordem: 2 },
    { nome: 'Projeto de Decreto Legislativo',  sigla: 'PDL',  ordem: 3 },
    { nome: 'Projeto de Resolução',            sigla: 'PR',   ordem: 4 },
    { nome: 'Requerimento Legislativo',        sigla: 'REQ',  ordem: 5 },
    { nome: 'Indicação',                       sigla: 'IND',  ordem: 6 },
    { nome: 'Projeto de Indicação de Lei',     sigla: 'PIL',  ordem: 7 },
    { nome: 'Projeto de Lei - Executivo',      sigla: 'PLOE', ordem: 8 },
    { nome: 'Moção',                           sigla: 'MOÇ',  ordem: 9 },
    { nome: 'Parecer',                         sigla: 'PAR',  ordem: 10 },
    { nome: 'Recurso',                         sigla: 'REC',  ordem: 11 },
    { nome: 'Substitutivo',                    sigla: 'SUB',  ordem: 12 },
    { nome: 'Sub-emenda',                      sigla: 'SUBE', ordem: 13 },
    { nome: 'Emenda à Lei Orgânica',           sigla: 'ELOM', ordem: 14 },
    { nome: 'Emenda',                          sigla: 'EMD',  ordem: 15 },
  ];
  ```

---

## Checklist
- [ ] `POST /legislative/materias` → identificação `PLO nº 1/2025`
- [ ] Tenant A não lê matérias do tenant B → 404
- [ ] Transição inválida → 400 em português
- [ ] `tramitacaoJson` nunca aparece no response
- [ ] Soft delete → some das listagens
- [ ] Histórico em ordem decrescente por `dataHora`
- [ ] Autor com 2 FKs → 400 em português
