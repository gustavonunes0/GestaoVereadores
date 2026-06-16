# SPEC-004 — Agenda Legislativa

**Status:** Aprovada | **Versão:** 1.0
**Submódulo:** `src/legislativo/agenda-legislativa/`
**API prefix:** `/api/legislative/agenda`
**Depende de:** TASK-001 Migration M6

---

## Background

`AgendaLegislativa` atual é uma tabela anêmica: tem `tipo`, `titulo`, `dataInicio`, `dataFim` e mais nada. Para um sistema de câmara municipal, isso é insuficiente:
- Não vincula a sessão anunciada à `SessaoPlenaria` real
- Sem campo `local` (câmaras realizam sessões em diferentes locais)
- Sem suporte a recorrência (sessões ordinárias são semanais/quinzenais por regimento)
- Sem participantes vinculados

---

## O que JÁ EXISTE no schema (não recriar)

```prisma
model AgendaLegislativa {
  id · tenantId · tipo TipoEventoAgenda? · numero? · titulo?
  dataInicio? · dataFim? · mensagem? · isRemoved · createdAt · updatedAt
}

enum TipoEventoAgenda { SESSAO REUNIAO AUDIENCIA EVENTO COMPROMISSO }
```

## O que as migrations criam (ver TASK-001 Migration M6)

```prisma
// Campos adicionados em AgendaLegislativa
descricao          String?           // descrição detalhada do evento
local              String?           // "Plenário da Câmara", "Sala de Reuniões 1"
sessaoPlenariaId   String?           // FK para SessaoPlenaria (opcional)
comissaoId         String?           // FK para Committee (para reuniões de comissão)
publicoExterno     Boolean @default(false)  // se aparece no portal público
linkTransmissao    String?           // URL de transmissão ao vivo
recorrencia        String?           // ICAL RRULE string: "FREQ=WEEKLY;BYDAY=MO"
recorrenciaPaiId   String?           // FK para evento pai (se é ocorrência de série)

// Relações
sessaoPlenaria     SessaoPlenaria?   @relation(fields: [sessaoPlenariaId], references: [id])
comissao           Committee?        @relation(fields: [comissaoId], references: [id])
recorrenciaPai     AgendaLegislativa? @relation("RecorrenciaSerie", fields: [recorrenciaPaiId], references: [id])
ocorrencias        AgendaLegislativa[] @relation("RecorrenciaSerie")
```

---

## Estrutura de arquivos

```
src/legislativo/agenda-legislativa/
├── agenda-legislativa.module.ts
├── application/
│   ├── controllers/agenda-legislativa.controller.ts
│   ├── dto/
│   │   ├── create-evento.dto.ts
│   │   ├── update-evento.dto.ts
│   │   └── list-agenda-query.dto.ts
│   ├── use-cases/
│   │   ├── create-evento.use-case.ts
│   │   ├── list-agenda.use-case.ts
│   │   ├── get-evento-by-id.use-case.ts
│   │   ├── update-evento.use-case.ts
│   │   └── vincular-sessao.use-case.ts
│   └── view-models/
│       └── evento.view-model.ts
├── domain/
│   ├── entities/agenda-evento.entity.ts
│   ├── repositories/agenda-legislativa.repository.ts
│   └── services/recorrencia.service.ts  ← gera ocorrências de série
└── infra/
    └── prisma/
        ├── prisma-agenda-legislativa.repository.ts
        └── mappers/agenda-evento.mapper.ts
```

---

## Regras de domínio

### Vínculo com SessaoPlenaria
- Quando `tipo === SESSAO` e `sessaoPlenariaId` é informado: os dados de `dataInicio`/`dataFim` do evento devem ser consistentes com a sessão
- `VincularSessaoUseCase` cria o link e sincroniza datas
- Quando `SessaoPlenaria` é encerrada, o evento agenda atualiza `dataFim` automaticamente (via hook ou job)

### Recorrência
- `recorrencia` segue formato ICAL RRULE: `"FREQ=WEEKLY;BYDAY=TU;COUNT=40"`
- `RecorrenciaService.gerarOcorrencias(evento, ate: Date)` cria instâncias filhas
- Instâncias filhas têm `recorrenciaPaiId` preenchido
- Editar o pai pergunta ao usuário: "Esta ocorrência" ou "Todas as ocorrências futuras"

### Visibilidade pública
- `publicoExterno: true` aparece no endpoint público `/api/public/agenda` (sem autenticação)
- `publicoExterno: false` só aparece para usuários autenticados do tenant

---

## Endpoints

| Método | Rota | Use Case |
|--------|------|----------|
| GET | `/legislative/agenda` | ListAgendaUseCase |
| GET | `/legislative/agenda/:id` | GetEventoByIdUseCase |
| POST | `/legislative/agenda` | CreateEventoUseCase |
| PATCH | `/legislative/agenda/:id` | UpdateEventoUseCase |
| DELETE | `/legislative/agenda/:id` | soft delete |
| POST | `/legislative/agenda/:id/vincular-sessao` | VincularSessaoUseCase |
| GET | `/public/agenda` | ListAgendaUseCase (público, sem auth) |

---

## Gathering Results

- [ ] Evento tipo SESSAO pode ser vinculado a SessaoPlenaria existente
- [ ] Recorrência gera instâncias filhas corretamente
- [ ] Endpoint público não retorna eventos com `publicoExterno: false`
- [ ] `local` aparece no response e no frontend
