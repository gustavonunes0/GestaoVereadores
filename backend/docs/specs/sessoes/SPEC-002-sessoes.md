# SPEC-002 — Sessões Plenárias

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/sessoes-plenarias/`
**API prefix:** `/api/legislative/sessoes-plenarias`
**Depende de:** TASK-001 Migration M4 (StatusSessao enum + campos de transição)

---

## Background

O modelo atual de `SessaoPlenaria` tem dois problemas estruturais:
1. `cicloVidaJson Json?` guarda o ciclo de vida como JSON livre — não há estado estruturado nem timestamps de transição auditáveis
2. Não há verificação de quórum antes de abertura de votação
3. `PautaItem` não tem status próprio nem data de publicação

Sistemas de referência (SAPL, e-Câmara, SIGPOL) modelam o ciclo de vida da sessão com estados explícitos e timestamps por transição.

---

## O que JÁ EXISTE no schema (não recriar)

```prisma
model SessaoPlenaria {
  id · tenantId · sessaoLegislativaId? · dataInicio · dataFim?
  tipoSessaoId → TipoSessao
  situacaoId   → SituacaoSessao      // lookup legado
  cicloVidaJson Json?                 // LEGADO — não usar em código novo
  isRemoved · createdAt · updatedAt
  mesasDiretoras · pautaItens · presencas
}

model PautaItem {
  id · sessaoId · materiaId · ordem
  fase      FasePauta       // PEQUENO_EXPEDIENTE | GRANDE_EXPEDIENTE | ORDEM_DO_DIA | EXPLICACOES_PESSOAIS
  resultado ResultadoPauta? // APROVADO | REJEITADO | RETIRADO | ADIADO
  isRemoved · createdAt · updatedAt
  votacao   Votacao?
}

model PresencaSessao {
  id · sessaoId · parlamentarId · presente · situacao · justificativa
}

model TipoSessao {
  id · tenantId · nome · codigo CodigoTipoSessao? · requerQuorum Boolean
}

// Enums já existentes
enum CodigoSituacaoSessao { AGENDADA EM_ANDAMENTO ENCERRADA CANCELADA }
enum CodigoTipoSessao     { ORDINARIA EXTRAORDINARIA SOLENE ESPECIAL }
enum FasePauta            { PEQUENO_EXPEDIENTE GRANDE_EXPEDIENTE ORDEM_DO_DIA EXPLICACOES_PESSOAIS }
enum ResultadoPauta       { APROVADO REJEITADO RETIRADO ADIADO }
enum SituacaoPresenca     { PRESENTE AUSENTE JUSTIFICADO }
```

## O que as migrations criam (ver TASK-001 Migration M4)

```prisma
// Novo enum
enum StatusSessao {
  AGENDADA
  ABERTA
  SUSPENSA
  ENCERRADA
  CANCELADA
}

// Novo enum
enum StatusPautaItem {
  RASCUNHO
  PUBLICADA
  ENCERRADA
}

// Campos adicionados em SessaoPlenaria
statusSessao     StatusSessao @default(AGENDADA)
dataAbertura     DateTime?    // timestamp quando AGENDADA → ABERTA
dataEncerramento DateTime?    // timestamp quando → ENCERRADA
dataSuspensao    DateTime?    // timestamp quando → SUSPENSA
quorumMinimo     Int?         // calculado de TipoSessao.requerQuorum + total parlamentares
responsavelAberturaId String? // TenantUser que abriu
observacoes      String?

// Campos adicionados em PautaItem
statusPauta  StatusPautaItem @default(RASCUNHO)
publicadaEm  DateTime?       // quando publicadaEm != null → pauta publicada
ordemDia     Int?            // posição na Ordem do Dia especificamente
```

---

## Estrutura de arquivos do submódulo

```
src/legislativo/sessoes-plenarias/
├── sessoes-plenarias.module.ts
├── application/
│   ├── controllers/sessoes-plenarias.controller.ts
│   ├── dto/
│   │   ├── create-sessao.dto.ts
│   │   ├── update-sessao.dto.ts
│   │   ├── abrir-sessao.dto.ts
│   │   ├── encerrar-sessao.dto.ts
│   │   ├── suspender-sessao.dto.ts
│   │   ├── add-pauta-item.dto.ts
│   │   ├── publicar-pauta.dto.ts
│   │   ├── registrar-presenca.dto.ts
│   │   └── list-sessoes-query.dto.ts
│   ├── use-cases/
│   │   ├── create-sessao.use-case.ts
│   │   ├── list-sessoes.use-case.ts
│   │   ├── get-sessao-by-id.use-case.ts
│   │   ├── abrir-sessao.use-case.ts
│   │   ├── suspender-sessao.use-case.ts
│   │   ├── encerrar-sessao.use-case.ts
│   │   ├── cancelar-sessao.use-case.ts
│   │   ├── add-pauta-item.use-case.ts
│   │   ├── reordenar-pauta.use-case.ts
│   │   ├── publicar-pauta.use-case.ts
│   │   ├── registrar-presenca.use-case.ts
│   │   └── calcular-quorum.use-case.ts
│   └── view-models/
│       ├── sessao.view-model.ts
│       ├── pauta-item.view-model.ts
│       └── presenca.view-model.ts
├── domain/
│   ├── entities/
│   │   ├── sessao-plenaria.entity.ts
│   │   └── pauta-item.entity.ts
│   ├── enums/
│   │   ├── status-sessao.enum.ts
│   │   └── status-pauta-item.enum.ts
│   ├── repositories/
│   │   ├── sessao-plenaria.repository.ts
│   │   └── pauta-item.repository.ts
│   └── services/
│       ├── ciclo-vida-sessao.service.ts  ← orquestra transições de estado
│       └── quorum.service.ts              ← calcula e verifica quórum
└── infra/
    └── prisma/
        ├── prisma-sessao-plenaria.repository.ts
        ├── prisma-pauta-item.repository.ts
        └── mappers/
            ├── sessao-plenaria.mapper.ts
            └── pauta-item.mapper.ts
