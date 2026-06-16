# TASK-003 — Submódulo: Votações

**Spec:** `backend/docs/specs/votacoes/SPEC-003-votacoes.md`
**Depende de:** TASK-001 M5 + TASK-002 concluída (usa QuorumService)
**Módulo:** `src/legislativo/votacoes/`

---

## Fase 1 — Domain Layer

### T-01 · Entities
- [ ] `domain/entities/votacao.entity.ts`
  - Campos: `id · pautaItemId · tipoVotacao · resultado · realizadaAt · encerradaAt · quorumVotacao`
  - Método: `estaEncerrada(): boolean`
  - Método: `aceitaVotosIndividuais(): boolean` — false se SIMBOLICA ou encerrada
  - **Getters calculados** (não armazenados): `totalVotos: number`
  - **Zero imports de infra**
- [ ] `domain/entities/voto-parlamentar.entity.ts`

### T-02 · Repository contract
- [ ] `domain/repositories/votacao.repository.ts`
  - `findById(id, tenantId)`, `create`, `save`
  - `calcularContagem(votacaoId): Promise<{sim: number, nao: number, abstencao: number}>`
    - Implementar via `prisma.votoParlamentar.groupBy`
  - `encerrar(id, dados): Promise<void>` ← transaction interna

### T-03 · Domain services
- [ ] `domain/services/contagem-votos.service.ts`
  - `calcular(votacaoId)`: chama `votacaoRepo.calcularContagem()` — **nunca usa contadores manuais**
- [ ] `domain/services/resultado-votacao.service.ts`
  - `determinar(sim, nao): ResultadoVotacao`
  - `SIM > NAO → APROVADO · NAO > SIM → REJEITADO · SIM === NAO → EMPATADO`

---

## Fase 2 — Infra Layer

### T-04 · Prisma repository
- [ ] `infra/prisma/prisma-votacao.repository.ts`
  - `calcularContagem`: usa `prisma.votoParlamentar.groupBy({ by: ['voto'], where: { votacaoId }, _count: true })`
  - `encerrar`: `prisma.$transaction([update votacao + update pautaItem.resultado])`
  - **Nunca inserir votosSim/Nao/abstencoes manualmente — sempre via calcularContagem()**

---

## Fase 3 — Application Layer

### T-05 · DTOs e Use Cases
- [ ] `abrir-votacao.dto.ts` — `pautaItemId · tipoVotacao · exigePresenca?`
- [ ] `registrar-voto.dto.ts` — `parliamentarianId | parlamentarId · voto`
- [ ] `encerrar-votacao.dto.ts` — `motivoEmpate? · observacoes?`

- [ ] `abrir-votacao.use-case.ts`
  - Verificar `SessaoPlenaria.estaAberta()` via `GetSessaoByIdUseCase` (importar do sessoes module)
  - Verificar `PautaItem.fase === ORDEM_DO_DIA`
  - Verificar quórum via `QuorumService`
  - Criar `Votacao`

- [ ] `registrar-voto.use-case.ts`
  - Verificar `votacao.aceitaVotosIndividuais()`
  - Verificar parlamentar presente via `PresencaSessao`
  - Upsert do voto (permite alterar até encerrar)
  - **Não recalcular contadores aqui** — só no encerramento

- [ ] `encerrar-votacao.use-case.ts`
  - Calcular contagem via `ContagemVotosService.calcular()`
  - Determinar resultado via `ResultadoVotacaoService.determinar()`
  - Chamar `votacaoRepo.encerrar()` com dados calculados

- [ ] `get-votacao-by-id.use-case.ts`
  - Para SECRETA: retornar votos agregados sem identificar parlamentar
  - Para NOMINAL: retornar votos individuais com nome

### T-06 · View Model
- [ ] `votacao.view-model.ts`
  - `toHttp(votacao, tipoVotacao)`: se SECRETA, omitir votos individuais
  - Calcular `votosSim · votosNao · abstencoes` do array de votos (não dos campos)

### T-07 · Controller + Módulo
- [ ] `controllers/votacoes.controller.ts`
- [ ] `votacoes.module.ts` — importa `SessoesPlenariasModule` para usar `GetSessaoByIdUseCase`

