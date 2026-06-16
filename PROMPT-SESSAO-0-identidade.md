# PROMPT SESSÃO 0 — Identidade, Roles e Guards (executar ANTES das outras sessões)

> Copie e cole no Claude Code. Esta sessão deve rodar ANTES das sessões 1–4
> porque define os guards que todos os outros módulos vão usar.

---

```
Antes de qualquer ação, leia os seguintes arquivos nesta ordem:

1. CLAUDE.md
2. backend/docs/architecture/PATTERNS.md
3. backend/docs/specs/identidade/SPEC-006-identidade-roles.md
4. backend/docs/tasks/TASK-006-identidade-roles-guards.md

Após ler, confirme que entendeu:
- Os 3 perfis: ADMIN_STAFF · STAFF · PARLIAMENTARIAN (e por que não há mais booleans)
- Por que AutorExterno NÃO tem TenantUser e NÃO tem acesso ao sistema
- A sequência de guards: JwtAuthGuard → TenantGuard → RolesGuard
- Que RolesGuard lê role do JWT sem query ao banco
- Que Staff pode encerrar sessões (confirmado pelo cliente)
- Que PARLIAMENTARIAN é o único que pode registrar voto
- Que Parlamentar criando matéria tem authorParliamentarianId preenchido do JWT automaticamente

NÃO execute nada ainda. Aguarde minha confirmação do resumo.

---

Após confirmação, execute em ordem:

FASE 1 — Migration M8 (T-01 e T-02):
- Adicionar enum TenantUserRole ao schema.prisma
- Adicionar campo role em TenantUser (nullable primeiro)
- Adicionar @@index([tenantId, role])
- Rodar: npx prisma migrate dev --name add_tenant_user_role
- Executar script SQL de migração dos booleans para o enum
- Verificar: SELECT COUNT(*) FROM tenant_users WHERE role IS NULL deve retornar 0
- Rodar: npx prisma generate && npx tsc --noEmit

FASE 2 — JWT com role (T-03 a T-05):
- Atualizar JwtPayload interface para incluir role e parliamentarianId
- Atualizar AuthService.login() para incluir role no token
- Garantir que @CurrentUser() retorna o payload completo com role

FASE 3 — Guards (T-06 a T-09):
- Criar roles.decorator.ts
- Criar roles.guard.ts
- Criar guard-combos.ts com STAFF_AND_ABOVE, ADMIN_ONLY, ALL_AUTHENTICATED, PARLIAMENTARIAN_ONLY
- Criar src/auth/guards/index.ts para exportar todos os guards

FASE 4 — Aplicar @Roles() nos controllers (T-10 a T-18):
Aplicar em todos os controllers existentes conforme tabela da SPEC-006.
Para cada controller:
  - Adicionar import de Roles, RolesGuard e as constantes de guard-combos
  - Adicionar @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard) onde não existir
  - Adicionar @Roles(...) em cada endpoint conforme a tabela

FASE 5 — Lógica especial do Parlamentar (T-19):
- Ajustar CreateMateriaUseCase para preencher authorParliamentarianId do JWT
  quando user.role === PARLIAMENTARIAN (não aceitar do body)

FASE 6 — Testes (T-20 a T-21):
- Criar roles.guard.spec.ts com os casos da TASK-006
- Rodar: npx jest --testPathPattern=auth

AO FINAL:
- Marcar todos os itens T-01 a T-21 como [x] no TASK-006
- Rodar: npx tsc --noEmit (deve ter zero erros)
- Rodar: npx jest (todos os testes devem passar)

REGRAS DESTA SESSÃO:
- Nunca usar isTenantAdmin, isTenantStaff ou isParliamentarian em código novo
- ForbiddenException sempre com mensagem em português
- Isolamento de tenant é 404 (não 403) — feito no repositório, não no guard
- Endpoints públicos (/public/normas, /public/agenda) não recebem nenhum guard
- Perguntar antes de qualquer decisão não coberta nos docs
```
