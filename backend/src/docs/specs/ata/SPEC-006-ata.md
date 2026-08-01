# SPEC-006 — Ata da Sessão

**Status:** Aprovada | **Versão:** 1.0
**Submódulo novo:** `src/legislativo/sessoes-plenarias/ata/`
**API prefix:** `/api/legislative/sessoes-plenarias/:id/ata`
**Depende de:** TASK-008 (SessaoHistorico) recomendado para o evento `ATA_GERADA`/`ATA_APROVADA`, não bloqueante para o CRUD básico
**Prioridade:** P0 — maior gap de feature-parity identificado contra o IntGest
**Decisão relacionada:** ADR-010

---

## Background

`relatorio_sessao.md` mapeia "Ata" como item de menu próprio da sessão no IntGest
(`/sessao/192/atasessao`, autenticado, "Editor de ata da sessão"). Confirmado por busca exaustiva:
**não existe nenhuma forma de Ata hoje** no GestaoVereadores — nenhum model, nenhuma tela, nenhum
endpoint (zero hits para `Ata`/`ata-sessao`/`gerar-ata` em `backend/src`).

`Fluxo_Sessao_Pauta_Votacao_REVISADO.md` (seção 2.3) já tinha identificado essa lacuna a partir de
vídeos do sistema em uso: existe um componente "Controle de Atas" que lista a sessão anterior com
status "VOTAÇÃO ENCERRADA" e botão "Selecionar" — ou seja, a leitura/discussão da Ata da sessão
anterior (passo 3 do Expediente) referencia um documento já existente, não texto livre digitado na
hora.

## O que já existe no schema e pode ser reaproveitado (não recriar)

Tudo que uma Ata precisa consolidar já está modelado:
- `SessaoPlenaria` (statusSessao, dataAbertura, dataEncerramento, faseAtual)
- `PautaItem` + `Materia` (o que entrou em pauta, com `resultado`)
- `Votacao` + `VotoParlamentar` (como cada matéria foi votada)
- `PresencaSessao` (quem estava presente, com `situacao`)
- `MesaDiretora`/`Board` (composição da mesa na sessão)
- `PedidoPalavra` (quem usou da palavra)

A Ata **não duplica** esses dados — ela é um documento gerado a partir deles, editável antes da
aprovação.

## Novo model

```prisma
enum StatusAta {
  RASCUNHO
  APROVADA
  PUBLICADA
}

model Ata {
  id                   String     @id @default(uuid())
  tenantId             String
  tenant               Tenant     @relation(fields: [tenantId], references: [id])
  sessaoPlenariaId     String     @unique
  sessaoPlenaria       SessaoPlenaria @relation(fields: [sessaoPlenariaId], references: [id])
  status               StatusAta  @default(RASCUNHO)
  conteudo             String     @db.Text   // HTML — editor rich text no frontend
  geradaAutomaticamente Boolean   @default(true)
  aprovadaEm           DateTime?
  aprovadaPorId        String?
  aprovadaPor          TenantUser? @relation(fields: [aprovadaPorId], references: [id])
  pdfUrl               String?     // preenchido após geração via Puppeteer (SPEC-007/ADR-012)
  isRemoved            Boolean    @default(false)
  removedAt            DateTime?
  createdAt            DateTime   @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("atas")
}
```

> Adicionar relação inversa em `SessaoPlenaria`: `ata Ata?`
> Adicionar relação inversa em `Tenant`: `atas Ata[]`

### Referência da Ata anterior na pauta da sessão atual

Para cobrir o passo "Leitura e discussão da Ata da sessão anterior" (Expediente, sub-passo 3):
adicionar campo opcional em `PautaItem`:

```prisma
// Em PautaItem, junto dos demais campos opcionais de categoria:
ataReferenciadaId String?
ataReferenciada   Ata?    @relation(fields: [ataReferenciadaId], references: [id])
```

Quando um `PautaItem` de `categoria: AVISO` (ou uma categoria nova `ATA`, decidir na
implementação conforme o que for mais simples de filtrar no front) tem `ataReferenciadaId`
preenchido, o frontend exibe o conteúdo da Ata referenciada em vez de `avisoTexto` livre.

## Estrutura de arquivos do submódulo