---

## Checklist
- [ ] `votosSim + votosNao + abstencoes === count(VotoParlamentar)` em todos os casos
- [ ] Votação SECRETA não expõe votos individuais
- [ ] Voto após encerramento → 409 em português
- [ ] Abertura sem quórum → 422 em português
- [ ] Resultado calculado: SIM=3 NAO=2 → APROVADO

---
---

# TASK-004 — Submódulo: Agenda Legislativa

**Spec:** `backend/docs/specs/agenda/SPEC-004-agenda.md`
**Depende de:** TASK-001 M6
**Módulo:** `src/legislativo/agenda-legislativa/`

---

## Fase 1 — Domain Layer

### T-01 · Entity
- [ ] `domain/entities/agenda-evento.entity.ts`
  - Campos: `id · tenantId · tipo · titulo · dataInicio · dataFim · local · publicoExterno · sessaoPlenariaId?`
  - Método: `temRecorrencia(): boolean`
  - Método: `eOcorrencia(): boolean` (recorrenciaPaiId != null)

### T-02 · Repository + Service
- [ ] `domain/repositories/agenda-legislativa.repository.ts`
- [ ] `domain/services/recorrencia.service.ts`
  - `gerarOcorrencias(evento, ate: Date): AgendaEvento[]`
  - Parsear `evento.recorrencia` (ICAL RRULE) e gerar instâncias
  - Usar biblioteca `rrule` (`npm install rrule`)

---

## Fase 2 — Application Layer

### T-03 · DTOs
- [ ] `create-evento.dto.ts` — `tipo · titulo · dataInicio · dataFim? · local? · sessaoPlenariaId? · publicoExterno? · recorrencia?`
- [ ] `list-agenda-query.dto.ts` — `de · ate · tipo? · publicoExterno?`

### T-04 · Use Cases
- [ ] `create-evento.use-case.ts`
  - Se `recorrencia` preenchida: criar evento pai + chamar `RecorrenciaService.gerarOcorrencias()`
- [ ] `list-agenda.use-case.ts` — filtro por período `de/ate`
- [ ] `get-evento-by-id.use-case.ts`
- [ ] `vincular-sessao.use-case.ts` — seta `sessaoPlenariaId` e sincroniza `dataInicio`

### T-05 · View Model
- [ ] `evento.view-model.ts` — nunca expor `tenantId · isRemoved`
- [ ] Endpoint público: omitir eventos com `publicoExterno: false`

### T-06 · Controller + Módulo
- [ ] `controllers/agenda-legislativa.controller.ts`
  - Rota pública `GET /public/agenda` sem guard
  - Demais rotas com `@UseGuards(JwtAuthGuard, TenantGuard)`
- [ ] `agenda-legislativa.module.ts`

---

## Checklist
- [ ] Evento vinculado a sessão aparece com dados da sessão no response
- [ ] Recorrência cria eventos filhos com `recorrenciaPaiId`
- [ ] `/public/agenda` não requer auth e filtra `publicoExterno: true`
- [ ] `local` aparece no response

---
---

# TASK-005 — Normas Jurídicas e Atos Administrativos

**Spec:** `backend/docs/specs/normas/SPEC-005-normas.md`
**Depende de:** TASK-001 M7
**Módulos:** `src/controle-juridico/normas/` · `src/atos-administrativos/`

---

## Fase 1 — Domain Layer (Normas)

### T-01 · Enum derivado (não armazenado)
- [ ] `domain/enums/status-norma.enum.ts`
  ```ts
  // Calculado em runtime, nunca armazenado no banco
  export enum StatusNorma {
    EM_TRAMITE = 'EM_TRAMITE',
    SANCIONADA = 'SANCIONADA',
    VETADA = 'VETADA',
    PROMULGADA = 'PROMULGADA',
    PUBLICADA = 'PUBLICADA',
    VIGENTE = 'VIGENTE',
    REVOGADA = 'REVOGADA',
  }
  ```

