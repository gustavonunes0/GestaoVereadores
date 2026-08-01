# TASK-F08 — Timeline de Histórico da Sessão / "Log" (frontend)

**Backend correspondente:** `backend/src/docs/tasks/TASK-008-sessao-historico.md` (SPEC-008)

---

## Contexto

`relatorio_sessao.md` mapeia um item de menu "Log" no concorrente (quebrado, 500, mas confirma
que a funcionalidade é esperada). Hoje não existe nenhuma visualização de histórico/auditoria de
sessão no frontend — só o estado atual (`SessaoPlenariaDetalhe`). O backend (TASK-008) expõe
`GET /:id/historico` paginado; esta task consome esse endpoint numa aba de timeline dentro de
`SessaoDetalhePage.tsx`, no mesmo padrão de abas (`TabView`/`TabPanel`) já usado para
Pauta/Presenças/Transmissão.

---

## Fase 1 — Cliente de API

### T-01 · Tipos e API client
- [x] Tipo `SessaoHistoricoEvento` — criado, mas dentro de `api/legislative/sessoes.api.ts` (junto
      com o método), não em `types/sessoes.ts`
- [x] `sessoesApi.getHistorico(sessaoId, params)` usando `apiList`, adicionado ao arquivo existente

---

## Fase 2 — Componente

### T-02 · Timeline
- [x] `frontend/src/components/sessoes/historico/HistoricoTimeline.tsx`
  - [x] Usa `Timeline` do PrimeReact
  - [x] Ícone por `tipoEvento` via mapa `ICONS` (equivalente ao `HISTORICO_ICONS` sugerido), horário, descrição, responsável quando houver
  - [ ] Filtro por `tipoEvento` (dropdown) — **não implementado**, doc já marcava como opcional para v1
  - [x] Paginação "carregar mais" (`page`/`limit`, mesmo padrão do resto do projeto)

### T-03 · Integração na página de detalhe
- [x] `<TabPanel header="Histórico">` com `<HistoricoTimeline sessaoId={sessao.id} />` em
      `SessaoDetalhePage.tsx`. "Carregar sob demanda" é satisfeito indiretamente: o `TabView` do
      PrimeReact (v10, `renderActiveOnly` padrão `true`) só monta o painel quando a aba é
      selecionada, então o `useEffect` de fetch do componente só dispara nesse momento — não
      precisei de uma flag de lazy explícita.

---

## Fase 3 — Testes / verificação manual

### T-04 · Verificação — **NÃO EXECUTADA nesta sessão** (nenhum servidor/navegador foi usado)
- [ ] Abrir/suspender/encerrar uma sessão de teste e confirmar que os eventos aparecem na timeline
      na ordem certa (mais recente primeiro)
- [ ] Abrir/encerrar uma votação e confirmar que o evento mostra o resultado correto
- [ ] Confirmar que a aba não trava/erra em sessão recém-criada sem nenhum evento ainda

---

## Checklist
- [x] Aba "Histórico" mostra eventos em ordem cronológica decrescente (backend já ordena `dataHora desc`; confirmado por leitura, não testado ao vivo)
- [x] Ícone e descrição variam corretamente por `tipoEvento` (confirmado por leitura)
- [x] Estado vazio tratado (mensagem explícita quando `eventos.length === 0`)
- [x] Carregamento sob demanda (via comportamento padrão do `TabView`, ver T-03)
