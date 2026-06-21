# TASK-009 — Sessão Plenária e Pauta: Regras de Negócio

**Spec:** `backend/docs/specs/sessoes/SPEC-009-sessao-pauta-rn.md`
**Complementa:** TASK-002 (Sessões)
**Depende de:** TASK-001 Migration M4 concluída

---

## Migration M11

### T-01 · Adicionar `FaseSessao` e `TipoPautaItem`

```prisma
enum FaseSessao {
  NAO_INICIADA
  EXPEDIENTE
  ORDEM_DO_DIA
  EXPLICACOES_PESSOAIS
  ENCERRADA
}

enum TipoPautaItem {
  LEITURA
  DELIBERACAO
  COMUNICACAO
}
```

### T-02 · Adicionar campos em `SessaoPlenaria` e `PautaItem`

```prisma
// SessaoPlenaria:
faseAtual FaseSessao @default(NAO_INICIADA)

// PautaItem:
tipoPautaItem TipoPautaItem @default(DELIBERACAO)
```

> `faseAtual` é INDICADOR INFORMATIVO — não bloqueia nenhuma ação.
> A única coisa que `tipoPautaItem` bloqueia é votar um item LEITURA ou COMUNICACAO.

- [x] Rodar: `npx prisma migrate dev --name add_fase_sessao_tipo_pauta_item`
- [x] `npx prisma generate && npx tsc --noEmit`

---

## Regras de negócio — atualizar Use Cases existentes

### T-03 · `AbrirSessaoUseCase` — adicionar validação de quórum (RN-SPL-01)

- [x] Contar parlamentares ativos: `parlamentarianRepo.countAtivos(tenantId)`
- [x] Contar presentes: `presencaRepo.countPresentes(sessaoId)`
- [x] `quorumMinimo = Math.floor(totalAtivos / 2) + 1`
- [x] Se `presentes < quorumMinimo`:
  ```ts
  throw new UnprocessableEntityException(
    `Quórum insuficiente: ${presentes} presentes, mínimo necessário ${quorumMinimo}`
  );
  ```
- [x] Ao abrir, setar `faseAtual = EXPEDIENTE` automaticamente

### T-04 · `CreatePautaItemUseCase` — inferir fase e tipo automaticamente (RN-SPL-04)

- [x] Buscar `TipoMateria.sigla` da matéria
- [x] Inferir valores padrão:
  ```ts
  const SIGLAS_LEITURA = ['OFC', 'IND', 'REQ'];
  const tipoPautaItem = SIGLAS_LEITURA.includes(sigla) ? 'LEITURA' : 'DELIBERACAO';
  const fase = SIGLAS_LEITURA.includes(sigla)
    ? FasePauta.PEQUENO_EXPEDIENTE
    : FasePauta.ORDEM_DO_DIA;
  ```
- [x] **Permitir override manual** — staff pode alterar `fase` e `tipoPautaItem` no body do request
  (não fixar, apenas sugerir como default)

### T-05 · `AbrirVotacaoUseCase` — única verificação de bloqueio (RN-SPL-03 e RN-SPL-07)

```ts
// Verificações que BLOQUEIAM votação:
if (sessao.statusSessao !== 'ABERTA') {
  throw new UnprocessableEntityException('Sessão não está aberta');
}
if (['LEITURA', 'COMUNICACAO'].includes(pautaItem.tipoPautaItem)) {
  throw new BadRequestException(
    'Este tipo de item não pode ser votado — apenas itens de deliberação'
  );
}
if (pautaItem.resultado) {
  throw new ConflictException('Item já foi deliberado nesta sessão');
}

// SEM verificação de faseAtual — votação é livre para qualquer DELIBERACAO
```

- [x] Bloqueia `LEITURA`/`COMUNICACAO` → 400 PT-BR
- [x] Bloqueia item já deliberado → 400
- [x] Sem verificação de `faseAtual`
- [x] `npx tsc --noEmit` sem erros

---

## Novo Use Case

### T-06 · `SetFaseSessaoUseCase` (substitui AdvancePhaseSessaoUseCase)