```
src/legislativo/sessoes-plenarias/ata/
├── application/
│   ├── controllers/ata.controller.ts        ← ou rotas dentro de sessoes.controller.ts, ver T-09 da task
│   ├── dto/
│   │   ├── gerar-rascunho-ata.dto.ts
│   │   ├── update-ata.dto.ts
│   │   └── aprovar-ata.dto.ts
│   ├── use-cases/
│   │   ├── gerar-rascunho-ata.use-case.ts
│   │   ├── get-ata-by-sessao.use-case.ts
│   │   ├── update-ata.use-case.ts
│   │   └── aprovar-ata.use-case.ts
│   └── view-models/ata.view-model.ts
├── domain/
│   ├── entities/ata.entity.ts
│   ├── enums/status-ata.enum.ts
│   ├── repositories/ata.repository.ts       ← abstract class
│   └── services/
│       └── ata-template.service.ts           ← monta o HTML do rascunho a partir dos dados da sessão
└── infra/prisma/
    ├── prisma-ata.repository.ts
    └── mappers/ata.mapper.ts
```

## Regras de domínio

- Ata só pode ser gerada (`GerarRascunhoAtaUseCase`) quando `sessao.statusSessao === ENCERRADA`.
  Tentar gerar antes disso → 422 (`AtaSessaoNaoEncerradaError`, mensagem em pt-BR).
- `GerarRascunhoAtaUseCase` é idempotente-defensivo: se já existe `Ata` para a sessão, retorna erro
  409 (`AtaJaExisteError`) — regeneração teria que ser uma ação explícita separada
  (`RegenerarRascunhoAtaUseCase`, fora do escopo desta spec, adicionar só se o time pedir).
- `AtaTemplateService.montar(sessao)` monta o HTML inicial: identificação da sessão (tipo, data,
  presidente), composição da mesa diretora, lista de presença com partido, matérias da pauta com
  resultado, resumo de cada votação (votos sim/não/abstenção). Texto gerado é só o **ponto de
  partida** — `conteudo` é editável livremente depois via `UpdateAtaUseCase`.
- `UpdateAtaUseCase` só é permitido enquanto `status === RASCUNHO`. Ata `APROVADA`/`PUBLICADA` é
  imutável — qualquer correção depois de aprovada precisa de um fluxo de retificação (fora de
  escopo aqui — mesma lógica que `PublicacaoOficial`/`Norma` já tratam retificação como nova
  versão, seguir o mesmo princípio se isso for pedido depois).
- `AprovarAtaUseCase`: `status: RASCUNHO → APROVADA`, grava `aprovadaEm`/`aprovadaPorId`. Exportar
  PDF (SPEC-007/ADR-012) pode acontecer nesse momento ou sob demanda via endpoint próprio —
  decidir na implementação, não é bloqueante para o fluxo de aprovação em si.
- Ao aprovar, gravar evento `ATA_APROVADA` no `SessaoHistorico` (TASK-008).

## Endpoints

| Método | Rota | Guard | Use case |
|---|---|---|---|
| GET | `/legislative/sessoes-plenarias/:id/ata` | `STAFF_AND_ABOVE` | `GetAtaBySessaoUseCase` |
| POST | `/legislative/sessoes-plenarias/:id/ata/gerar-rascunho` | `STAFF_AND_ABOVE` | `GerarRascunhoAtaUseCase` |
| PATCH | `/legislative/sessoes-plenarias/:id/ata` | `STAFF_AND_ABOVE` | `UpdateAtaUseCase` |
| POST | `/legislative/sessoes-plenarias/:id/ata/aprovar` | `PresidentOrStaffGuard` | `AprovarAtaUseCase` |

(Exportação em PDF e rota pública ficam em `SPEC-007`, que depende desta.)

## View model — campos expostos

```json
{
  "id": "uuid",
  "sessaoId": "uuid",
  "status": { "value": "RASCUNHO", "label": "Rascunho" },
  "conteudo": "<h1>Ata da 2ª Sessão Extraordinária...</h1>...",
  "geradaAutomaticamente": true,
  "aprovadaEm": null,
  "aprovadaPor": null,
  "pdfUrl": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Nunca expor:** `tenantId · isRemoved · removedAt`.

## Gathering Results

- [ ] `POST /:id/ata/gerar-rascunho` em sessão não encerrada → 422
- [ ] `POST /:id/ata/gerar-rascunho` chamado duas vezes → 409 na segunda
- [ ] Rascunho contém mesa diretora, presença e matérias votadas da sessão real
- [ ] `PATCH /:id/ata` em Ata `APROVADA` → 409 (imutável)
- [ ] `POST /:id/ata/aprovar` grava `aprovadaEm`/`aprovadaPorId` e evento `ATA_APROVADA` no histórico
- [ ] `cicloVidaJson`/`tenantId`/`isRemoved` nunca aparecem no response
