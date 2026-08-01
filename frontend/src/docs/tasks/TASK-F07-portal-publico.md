# TASK-F07 — Portal Público da Sessão (frontend)

**Backend correspondente:** `backend/src/docs/tasks/TASK-007-portal-publico.md` (SPEC-007)
**Achado importante desta task (ler antes de começar):** hoje **não existe nenhuma rota
verdadeiramente pública no frontend**. `router.tsx` só registra `login`, `staffRoutes` e
`parlamentarRoutes` — e mesmo a página `camara/portal` (`PortalInstitucionalPage.tsx`, hoje) vive
dentro de `staffRoutes`, atrás de `<StaffRoute />`, que redireciona para `/login` se `!user`
(`frontend/src/components/StaffRoute.tsx:18`). Ou seja: **mesmo as páginas que hoje parecem
"institucionais/públicas" exigem login**. Isso precisa ser corrigido nesta task, não só
adicionado por cima.

---

## Fase 1 — Novo grupo de rotas públicas (pré-requisito estrutural)

### T-01 · Criar `frontend/src/app/routes/public.routes.tsx`
- [x] Novo arquivo, sem nenhum componente de guard envolvendo:
  ```tsx
  import { Pages } from './lazy-pages';
  import { page } from './page-loader';

  /** Rotas públicas — SEM autenticação, SEM StaffRoute. Consomem só endpoints @Public() do backend. */
  export const publicRoutes = {
      path: 'publico',
      children: [
          { path: 'sessoes/:id/resumo', element: page(Pages.sessaoResumoPublico) },
      ],
  };
  ```
- [x] Registrar em `router.tsx`, como item irmão de `staffRoutes`/`parlamentarRoutes` (**não**
      dentro de nenhum dos dois):
  ```tsx
  export const appRouter = createBrowserRouter([
      { path: ROUTES.login, element: page(Pages.login) },
      publicRoutes,       // NOVO — antes de staffRoutes/parlamentarRoutes, sem guard
      staffRoutes,
      parlamentarRoutes,
      { path: '*', element: <CatchAllRoute /> },
  ]);
  ```
- [x] Adicionar `sessaoResumoPublico` em `lazy-pages.ts`, mesmo padrão dos demais:
  ```ts
  sessaoResumoPublico: lazy(() =>
      import('../../pages/publico/SessaoResumoPublicoPage').then((m) => ({ default: m.SessaoResumoPublicoPage })),
  ),
  ```

### T-02 · Confirmar que o cliente HTTP não injeta Authorization nessas rotas
- [x] Investigado — **não é necessário criar variante nova**: `@Public()` no backend não rejeita
      uma requisição só porque ela vem com um `Authorization` header presente, ele só pula o guard
      que exigiria um. Enviar o token (quando existir) para uma rota pública é inofensivo. Usei o
      `api()` padrão sem criar `apiPublico()`/`{ auth: false }`.

---

## Fase 2 — Página pública de Resumo da Sessão

### T-03 · API client público — **feito em local diferente do especificado**
- [ ] `frontend/src/api/legislative/sessao-publico.api.ts` — **não criado como arquivo separado**:
      `getResumoPublico(sessaoId)` foi adicionado dentro de `sessoesApi` (`sessoes.api.ts`), mesmo
      tratamento de Ata/Chamada/Histórico
- [x] Para os PDFs, usei link direto (`<a href={url} target="_blank">`), sem `fetch` — como sugerido

### T-04 · Página
- [x] `frontend/src/pages/publico/SessaoResumoPublicoPage.tsx` — sem `<Layout />` autenticado.
      Seções: identificação, mesa diretora, lista de presença (sem justificativa), matérias com
      resultado, botão "Baixar lista de presença (PDF)" sempre visível e "Baixar ata (PDF)"
      **condicional** (faço um `fetch(..., { method: 'HEAD' })` no mount para só mostrar o botão
      se a rota de PDF da ata responder OK — implementa exatamente o "esconder o botão em vez de
      mostrar erro" pedido aqui)
  - [x] Estado de sessão não encontrada / não encerrada → mensagem amigável

### T-05 · Link a partir do sistema autenticado — **NÃO FEITO**
- [ ] Nenhum botão/link "Ver página pública" foi adicionado em `SessaoDetalhePage.tsx`/`SessoesPage.tsx`

---

## Fase 3 — Testes / verificação manual

### T-06 · Verificação — **NÃO EXECUTADA nesta sessão** (nenhum navegador foi aberto)
- [ ] Abrir `/publico/sessoes/:id/resumo` sem estar logado e confirmar que carrega
- [ ] Confirmar que nenhum dado sensível aparece
- [ ] Testar sessão inexistente e sessão `AGENDADA`/`ABERTA` → mensagem amigável
- [ ] Testar os dois botões de PDF

---

## Checklist
- [x] Existe pelo menos um grupo de rotas no frontend genuinamente sem guard de autenticação (`publicRoutes`, confirmado por leitura de `router.tsx`)
- [ ] `/publico/sessoes/:id/resumo` carrega em aba anônima, sem token — implementado, não testado ao vivo no navegador
- [x] Nenhum dado sensível renderizado na página pública (auditado — mesmos campos do backend)
- [ ] Links de PDF funcionam sem login — implementado, não testado ao vivo
