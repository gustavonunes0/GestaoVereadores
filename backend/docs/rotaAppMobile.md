# Rotas API — App Mobile (Parlamentar)

Referência das rotas de **Sessões Plenárias** e **Votações** consumidas pelo app mobile do vereador.

> **Base URL:** `{HOST}/api`  
> **Autenticação:** `Authorization: Bearer {accessToken}` (JWT)  
> **Tenant:** resolvido automaticamente pelo JWT (`tenantId` no token — nunca enviar no body)  
> **Swagger:** `{HOST}/api/docs`

---

## Autenticação (pré-requisito)

| Método | Rota | Público | Descrição |
|--------|------|---------|-----------|
| `POST` | `/auth/login` | Sim | Login unificado. Com `cpf` + `password` (+ `tenantId` ou `tenantCnpj`) autentica parlamentar ou staff. |
| `POST` | `/auth/login-camara` | Sim | Login câmara (CPF ou e-mail + senha + tenant). |
| `GET` | `/auth/me` | Não | Perfil da sessão autenticada. |

### Body — login parlamentar (exemplo)

```json
{
  "cpf": "12345678901",
  "password": "senha1234",
  "tenantId": "uuid-do-tenant"
}
```

### Papéis relevantes

| Papel | Descrição |
|-------|-----------|
| `PARLIAMENTARIAN_SESSION` | Sessão JWT de parlamentar (app mobile). |
| `STAFF` / `ADMIN_STAFF` | Servidor / administrador da câmara. |
| `PresidentOrStaffGuard` | Presidente da mesa **ou** staff/admin (ações de condução da sessão). |

---

## WebSocket — tempo real

**Namespace:** `/sessao`  
**Auth:** `auth.token` ou header `Authorization: Bearer {token}` no handshake.

| Evento (servidor → cliente) | Payload resumido |
|-----------------------------|------------------|
| `votacao:aberta` | `{ votacaoId, pautaItemId, tipoVotacao }` |
| `votacao:placar` | `{ votacaoId, votosSim, votosNao, abstencoes }` |
| `votacao:encerrada` | `{ votacaoId, resultado, votosSim, votosNao, abstencoes, votoQualidade, votos? }` |
| `sessao:fase` | `{ sessaoId, faseAtual }` |
| `sessao:encerrada` | `{ sessaoId }` |
| `palavra:pedida` | `{ pedidoId, parlamentarNome, sessaoId, criadoEm }` |
| `palavra:concedida` | `{ pedidoId, parlamentarNome, sessaoId }` |
| `palavra:negada` | `{ pedidoId, sessaoId }` — sala individual do parlamentar |
| `palavra:encerrada` | `{ pedidoId, parlamentarNome, sessaoId }` |

**Salas:** `tenant:{tenantId}` (broadcast) · `parlamentar:{parliamentarianId}` (mensagens individuais)

---

## Votações — catálogo

Prefixo: `/legislative/votacoes`

Endpoints de domínio (listas para UI). Não executam voto — voto fica aninhado em sessão/pauta.

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `/legislative/votacoes/tipos` | Autenticado | Tipos de votação (`NOMINAL`, `SIMBOLICA`, `SECRETA`). |
| `GET` | `/legislative/votacoes/votos/valores` | Autenticado | Valores de voto (`SIM`, `NAO`, `ABSTENCAO`, `PRESENTE`). |
| `GET` | `/legislative/votacoes/resultados/valores` | Autenticado | Resultados possíveis (`APROVADO`, `REJEITADO`, `EMPATADO`). |

---

## Sessões Plenárias — referência e listagem

Prefixo: `/legislative/sessoes-plenarias`

### Domínio / enums

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `/legislative/sessoes-plenarias/pauta/fases` | Autenticado | Fases da pauta. |
| `GET` | `/legislative/sessoes-plenarias/presenca/situacoes` | Autenticado | Situações de presença. |
| `GET` | `/legislative/sessoes-plenarias/situacoes` | Autenticado | Situações do ciclo de vida da sessão. |