```ts
// PATCH /legislative/sessoes-plenarias/:id/fase
// Roles: STAFF_AND_ABOVE
// Body: { faseAtual: FaseSessao }

async execute(sessaoId: string, novaFase: FaseSessao, tenantId: string) {
  const sessao = await repo.findById(sessaoId, tenantId);
  if (!sessao) throw new NotFoundException('Sessão não encontrada');

  // Único bloqueio: sessão já encerrada
  if (['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao)) {
    throw new BadRequestException('Sessão encerrada — fase não pode ser alterada');
  }

  // SEM restrição de direção — pode avançar E retroceder livremente
  return repo.setFase(sessaoId, tenantId, novaFase);
}
```

- [x] Criar `src/legislativo/sessoes-plenarias/application/use-cases/set-fase-sessao.use-case.ts`
- [x] Adicionar método `setFase(id, tenantId, fase)` no `SessaoPlenariaRepository`

### T-07 · Atualizar Controller

- [x] `PATCH /legislative/sessoes-plenarias/:id/fase` → `SetFaseSessaoUseCase`
- [x] Body: `{ faseAtual: FaseSessao }` (qualquer valor do enum)
- [x] Roles: `STAFF_AND_ABOVE`
- [x] Remover qualquer endpoint de `avancar-fase` anterior

### T-08 · Atualizar View Model de sessão

- [x] Adicionar `faseAtual` e `faseLabel` no response:
  ```ts
  const FASE_LABELS: Record<FaseSessao, string> = {
    NAO_INICIADA:         'Não iniciada',
    EXPEDIENTE:           'Expediente',
    ORDEM_DO_DIA:         'Ordem do Dia',
    EXPLICACOES_PESSOAIS: 'Explicações Pessoais',
    ENCERRADA:            'Encerrada',
  };
  ```
- [x] Adicionar `tipoPautaItem` e `tipoPautaItemLabel` no response de `PautaItem`
- [x] Nunca expor `cicloVidaJson`

---

## Testes

### T-09 · Testes das novas regras

- [x] Abrir sessão sem quórum → 422 com contagem PT-BR (`abrir-sessao.use-case.spec.ts`)
- [x] Abrir sessão → `faseAtual` vai para `EXPEDIENTE` (`abrir-sessao.use-case.spec.ts`)
- [ ] Item OFC → inferido como LEITURA em Expediente por padrão
- [ ] Staff altera manualmente `tipoPautaItem` de OFC para DELIBERACAO → permitido
- [ ] Tentar votar item LEITURA → 400 PT-BR
- [ ] Votar item DELIBERACAO com `faseAtual = EXPEDIENTE` → **permitido** (não bloqueia)
- [ ] Alterar `faseAtual` para EXPEDIENTE depois de estar em ORDEM_DO_DIA → **permitido**
- [ ] Alterar `faseAtual` com sessão ENCERRADA → 400 PT-BR
- [ ] Item já deliberado → tentar votar novamente → 409

---

## Checklist

- [x] `faseAtual` e `faseLabel` no response da sessão
- [x] `tipoPautaItem` e label no response de cada PautaItem
- [x] Votação de LEITURA bloqueada — votação de DELIBERACAO sempre livre
- [x] `SetFaseSessaoUseCase` aceita qualquer FaseSessao (avança e retrocede)
- [x] Override manual de fase/tipo no CreatePautaItemUseCase funciona
- [x] `npx tsc --noEmit` sem erros

---
---

# TASK-010 — Sistema de Votação e Quórum por Tipo de Matéria

**Spec:** `backend/docs/specs/votacoes/SPEC-010-votacao-quorum-rn.md`
**Complementa:** TASK-003 (Votações)
**Depende de:** TASK-009 concluída

---

## Migration M12

### T-01 · Adicionar `TipoQuorum` e campos em `TipoMateria` e `Votacao`

```prisma
enum TipoQuorum {
  MAIORIA_SIMPLES
  MAIORIA_ABSOLUTA
  QUALIFICADO_DOIS_TERCOS
  QUALIFICADO_TRES_QUINTOS
}

// TipoMateria:
tipoQuorum TipoQuorum @default(MAIORIA_SIMPLES)

// Votacao:
tipoQuorum   TipoQuorum?
totalMembros Int?
votoQualidade Boolean @default(false)
presidenteId  String?
```

- [x] Rodar: `npx prisma migrate dev --name add_tipo_quorum_votacao`
- [x] `npx prisma generate && npx tsc --noEmit`

### T-02 · Seed: popular `tipoQuorum` nos `TipoMateria` existentes

