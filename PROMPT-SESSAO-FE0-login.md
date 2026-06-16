# PROMPT SESSÃO FE-0 — Login Único, Auth e Roteamento por Role

> Esta é a PRIMEIRA sessão frontend. Deve rodar antes de FE-1, FE-2, FE-3 e FE-4.
> Cole este prompt inteiro no Claude Code após `cd frontend && claude`.

---

```
Antes de qualquer ação, leia nesta ordem:

1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/specs/SPEC-FE-AUTH-login-roles.md
3. frontend/docs/tasks/TASK-FE-000-login-auth-routing.md

Confirme que entendeu antes de começar:

MUDANÇAS FUNDAMENTAIS:
- LoginPage deixa de ter abas (SIGL / Câmara) → vira 1 tela com CPF + Senha
- Endpoint único: POST /auth/login com { cpf, password }
- authType deixa de existir em todo o codebase
- SiglRole e CamaraRole são removidos
- TenantUserRole tem 3 valores: ADMIN_STAFF | STAFF | PARLIAMENTARIAN
- O FRONTEND decide qual view renderizar baseado no role retornado pelo backend

ROTEAMENTO:
- StaffRoute: protege rotas de ADMIN_STAFF e STAFF
- ParlamentarRoute: protege rotas de PARLIAMENTARIAN
- ADMIN_STAFF e STAFF → vai para '/' (Dashboard) com StaffLayout (sidebar completa)
- PARLIAMENTARIAN → vai para '/parlamentar/perfil' com ParlamentarLayout (menu próprio)
- Cruzamento de views é bloqueado: parlamentar que tenta acessar '/' é redirecionado

DOIS LAYOUTS:
- StaffLayout: sidebar com Atividade Legislativa + Estrutura da Câmara + Gestão
  Menu "Usuários" visível apenas para ADMIN_STAFF
- ParlamentarLayout: header com foto/nome, sidebar enxuta (Perfil/Matérias/Comissões/Mandato/Filiação)

LIMPEZA OBRIGATÓRIA:
- authType, loginSigl, loginCamara, SiglRole, CamaraRole, MasterRoute,
  showAdministrativo, ProtectedRoute (legado) → TODOS REMOVIDOS

NÃO execute nada ainda. Aguarde minha confirmação do resumo.

---

Após confirmação, execute em ordem:

FASE 1 — Tipos (T-01):
- Reescrever types/auth.ts: AuthUser, LoginRequest, LoginResponse
- Remover SiglRole, CamaraRole, AuthType

FASE 2 — API de auth (T-02 a T-03):
- Remover authType do api/client.ts
- Substituir loginSigl/loginCamara por login(cpf, password) → POST /auth/login

FASE 3 — AuthContext (T-04):
- Reescrever AuthContext com login(), logout(), isAdminStaff, isStaff, isParliamentarian
- Sem authType em nenhum lugar

FASE 4 — Guards de rota (T-05 a T-07):
- Criar StaffRoute.tsx (permite ADMIN_STAFF e STAFF)
- Criar ParlamentarRoute.tsx (permite apenas PARLIAMENTARIAN)
- Criar AdminRoute.tsx (permite apenas ADMIN_STAFF — para /usuarios)
- Remover MasterRoute e ProtectedRoute legados

FASE 5 — LoginPage (T-08):
- Reescrever com InputMask CPF + Password PrimeReact
- Sem abas TabView
- Erro exibido inline com <Message>, não toast
- Após login: redirecionar por role

FASE 6 — Dois Layouts (T-09 a T-10):
- Criar ParlamentarLayout.tsx com header (foto + nome) e sidebar enxuta
- Atualizar Layout.tsx (StaffLayout): remover showAdministrativo e authType
  Menu Usuários: visível apenas para isAdminStaff

FASE 7 — App.tsx (T-11):
- Reescrever com duas árvores de rotas separadas
- Manter redirects legados de URL

FASE 8 — Pages do Parlamentar (T-12 a T-16):
- Criar ParlamentarPerfilPage (foto + dashboard pessoal)
- Criar ParlamentarMateriasPage (matérias onde tem participação)
- Criar ParlamentarComissoesPage
- Criar ParlamentarMandatoPage
- Criar ParlamentarFiliacaoPage

FASE 9 — navigation.ts (T-17):
- Criar STAFF_NAV_GROUPS e PARLAMENTAR_NAV_ITEMS
- Remover qualquer filtro por authType

FASE 10 — Limpeza (T-18):
Rodar: grep -r "authType\|loginSigl\|loginCamara\|SiglRole\|CamaraRole\|MasterRoute\|showAdministrativo" src/
Resultado deve ser VAZIO.
Se ainda houver ocorrências: remover todas antes de finalizar.

AO FINAL:
- Marcar todos os itens T-01 a T-18 como [x] no TASK-FE-000
- Rodar: npm run build → zero erros TypeScript
- Verificar: login com CPF + Senha funciona para cada role

REGRAS DESTA SESSÃO:
- authType não pode aparecer em nenhum arquivo novo
- Erros de login: inline com <Message severity="error">, nunca toast
- Redirect de role cruzado deve ser silencioso (replace: true)
- CPF deve usar InputMask da PrimeReact com máscara 999.999.999-99
- Perguntar antes de qualquer decisão não coberta na spec
```
