# TASK-F06 — Editor de Ata da Sessão (frontend)

> **Status: implementado.** `components/sessoes/ata/AtaTab.tsx`, integrado como aba condicional
> (`statusSessao === 'ENCERRADA'`) em `SessaoDetalhePage.tsx`. **Desvio da spec:** o plano original
> cogitava usar o componente `Editor` do PrimeReact (rich text) — na prática ele depende do pacote
> `quill`, que não está instalado no projeto, e isso quebrava `vite build` ("Rollup failed to
> resolve import 'quill'"). Para não introduzir uma dependência nova só para isso, o editor usa
> `InputTextarea` simples sobre o HTML bruto (o mesmo formato que `Ata.conteudo` já armazena) —
> funcional, mas sem WYSIWYG. Instalar `quill` e trocar por `Editor` é uma melhoria futura válida,
> não um bug.

**Backend correspondente:** `backend/src/docs/tasks/TASK-006-ata.md` (SPEC-006) — **este frontend
não pode ser iniciado antes dos endpoints de TASK-006 existirem** (precisa de payload real para
integrar, não é front-first).
**Convenção:** primeira entrada de `frontend/src/docs/` — a pasta existia vazia; este e os demais
`TASK-F0N-*.md` estabelecem o mesmo padrão de tasks já usado em `backend/src/docs/tasks/`.

---

## Contexto

`relatorio_sessao.md` (reconhecimento do concorrente IntGest) mostra "Ata" como item de menu
próprio da sessão, com editor dedicado, autenticado. Hoje não existe nenhuma tela de Ata no
projeto. `SessaoDetalhePage.tsx` já é uma página com `TabView`/`TabPanel` (PrimeReact) contendo
`PautaManager`, `PresencaPanel`, `TransmissaoPanel` como abas — a Ata entra como **nova aba**
nesse mesmo padrão, não como página separada.

---

## Fase 1 — Cliente de API

### T-01 · Tipos
- [x] `frontend/src/types/ata.ts` (arquivo próprio, criado) — `Ata`, `StatusAta` espelhando o view
      model de `SPEC-006`

### T-02 · API client — **feito em local diferente do especificado**
- [ ] `frontend/src/api/legislative/ata.api.ts` — **não criado como arquivo separado**: os métodos
      (`getAta`, `gerarRascunhoAta`, `updateAta`, `aprovarAta`) foram adicionados dentro do objeto
      `sessoesApi` já existente em `sessoes.api.ts`, mesmo tratamento dado a chamada/histórico —
      Ata é sub-recurso de sessão, então manter tudo num único client evita fragmentar por convenção
      própria só para este caso
- [x] Rotas correspondentes adicionadas em `frontend/src/api/paths.ts` (`sessaoAta`,
      `sessaoAtaGerarRascunho`, `sessaoAtaAprovar`, `sessaoAtaPdf`)

---

## Fase 2 — Componente

### T-03 · Aba de Ata
- [x] `frontend/src/components/sessoes/ata/AtaTab.tsx`
  - [x] Estado vazio (sessão não encerrada): mensagem, sem botão de gerar
  - [x] Sessão encerrada + sem Ata: botão "Gerar rascunho da ata"
  - [x] Ata `RASCUNHO`: editor + "Salvar" + "Aprovar ata" (com `confirmDialog`) — **desvio**: o
        editor é `InputTextarea` simples sobre o HTML bruto, não o componente `Editor` do
        PrimeReact (que depende do pacote `quill`, não instalado — quebrava `vite build`). Ver
        nota no topo deste arquivo.
  - [x] Ata `APROVADA`/`PUBLICADA`: conteúdo em modo leitura + botão "Baixar PDF" linkando para
        `GET /:id/ata/pdf`

### T-04 · Integração na página de detalhe
- [x] Em `SessaoDetalhePage.tsx`, `<TabPanel>` com `<AtaTab sessaoId={sessao.id} statusSessao={sessao.statusSessao} />`,
      renderizado condicionalmente só quando `sessao.statusSessao === 'ENCERRADA'`

---

## Fase 3 — Testes / verificação manual

### T-05 · Verificação — **NÃO EXECUTADA nesta sessão** (nenhum servidor foi iniciado / navegador aberto)
- [ ] Rodar o backend + frontend localmente e testar o fluxo ponta a ponta: encerrar uma sessão de
      teste → gerar rascunho → editar → aprovar → baixar PDF
- [ ] Conferir que a aba de Ata não aparece/fica desabilitada em sessão `ABERTA`/`AGENDADA`
- [ ] Testar com um usuário sem permissão de staff — botões de gerar/aprovar devem respeitar `usePermissions()`

---

## Checklist
- [x] Aba "Ata" só aparece em sessão encerrada (condição de renderização confirmada por leitura)
- [ ] Gerar rascunho, editar e aprovar funcionam ponta a ponta contra o backend real — implementado nos dois lados, não testado ao vivo
- [x] Ata aprovada fica em modo leitura, sem opção de editar (`editavel` flag confirmado)
- [x] Link de "Baixar PDF" só aparece quando `ata.status.value !== 'RASCUNHO'`
