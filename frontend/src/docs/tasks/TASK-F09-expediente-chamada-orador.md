# TASK-F09 — Chamada dos Vereadores, Voto de Qualidade, Cronômetro de Orador (frontend)

> **Status: parcial.** Implementado: botão "Realizar chamada" + "Reiniciar chamada" (com dialog de
> justificativa) em `PresencaPanel.tsx`; badge de voto de qualidade no toast de
> `FecharVotacaoDialog.tsx` ao encerrar uma votação empatada. **Não implementado nesta rodada**
> (deferido, não é bug): exibição do badge de voto de qualidade no painel/TV
> (`SessaoPainelPage.tsx`), cronômetro visual de orador e campo de tema na solicitação de palavra —
> o backend (TASK-009c) já suporta `tema`/`fase`/`tempoConcedidoSegundos`, só a UI de cronômetro
> ainda não foi construída.

**Backend correspondente:** `backend/src/docs/tasks/TASK-009-expediente-chamada-orador.md` (SPEC-009)

As três partes (a/b/c) são independentes entre si, mesma divisão do backend.

---

## Parte (a) — Chamada dos Vereadores

### Contexto
Hoje `PresencaPanel.tsx` já lista e permite marcar presença item a item (`PlenarioMapa.tsx`,
`QuorumBar.tsx`). Falta a ação de **chamada em lote** que o concorrente expõe como botão único
("CHAMADA DOS VEREADORES" → "EXECUTADO") e o correspondente "REINICIAR CHAMADA".

### T-01 · API client
- [x] Em `sessoes.api.ts`: `chamarVereadores(sessaoId)`, `reiniciarChamada(sessaoId, justificativa)`

### T-02 · UI em `PresencaPanel.tsx`
- [ ] Botão "Realizar chamada" — visível quando `statusSessao === 'ABERTA'` **e** `canWrite`
      (`podeChamar`). **Não implementado**: esconder o botão depois que uma chamada já foi feita —
      o botão continua visível/reexecutável (é idempotente por design — quem já tem presença
      registrada é preservado — então reexecutar não corrompe nada, só é redundante na UI)
- [x] Ao clicar: `confirmDialog`, depois `sessoesApi.chamarVereadores(id)`, depois `await carregar()`
      (refetch explícito de presenças, não dependendo só do socket)
- [x] Botão "Reiniciar chamada" (gated por `canWrite`, não especificamente `canManageSessao` —
      mesma flag já usada no resto do `PresencaPanel.tsx` para consistência), `Dialog` com
      `InputTextarea` de justificativa, botão de confirmar desabilitado com menos de 3 caracteres

---

## Parte (b) — Voto de qualidade (exibição)

### Contexto
Isto é só **exibição** — a lógica de decisão é 100% backend (TASK-009 parte b). O frontend só
precisa mostrar quando um resultado foi decidido por voto de qualidade, para não ficar
inexplicável para quem está lendo o placar.

### T-03 · Exibir no placar de votação
- [x] Confirmado que `votoQualidade` já estava tipado em `types/legislative.ts` **antes** desta
      sessão de trabalho (pré-existente) — não precisou de mudança no tipo/hook
- [x] Em `FecharVotacaoDialog.tsx`: toast de sucesso ganha o sufixo "— decidido por voto de
      qualidade da Presidência" quando `res.votoQualidade === true`
- [ ] Em `SessaoPainelPage.tsx` (TV): **não implementado** — o badge só aparece hoje para quem
      fechou a votação (via toast), não para quem está assistindo o painel/TV ao vivo

---

## Parte (c) — Cronômetro de Orador

### Contexto
`PedidoPalavra` ganha `tema`, `fase`, `tempoConcedidoSegundos` (TASK-009 parte c). Hoje a fila de
pedidos de palavra já existe na UI (conectada via `palavra:*` no realtime), mas sem cronômetro
visível — só é possível hoje ver a duração final depois de encerrado, não o tempo restante ao
vivo, porque não havia `tempoConcedidoSegundos` armazenado.

### T-04 · Componente de cronômetro — **NÃO IMPLEMENTADO** (deferido)
- [ ] `frontend/src/components/sessoes/oradores/CronometroOrador.tsx` (novo diretório) — recebe
      `tempoConcedidoSegundos` e o instante em que foi concedido, conta regressivamente no cliente
      (`setInterval`, 1s), muda de cor perto do fim (ex.: últimos 30s em vermelho — mesma
      convenção visual de `QuorumBar.tsx` para estados de alerta, se aplicável)
  - Não depende de um novo evento de socket para "tick" — o cronômetro é client-side puro a partir
    de um timestamp; só precisa que o backend informe `tempoConcedidoSegundos` e o momento da
    concessão (já existe `respondidoEm` no schema de `PedidoPalavra`)

### T-05 · Campo de tema na solicitação — **NÃO IMPLEMENTADO** (deferido)
- [ ] No formulário/dialog de "Pedir a palavra", adicionar campo opcional "Assunto" (`tema`)
- [ ] No painel do presidente/staff que concede a palavra: campo "Tempo concedido (segundos)"

### T-06 · Exibir no painel (TV) — **NÃO IMPLEMENTADO** (deferido)
- [ ] Em `SessaoPainelPage.tsx`, mostrar o orador atual com `tema` e o `CronometroOrador`

---

## Testes / verificação manual — **NÃO EXECUTADA nesta sessão**

- [ ] Realizar chamada em sessão de teste, confirmar presenças marcadas em lote e mapa de cadeiras atualizado
- [ ] Reiniciar chamada sem justificativa → botão de confirmar desabilitado
- [ ] Provocar um empate de votação com presidente votante (ambiente de teste) e confirmar que a
      tag de voto de qualidade aparece no resultado
- [ ] Pedir a palavra com tema, conceder com tempo definido, confirmar cronômetro regressivo no painel (TV) — N/A, feature não implementada

---

## Checklist
- [ ] Botão de chamada em lote funcional, respeitando quem já se autoregistrou — implementado, não testado ao vivo no navegador
- [x] Reiniciar chamada exige justificativa na UI (botão desabilitado com `justificativa.trim().length < 3`, confirmado por leitura)
- [ ] Resultado de votação por voto de qualidade fica visualmente identificado — **parcial**: só no toast de quem fecha a votação, não no painel/TV
- [ ] Cronômetro de orador visível no painel/TV, com tema quando informado — **não implementado**