### CRUD e consulta

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `/legislative/sessoes-plenarias` | Autenticado | Lista sessões. Query: `page`, `limit`, `tipoSessaoId`, `situacaoId`, `sessaoLegislativaId`, `legislaturaId`, `dataInicioDe`, `dataInicioAte`. |
| `GET` | `/legislative/sessoes-plenarias/sessao-ativa` | **Parlamentar** | Sessão aberta/suspensa do tenant com pauta e contexto para o app. |
| `GET` | `/legislative/sessoes-plenarias/:id` | Autenticado | Detalhe da sessão. |
| `GET` | `/legislative/sessoes-plenarias/:id/fluxo` | Autenticado | Workflow / transições permitidas. |
| `GET` | `/legislative/sessoes-plenarias/:id/ciclo-vida/acoes` | Autenticado | Ações de ciclo de vida disponíveis. |
| `POST` | `/legislative/sessoes-plenarias` | Admin | Criar sessão. |
| `PATCH` | `/legislative/sessoes-plenarias/:id` | Admin | Atualizar sessão (sem mudar status diretamente). |
| `DELETE` | `/legislative/sessoes-plenarias/:id` | Admin | Soft delete da sessão. |
| `POST` | `/legislative/sessoes-plenarias/:id/ciclo-vida` | Staff+ | Executar ação legada de ciclo de vida. |

---

## Sessões — ciclo de vida (mesa / staff)

| Método | Rota | Papel | Body | Descrição |
|--------|------|-------|------|-----------|
| `POST` | `.../:id/abrir` | Staff+ | `AbrirSessaoDto` | Abre a sessão. |
| `POST` | `.../:id/suspender` | Staff+ | `SuspenderSessaoDto` | Suspende a sessão. |
| `POST` | `.../:id/encerrar` | Presidente/Staff | `EncerrarSessaoDto` | Encerra a sessão. Emite `sessao:encerrada`. |
| `POST` | `.../:id/cancelar` | Staff+ | `CancelarSessaoDto` | Cancela sessão agendada. |
| `PATCH` | `.../:id/fase` | Presidente/Staff | `{ "faseAtual": "EXPEDIENTE" \| "ORDEM_DO_DIA" \| ... }` | Altera fase. Emite `sessao:fase`. |
| `GET` | `.../:id/quorum` | Autenticado | — | Calcula quórum presente. |
| `PATCH` | `.../:id/pauta/publicar` | Staff+ | — | Publica pauta da sessão. |

**Valores `faseAtual`:** `NAO_INICIADA` · `EXPEDIENTE` · `ORDEM_DO_DIA` · `EXPLICACOES_PESSOAIS` · `ENCERRADA`

---

## Sessões — pauta

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `.../:id/pauta` | Autenticado | Lista itens da pauta. Query: filtros de `FilterPautaDto`. |
| `GET` | `.../:id/pauta/:pautaItemId` | Autenticado | Detalhe de um item. |
| `POST` | `.../:id/pauta` | Staff+ | Adiciona item (`materiaId`, `ordem?`, `fase?`, `tipoPautaItem?`). |
| `PATCH` | `.../:id/pauta/:pautaItemId` | Staff+ | Atualiza item. |
| `DELETE` | `.../:id/pauta/:pautaItemId` | Staff+ | Remove item. |
| `PATCH` | `.../:id/pauta/:pautaItemId/resultado` | Staff+ | Registra resultado do item na pauta. |

---

## Sessões — presença

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `.../:id/presencas` | Autenticado | Lista presenças. Query: `FilterPresencaDto`. |
| `GET` | `.../:id/presencas/:presencaId` | Autenticado | Detalhe de uma presença. |
| `POST` | `.../:id/presencas` | Staff+ | Registra presença de parlamentar (mesa). Body: `RegistrarPresencaDto`. |
| `PATCH` | `.../:id/presencas/:presencaId` | Staff+ | Atualiza presença. Body: `UpdatePresencaDto`. |
| `POST` | `.../:id/minha-presenca` | **Parlamentar** | Auto-registro de presença (dados do JWT). Body vazio `{}`. |

---

## Sessões — pedido de palavra

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `POST` | `.../:id/pedir-palavra` | **Parlamentar** | Solicita a palavra. Emite `palavra:pedida`. |
| `GET` | `.../:id/pedidos-palavra` | Presidente/Staff | Lista pedidos da sessão. |
| `PATCH` | `.../:id/pedidos-palavra/:pid` | Presidente/Staff | Concede ou nega. Body: `{ "status": "CONCEDIDO" \| "NEGADO" }`. |
| `POST` | `.../:id/pedidos-palavra/:pid/encerrar` | Presidente/Staff | Encerra fala concedida. |

---

## Votações — aninhadas em sessão/pauta

Prefixo: `/legislative/sessoes-plenarias/:id/pauta/:pautaItemId/votacao`

Parâmetros:
- `:id` — UUID da sessão plenária
- `:pautaItemId` — UUID do item de pauta

### Consulta e abertura

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `.../votacao` | Autenticado | Obtém votação do item (placar, tipo, aberta/finalizada, votos se nominal). |
| `POST` | `.../votacao` | Presidente/Staff | Abre votação. Body abaixo. Emite `votacao:aberta`. |

