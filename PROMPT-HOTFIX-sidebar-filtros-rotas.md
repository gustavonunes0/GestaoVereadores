# PROMPT — HOTFIX: Sidebar, Filtros e Rotas

> Cole este prompt no Claude Code após `cd frontend && claude`.
> Executar ANTES de qualquer outra task de frontend.

```
Antes de qualquer ação, leia nesta ordem:

1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/tasks/TASK-FE-HOTFIX-001-sidebar-filtros-rotas.md

Foram encontrados 3 problemas críticos no frontend que precisam ser corrigidos
antes de qualquer outra implementação. Confirme que entendeu cada um:

PROBLEMA 1 — SIDEBAR COM ESTRUTURA ERRADA:
A sidebar foi gerada com grupos "Atividade Legislativa" / "Estrutura da Câmara" / "Gestão"
mas o documento operacional define uma lista plana com ordem específica:
Dashboard → Sessões → Matérias → Normas → Atos → Parlamentares → Mesa Diretora →
Comissões → Frentes → Autor Externo → Agenda → Relatórios → Câmara Gestão (accordion)
  └── Portal Institucional (rota nova)
  └── Usuários (apenas ADMIN_STAFF)

Parlamentar View: "Perfil" é expandível com 3 sub-itens:
  └── Perfil Parlamentar → /parlamentar/perfil
  └── Biografia → /parlamentar/biografia (rota nova)
  └── Dashboard → /parlamentar/dashboard (rota nova)

PROBLEMA 2 — FILTROS EM COLUNA EM VEZ DE ROW:
O FiltroLayout usa className="grid p-fluid" que empilha campos verticalmente.
O correto é className="flex flex-row flex-wrap gap-3 align-items-end"
com cada campo tendo className="sigl-filtro-campo" (min-width: 180px, flex: 1 1 180px).
Os botões Limpar e Pesquisar ficam no final da MESMA row (marginLeft: auto).
No mobile (<768px) os campos empilham — via media query no CSS.

PROBLEMA 3 — ROTAS DA API INCORRETAS:
- /normas → deve ser /legislative/normas
- /atos → continua /atos mas agora tem tenantId
- /legislative/votacoes não está em paths.ts
- /identidade/autores-externos não está em paths.ts
- Nenhum endpoint de ciclo de vida está mapeado:
  /legislative/materias/:id/tramitar
  /legislative/sessoes-plenarias/:id/abrir
  /legislative/sessoes-plenarias/:id/encerrar
  /legislative/normas/:id/sancao
  /legislative/normas/:id/promulgacao
  etc.

NÃO execute nada ainda. Aguarde minha confirmação do resumo.

---

Após confirmação, execute em ordem:

BLOCO 1 — Sidebar (T-01 a T-04):
- Reescrever STAFF_NAV_GROUPS em navigation.ts com ordem correta e lista plana
- Reescrever PARLAMENTAR_NAV_ITEMS com "Perfil" expandível e 3 sub-itens
- Atualizar SidebarNav.tsx para renderizar accordion com aria-expanded
- Criar rota /camara/portal com PortalInstitucionalPage (placeholder)
- Criar rotas /parlamentar/biografia e /parlamentar/dashboard

BLOCO 2 — Filtros em row (T-05 a T-07):
- Reescrever FiltroLayout.tsx com flex-row flex-wrap
- Criar classe .sigl-filtro-campo em styles/sigl-ui-patterns.css
- Adicionar media query para mobile (campos empilham)
- Aplicar o novo padrão em MateriasPage, NormasPage, AtosPage, SessoesPage, AgendaPage

BLOCO 3 — Rotas API (T-08 a T-11):
- Reescrever api/paths.ts completamente com todos os paths corretos
- Atualizar todos os *.api.ts para usar API_PATHS (não strings literais)
- Remover /auth/login-camara e /guest-users de paths.ts
- Criar paths.sanity.test.ts e rodar os testes

AO FINAL:
- Marcar todos os itens T-01 a T-11 como [x]
- Rodar: npm run build → zero erros TypeScript
- Rodar: npm test → paths.sanity.test.ts passando
- Verificar visualmente: sidebar mostra itens na ordem correta
- Verificar visualmente: filtros ficam na mesma linha horizontal

REGRAS DESTA SESSÃO:
- Nunca usar strings literais de URL — sempre API_PATHS
- FiltroLayout NUNCA usa className="grid p-fluid" — sempre flex-row
- Sidebar: itens na EXATA ordem do documento operacional
- Accordion de "Câmara Gestão" começa colapsado
- Accordion de "Perfil" (parlamentar) começa expandido
- aria-expanded obrigatório em todo accordion
- Perguntar antes de qualquer decisão não coberta na task
```