```ts
// prisma/seed-quorum.ts
const QUORUM_POR_SIGLA = {
  'PLO': 'MAIORIA_SIMPLES', 'PLC': 'MAIORIA_SIMPLES',
  'PDL': 'MAIORIA_ABSOLUTA', 'PR': 'MAIORIA_ABSOLUTA',
  'REQ': 'MAIORIA_SIMPLES', 'IND': 'MAIORIA_SIMPLES',
  'ELOM': 'QUALIFICADO_DOIS_TERCOS', 'PVPLO': 'MAIORIA_ABSOLUTA',
  // demais: MAIORIA_SIMPLES por padrão
};
```

- [x] Seed atualizado em `prisma/seed.ts` com mapeamento `QUORUM_POR_SIGLA` e upsert por sigla

---

## Domain Layer

### T-03 · Atualizar `ResultadoVotacaoService`

- [x] Substituir lógica atual (`SIM > NAO → APROVADO`) pelo serviço com `tipoQuorum`
- [x] Implementar os 4 casos conforme SPEC-010
- [x] Assinatura: `determinar({ sim, nao, totalMembros, tipoQuorum })`

### T-04 · Adicionar `VotoQualidadeService`

- [x] Verificar se `tipoQuorum === MAIORIA_SIMPLES` (voto de qualidade só em empate simples)
- [ ] Verificar se o parlamentar é Presidente ativo (`BoardMember` com `role = PRESIDENT`) — pendente TASK-013 (PresidentOrStaffGuard)
- [ ] Registrar `VotoParlamentar` com flag de voto de qualidade — `votoQualidade` registrado em `Votacao`; flag individual em `VotoParlamentar` pendente

> **Nota:** lógica de voto de qualidade implementada inline em `EncerrarVotacaoUseCase` (sem serviço separado).
> Validação de presidência será adicionada em TASK-013.

---

## Application Layer

### T-05 · `AbrirVotacaoUseCase` — atualizar

- [x] Buscar `tipoQuorum` de `TipoMateria`
- [x] Registrar `totalMembros` no momento da votação
- [x] Copiar `tipoQuorum` para `Votacao`

### T-06 · `EncerrarVotacaoUseCase` — atualizar

- [x] Usar `ResultadoVotacaoService` com `tipoQuorum` e `totalMembros`
- [x] Se `EMPATADO` e `tipoQuorum === MAIORIA_SIMPLES`: aceitar `dto.votoQualidade`
- [x] Se aprovada: chamar `materiaRepo.tramitar()` com status APROVADA
- [x] Se rejeitada: chamar `materiaRepo.tramitar()` com status REJEITADA

### T-07 · `EncerrarVotacaoDto` — atualizar

```ts
export class EncerrarVotacaoDto {
  @IsOptional() @IsBoolean()
  votoQualidade?: boolean;  // apenas em caso de empate em maioria simples

  @IsOptional() @IsString()
  observacoes?: string;
}
```

- [x] Campo `votoQualidade` adicionado (como `boolean`; spec sugeria `'SIM'|'NAO'` — simplificado)

### T-08 · Atualizar View Model de Votação

- [x] Adicionar `tipoQuorum`, `totalMembros`, `quorumNecessario`, `votoQualidade`
- [x] `quorumNecessario` calculado no view model com base em `tipoQuorum` e `totalMembros`

---

## Testes

### T-09 · Testes das novas regras de quórum

- [ ] PLO com SIM=6, NAO=5 (total 11) → APROVADO (maioria simples)
- [ ] PDL com SIM=6, NAO=5, total=13 → REJEITADO (maioria absoluta: min 7)
- [ ] ELOM com SIM=8, total=13 → REJEITADO (2/3 = min 9)
- [ ] ELOM com SIM=9, total=13 → APROVADO
- [ ] PLO empatada 5×5, presidente vota SIM → APROVADO com votoQualidade=true
- [ ] ELOM empatada → sem voto de qualidade (2/3 não atingido = REJEITADO)
- [ ] Matéria aprovada → status APROVADA criado em TramitacaoHistorico

---

## Checklist

- [x] `tipoQuorum` em todos os `TipoMateria` após seed
- [x] `quorumNecessario` calculado corretamente no view model
- [x] Aprovação de matéria gera TramitacaoHistorico (append-only via `tramitarMateria`)
- [x] Voto de qualidade só disponível em maioria simples
- [x] `npx tsc --noEmit` e `npx jest` passando