```

---

## Regras de domínio

### Ciclo de vida da sessão (em `SessaoPlenaria.podeTransicionarPara()`)

```
AGENDADA → ABERTA | CANCELADA
ABERTA   → SUSPENSA | ENCERRADA
SUSPENSA → ABERTA | ENCERRADA
```

Toda transição:
1. Valida estado atual via `podeTransicionarPara()`
2. Registra timestamp específico (`dataAbertura`, `dataSuspensao`, `dataEncerramento`)
3. Registra `responsavelAberturaId` (quem abriu/encerrou)
4. Usa transaction Prisma (update status + timestamp)

### Quórum
- `QuorumService.calcularQuorumMinimo(sessaoId)`: conta parlamentares ativos do tenant
- `QuorumService.verificarQuorum(sessaoId)`: conta presenças PRESENTE
- `AbrirSessaoUseCase` registra quórum no momento de abertura
- `TramitarMateriaUseCase` (votação) verifica quórum antes de abrir votação

### Pauta
- Pauta só pode ser publicada quando `sessao.statusSessao === AGENDADA`
- Após publicada (`publicadaEm != null`), itens não podem ser removidos — apenas adicionados com aviso
- Pauta encerrada (`StatusPautaItem.ENCERRADA`) quando sessão encerra
- `ordem` é sequencial dentro de cada `fase`

### Presença
- `PresencaSessao` só pode ser registrada quando `sessao.statusSessao === ABERTA`
- `JUSTIFICADO` requer `justificativa` preenchida

---

## Endpoints

| Método | Rota | Use Case |
|--------|------|----------|
| GET | `/legislative/sessoes-plenarias` | ListSessoesUseCase |
| GET | `/legislative/sessoes-plenarias/:id` | GetSessaoByIdUseCase |
| POST | `/legislative/sessoes-plenarias` | CreateSessaoUseCase |
| PATCH | `/legislative/sessoes-plenarias/:id` | UpdateSessaoUseCase |
| POST | `/legislative/sessoes-plenarias/:id/abrir` | AbrirSessaoUseCase |
| POST | `/legislative/sessoes-plenarias/:id/suspender` | SuspenderSessaoUseCase |
| POST | `/legislative/sessoes-plenarias/:id/encerrar` | EncerrarSessaoUseCase |
| POST | `/legislative/sessoes-plenarias/:id/cancelar` | CancelarSessaoUseCase |
| GET | `/legislative/sessoes-plenarias/:id/quorum` | CalcularQuorumUseCase |
| GET | `/legislative/sessoes-plenarias/:id/pauta` | GetSessaoByIdUseCase |
| POST | `/legislative/sessoes-plenarias/:id/pauta` | AddPautaItemUseCase |
| PATCH | `/legislative/sessoes-plenarias/:id/pauta/publicar` | PublicarPautaUseCase |
| POST | `/legislative/sessoes-plenarias/:id/pauta/reordenar` | ReordenarPautaUseCase |
| GET | `/legislative/sessoes-plenarias/:id/presencas` | GetSessaoByIdUseCase |
| POST | `/legislative/sessoes-plenarias/:id/presencas` | RegistrarPresencaUseCase |

---

## View Model — campos expostos

**Sessão resumo:** `id · tipoSessao · statusSessao · dataInicio · dataAbertura · dataEncerramento · quorumPresente`
**Sessão detalhe:** resumo + `pauta · presencas · sessaoLegislativa`
**Pauta item:** `id · materia(id+identificacao+ementa) · fase · ordem · resultado · statusPauta · publicadaEm`
**Nunca expor:** `tenantId · isRemoved · cicloVidaJson`

---

## Gathering Results

- [ ] `POST /sessoes-plenarias/:id/abrir` registra `dataAbertura` e `quorumPresente`
- [ ] Não é possível abrir votação sem quórum mínimo → 422 com mensagem
- [ ] Transição inválida (ex: ENCERRADA → ABERTA) → 400 em português
- [ ] Pauta publicada não permite remoção de itens → 409
- [ ] Presença só pode ser registrada com sessão ABERTA → 422
- [ ] `cicloVidaJson` nunca aparece no response