### T-02 · Entity
- [ ] `domain/entities/norma.entity.ts`
  - Campos: todos os de `Norma` no schema
  - Getter `get statusDerived(): StatusNorma`
    ```ts
    get statusDerived(): StatusNorma {
      const now = new Date();
      if (this.dataRevogacao && this.dataRevogacao <= now) return StatusNorma.REVOGADA;
      if (this.dataVigencia && this.dataVigencia <= now) return StatusNorma.VIGENTE;
      if (this.dataPublicacao) return StatusNorma.PUBLICADA;
      if (this.dataPromulgacao) return StatusNorma.PROMULGADA;
      if (this.dataVeto) return StatusNorma.VETADA;
      if (this.dataSancao) return StatusNorma.SANCIONADA;
      return StatusNorma.EM_TRAMITE;
    }
    ```

### T-03 · Repository + Services
- [ ] `domain/repositories/norma.repository.ts`
- [ ] `domain/services/ciclo-juridico.service.ts`
  - `registrarSancao(id, data, tenantId, userId): Promise<void>`
  - `registrarVeto(id, data, tipo, motivo, tenantId, userId): Promise<void>`
  - `registrarPromulgacao(id, data, tenantId, userId): Promise<void>`
  - `registrarPublicacao(id, data, veiculo, tenantId, userId): Promise<void>`
  - `revogar(id, normaRevoganteId, dataRevogacao, tenantId): Promise<void>`

---

## Fase 2 — Application Layer (Normas)

### T-04 · DTOs
- [ ] `create-norma.dto.ts` — `tipoId · numero · anoId? · esferaFederacaoId? · ementa · materiaOrigemId?`
- [ ] `registrar-sancao.dto.ts` — `dataSancao`
- [ ] `registrar-veto.dto.ts` — `dataVeto · tipoVeto ('TOTAL'|'PARCIAL') · motivoVeto?`
- [ ] `registrar-promulgacao.dto.ts` — `dataPromulgacao`
- [ ] `registrar-publicacao.dto.ts` — `dataPublicacao · veiculo · urlExterna? · textoUrl?`
- [ ] `revogar-norma.dto.ts` — `normaRevoganteId · dataRevogacao`

### T-05 · Use Cases
- [ ] `create-norma.use-case.ts`
- [ ] `list-normas.use-case.ts` — filtros: `statusDerived · tipo · ano · esfera`
- [ ] `get-norma-by-id.use-case.ts`
- [ ] `registrar-sancao.use-case.ts` → delega a `CicloJuridicoService`
- [ ] `registrar-veto.use-case.ts`
- [ ] `registrar-promulgacao.use-case.ts`
- [ ] `registrar-publicacao.use-case.ts` — também cria `PublicacaoOficial`
- [ ] `revogar-norma.use-case.ts`

### T-06 · View Model
- [ ] `norma.view-model.ts`
  - Inclui `statusDerived` calculado via getter
  - Detalhe inclui: `dataSancao · dataVeto · dataPromulgacao · dataPublicacao · dataVigencia · dataRevogacao`
  - Nunca expor `tenantId · isRemoved`

### T-07 · Controller + Módulo (Normas)
- [ ] `controllers/normas.controller.ts` — todos os endpoints da SPEC-005
- [ ] Rota pública `GET /public/normas` sem guard
- [ ] `normas.module.ts`

---

## Fase 3 — Atos Administrativos

### T-08 · Implementação após M7
- [ ] Aguardar migration M7 (`tenantId` em `Ato`)
- [ ] Criar `src/atos-administrativos/` com estrutura DDD padrão
- [ ] `create-ato.use-case.ts`, `list-atos.use-case.ts`, `get-ato-by-id.use-case.ts`
- [ ] Todo `findMany` filtra `{ tenantId, isRemoved: false }`

---

## Checklist — Normas
- [ ] `statusDerived` calculado corretamente via getter na entity
- [ ] `VIGENTE` para norma com `dataVigencia <= now()`
- [ ] `REVOGADA` para norma com `dataRevogacao <= now()`
- [ ] `GET /public/normas` sem autenticação — filtra por tenant via subdomínio ou parâmetro
- [ ] Tenant A não acessa normas do tenant B → 404

## Checklist — Atos
- [ ] `Ato` sem `tenantId` retorna erro 500 antes da migration → documentar
- [ ] Após M7: `findMany` sempre filtra `tenantId`
