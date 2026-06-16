# SPEC-003 — Votações

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/votacoes/`
**API prefix:** `/api/legislative/votacoes`
**Depende de:** TASK-001 Migration M5

---

## Background

O modelo de `Votacao` tem dois problemas críticos:
1. `VotoParlamentar` aponta para `Parlamentar` (legado PT), não `Parliamentarian` (novo EN) — quando a migração de parlamentares for concluída, todos os votos ficam órfãos
2. Os contadores `votosSim`, `votosNao`, `abstencoes` são campos manuais que podem divergir do count real de `VotoParlamentar`

---

## O que JÁ EXISTE no schema (não recriar)

```prisma
model Votacao {
  id · pautaItemId (unique) · tipoVotacao · exigePresenca
  votosSim Int    // PROBLEMA: manual, pode divergir
  votosNao Int    // PROBLEMA: manual, pode divergir
  abstencoes Int  // PROBLEMA: manual, pode divergir
  resultado ResultadoVotacao? // APROVADO | REJEITADO | EMPATADO
  realizadaAt DateTime?
  createdAt
  votos VotoParlamentar[]
}

model VotoParlamentar {
  id · votacaoId · parlamentarId → Parlamentar  // PROBLEMA: legado
  voto Voto  // SIM | NAO | ABSTENCAO | PRESENTE
}

enum TipoVotacao     { NOMINAL SIMBOLICA SECRETA }
enum ResultadoVotacao{ APROVADO REJEITADO EMPATADO }
enum Voto            { SIM NAO ABSTENCAO PRESENTE }
```

## O que as migrations criam (ver TASK-001 Migration M5)

```prisma
// Campos adicionados em Votacao
encerradaAt       DateTime?
responsavelId     String?    // TenantUser que encerrou
quorumVotacao     Int?       // total de parlamentares no momento da votação
motivoEmpate      String?    // explicação opcional quando EMPATADO
observacoes       String?

// Campo adicionado em VotoParlamentar (migração dual — legado + novo)
parliamentarianId String?    // FK para Parliamentarian (novo EN)
// parlamentarId continua existindo para compatibilidade legado
// Durante transição: pelo menos uma das duas FKs deve estar preenchida
```

---

## Estrutura de arquivos

```
src/legislativo/votacoes/
├── votacoes.module.ts
├── application/
│   ├── controllers/votacoes.controller.ts
│   ├── dto/
│   │   ├── abrir-votacao.dto.ts
│   │   ├── registrar-voto.dto.ts
│   │   ├── encerrar-votacao.dto.ts
│   │   └── list-votacoes-query.dto.ts
│   ├── use-cases/
│   │   ├── abrir-votacao.use-case.ts
│   │   ├── registrar-voto.use-case.ts
│   │   ├── encerrar-votacao.use-case.ts
│   │   ├── get-votacao-by-id.use-case.ts
│   │   └── list-votacoes.use-case.ts
│   └── view-models/
│       ├── votacao.view-model.ts
│       └── voto-parlamentar.view-model.ts
├── domain/
│   ├── entities/
│   │   ├── votacao.entity.ts
│   │   └── voto-parlamentar.entity.ts
│   ├── repositories/
│   │   └── votacao.repository.ts
│   └── services/
│       ├── contagem-votos.service.ts   ← calcula votosSim/Nao/abstencoes via query
│       └── resultado-votacao.service.ts ← determina APROVADO/REJEITADO/EMPATADO
└── infra/
    └── prisma/
        ├── prisma-votacao.repository.ts
        └── mappers/
            └── votacao.mapper.ts
```

---

## Regras de domínio

### Ciclo de vida da votação

```
[PautaItem em ORDEM_DO_DIA] → abrir votação → votos individuais → encerrar
```

**AbrirVotacaoUseCase:**
1. Verificar que `PautaItem` está em fase `ORDEM_DO_DIA`
2. Verificar que `SessaoPlenaria.statusSessao === ABERTA`
3. Verificar quórum (via `QuorumService` do módulo sessoes)
4. Criar `Votacao` com `realizadaAt = now()` e `quorumVotacao = count presentes`
5. Para votação NOMINAL: aguardar votos individuais
6. Para votação SIMBÓLICA: resultado imediato (sem votos individuais)

**RegistrarVotoUseCase:**
- Verificar que votação não está encerrada
- Verificar que parlamentar está presente na sessão
- Upsert: se já votou, atualiza o voto (permitido até encerrar)
- Nunca inserir diretamente `votosSim/Nao/abstencoes` — são calculados

**EncerrarVotacaoUseCase:**
1. Calcular contadores via `ContagemVotosService.calcular(votacaoId)`:
   ```ts
   const contagem = await prisma.votoParlamentar.groupBy({
     by: ['voto'],
     where: { votacaoId },
     _count: { voto: true }
   });
   ```
2. Gravar resultado calculado em `votosSim`, `votosNao`, `abstencoes`
3. Determinar `ResultadoVotacao` via `ResultadoVotacaoService`
4. Setar `encerradaAt = now()` + `responsavelId`
5. Atualizar `PautaItem.resultado` correspondente

### Resultado (em `ResultadoVotacaoService`)
- `votosSim > votosNao` → APROVADO
- `votosNao > votosSim` → REJEITADO
- `votosSim === votosNao` → EMPATADO (presidente tem voto de minerva — implementar futuramente)

### Voto de qualidade (Minerva)
Não implementar agora. Registrar como TODO: "Presidente da mesa tem voto de qualidade em caso de empate — requer integração com BoardMember."

---

## Endpoints

| Método | Rota | Use Case |
|--------|------|----------|
| GET | `/legislative/votacoes` | ListVotacoesUseCase |
| GET | `/legislative/votacoes/:id` | GetVotacaoByIdUseCase |
| POST | `/legislative/votacoes` | AbrirVotacaoUseCase |
| POST | `/legislative/votacoes/:id/votos` | RegistrarVotoUseCase |
| POST | `/legislative/votacoes/:id/encerrar` | EncerrarVotacaoUseCase |
| GET | `/legislative/votacoes/:id/votos` | GetVotacaoByIdUseCase |

---

## View Model

**Votação:** `id · pautaItemId · tipoVotacao · resultado · votosSim · votosNao · abstencoes · realizadaAt · encerradaAt · quorumVotacao`
**Voto individual (apenas votação NOMINAL):** `parlamentarNome · voto` — nunca expor em votação SECRETA
**Nunca expor:** `tenantId · responsavelId`

---

## Gathering Results

- [ ] Votos são contados via `groupBy`, nunca inseridos manualmente
- [ ] `votosSim + votosNao + abstencoes === count(VotoParlamentar)` sempre
- [ ] Votação SECRETA não expõe votos individuais no response
- [ ] Não é possível votar após `encerradaAt`
- [ ] Não é possível abrir votação sem sessão ABERTA → 422
- [ ] Resultado calculado corretamente: SIM > NAO → APROVADO