**Body — abrir votação (`AbrirVotacaoDto`):**

```json
{
  "tipoVotacao": "NOMINAL",
  "exigePresenca": true
}
```

`tipoVotacao`: `NOMINAL` · `SIMBOLICA` · `SECRETA`

### Votos individuais

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `.../votacao/votos` | Autenticado | Lista votos. Query: `parlamentarId?`, `voto?`. |
| `GET` | `.../votacao/votos/:votoId` | Autenticado | Detalhe de um voto. |
| `POST` | `.../votacao/votos` | **Parlamentar** | Registra **meu** voto (app mobile). Body abaixo. Emite `votacao:placar`. |
| `PATCH` | `.../votacao/votos/:votoId` | Staff+ | Corrige voto registrado. Body: `{ "voto": "SIM" \| "NAO" \| "ABSTENCAO" \| "PRESENTE" }`. |

**Body — registrar voto (`RegistrarVotoDto`):**

```json
{
  "parlamentarId": "uuid-legado-parlamentar",
  "voto": "SIM",
  "parliamentarianProfileId": "uuid-opcional",
  "legislatureProfileId": "uuid-opcional"
}
```

> No app mobile, preferir enviar IDs do perfil parlamentar quando disponíveis no JWT/contexto.

### Resultado e encerramento

| Método | Rota | Papel | Descrição |
|--------|------|-------|-----------|
| `GET` | `.../votacao/resultado` | Autenticado | Pré-visualiza resultado. Query: `votosSim?`, `votosNao?`, `abstencoes?` (simbólica). |
| `PATCH` | `.../votacao/finalizar` | Staff+ | Finaliza votação (legado). Body: `FinalizarVotacaoDto`. |
| `PATCH` | `.../votacao/encerrar` | Presidente/Staff | Encerra votação com regras de quórum/empate. Body abaixo. Emite `votacao:encerrada`. |

**Body — encerrar votação (`EncerrarVotacaoDto`):**

```json
{
  "quorumVotacao": 0,
  "motivoEmpate": "string-opcional",
  "observacoes": "string-opcional",
  "votoQualidade": false
}
```

---

## Fluxo típico — App Mobile (parlamentar)

```
1. POST /auth/login                    → JWT
2. GET  .../sessoes-plenarias/sessao-ativa
3. POST .../:id/minha-presenca         → registrar presença
4. GET  .../:id/pauta                  → itens em votação
5. GET  .../:id/pauta/:pautaItemId/votacao
6. POST .../:id/pauta/:pautaItemId/votacao/votos   → SIM / NAO / ABSTENCAO
7. WS   /sessao                        → ouvir placar e encerramento
8. POST .../:id/pedir-palavra            → pedido de palavra (opcional)
```

---

## Resposta — votação (resumo)

Campos principais retornados por `GET .../votacao`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID da votação |
| `pautaItemId` | UUID | Item de pauta |
| `tipo.value` | enum | `NOMINAL` / `SIMBOLICA` / `SECRETA` |
| `totais.votosSim` | number | Contagem SIM |
| `totais.votosNao` | number | Contagem NÃO |
| `totais.abstencoes` | number | Contagem abstenções |
| `resultado` | `{ value, label } \| null` | Resultado após encerramento |
| `aberta` | boolean | `true` se ainda não finalizada |
| `aceitaVotoIndividual` | boolean | Permite POST em `/votos` |
| `ocultaVotosIndividuais` | boolean | `true` em SECRETA |
| `votos` | array \| undefined | Lista nominal (omitida se secreta) |

---

## Códigos HTTP comuns

| Código | Situação |
|--------|----------|
| `401` | Token ausente ou inválido |
| `403` | Papel insuficiente (ex.: parlamentar em rota de staff) |
| `404` | Sessão, pauta, votação ou voto não encontrado |
| `409` | Voto duplicado, votação já existe |
| `400` | Regra de negócio (quórum, sessão encerrada, votação fechada, etc.) |

---

## Arquivos-fonte

| Módulo | Controller |
|--------|------------|
| Votações (catálogo) | `backend/src/legislativo/votacoes/application/controllers/votacoes.controller.ts` |
| Sessões + votações aninhadas | `backend/src/legislativo/sessoes-plenarias/application/controllers/sessoes.controller.ts` |
| WebSocket | `backend/src/legislativo/sessoes-plenarias/realtime/sessao-realtime.gateway.ts` |
| Auth | `backend/src/auth/application/controllers/auth.controller.ts` |

*Gerado a partir do código em 20/06/2026.*
