# PROMPTS-FRONTEND — Claude Code

Cole o prompt da sessão correspondente no Claude Code.
Sempre rodar `cd frontend` antes de iniciar o Claude Code para o frontend.

---

## PROMPT SESSÃO FE-1 — Fundação (TASK-FE-001)

```
Antes de qualquer ação, leia nesta ordem:

1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-001-fundacao.md

Confirme que entendeu antes de começar:
- Stack: React 19 + TypeScript + Vite 6 + PrimeReact 10
- Que chamadas HTTP ficam APENAS em api/ — nunca em componentes
- Que api/paths.ts é a fonte única de todas as URLs
- Que apiFormData() ainda não existe e precisa ser criado
- Que TenantUserRole tem 3 valores: ADMIN_STAFF, STAFF, PARLIAMENTARIAN
- Que canEdit e canDelete são apenas ADMIN_STAFF (Staff pode criar mas não editar/deletar)
- Que canVotar é exclusivo do PARLIAMENTARIAN
- Que status PROTOCOLADA e EM_PAUTA precisam ser adicionados em types/legislative.ts
- Que todas as 16 rotas devem ser lazy-loaded com React.lazy()

NÃO execute nada ainda. Aguarde minha confirmação do resumo.

---

Após confirmação, execute em ordem:

FASE 1 — Tipos (T-01 a T-03):
- Atualizar types/auth.ts com TenantUserRole
- Atualizar types/legislative.ts com PROTOCOLADA, EM_PAUTA, SESSAO_STATUS, NORMA_STATUS
- Criar types/api.ts com PaginatedResponse e ApiError

FASE 2 — Camada API (T-04 a T-11):
- Adicionar apiFormData() em api/client.ts
- Adicionar novos paths em api/paths.ts
- Criar api/normas.api.ts (extrair de NormasPage)
- Criar api/atos.api.ts (extrair de AtosPage)
- Criar api/autores-externos.api.ts (novo endpoint backend)
- Atualizar api/legislative/materias.api.ts com tramitar, adicionarAutor, addPublicacao
- Atualizar api/legislative/sessoes.api.ts com abrir, suspender, encerrar, cancelar, quorum
- Exportar novos módulos em api/index.ts

FASE 3 — Hooks (T-12 a T-13):
- Atualizar hooks/usePermissions.ts com nova lógica de roles
- Atualizar hooks/useDominios.ts com novos lookups

FASE 4 — Componentes comuns (T-14 a T-17):
- Criar components/common/FiltroLayout.tsx
- Criar components/common/DataTableLayout.tsx
- Criar components/common/DeleteDialog.tsx
- Criar components/common/VerDialog.tsx

FASE 5 — Lazy loading (T-18):
- Converter todas as 16 rotas em App.tsx para React.lazy()

AO FINAL:
- Marcar todos os itens T-01 a T-18 como [x] no TASK-FE-001
- Rodar: npm run build (deve ter zero erros TypeScript)

REGRAS DESTA SESSÃO:
- Nunca hardcodar URL como string — sempre usar API_PATHS
- Sem any em TypeScript
- Todos os componentes com props tipadas
- Mensagens de UI em português brasileiro
- Perguntar se algo não estiver coberto nos docs
```

---

## PROMPT SESSÃO FE-2 — Matérias (TASK-FE-002)

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-002-004-materias-sessoes-normas-atos.md
   (seção TASK-FE-002)

Confirme que entendeu:
- FiltroLayout e DataTableLayout já existem (TASK-FE-001 concluída)
- Identificação da matéria vem do campo materia.identificacao ("PLO nº 3/2025")
- Campo Autor é dinâmico: Parlamentar → Dropdown parlamentares / AutorExterno → Dropdown autores externos
- Parlamentar logado → autorParliamentarianId preenchido do JWT, campo desabilitado
- Upload de Texto Original via apiFormData() (não json)
- Múltiplos relatores via MultiSelect (não campo único)
- Editar e Deletar: apenas canEdit (ADMIN_STAFF)
- Dialog Ver deve mostrar histórico de tramitação em Timeline PrimeReact

Execute as 7 fases da TASK-FE-002 em sequência.
Ao final: marcar todos os itens como [x] e rodar npm run build.

REGRAS:
- Usar FiltroLayout para filtros (não criar card customizado)
- Usar DataTableLayout com size="small"
- Todos os botões de ícone com aria-label
- Grid responsivo col-12 md:col-6 lg:col-4 nos filtros
```

---

## PROMPT SESSÃO FE-3 — Sessões, Votações, Normas e Atos (TASK-FE-003 + FE-004)

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-002-004-materias-sessoes-normas-atos.md
   (seções TASK-FE-003 e TASK-FE-004)

Confirme que entendeu:
- SessoesPage: botões mudam conforme statusSessao (AGENDADA/ABERTA/SUSPENSA/etc.)
- canManageSessao → ADMIN_STAFF e STAFF podem abrir/encerrar sessões
- canVotar → apenas PARLIAMENTARIAN registra voto
- Votação SECRETA nunca exibe nomes dos votantes (apenas contadores)
- Contadores de voto vêm do backend (nunca calcular no frontend)
- NormasPage: usar normasApi (não chamadas inline)
- NormasPage: status da norma é derivado (statusDerived vem do backend)
- AtosPage: usar atosApi, campo dataAto (não dataInicio)
- Upload de arquivo em Norma (Texto Integral, Áudio) e Ato (Anexo) via apiFormData()

Execute TASK-FE-003 completa, depois TASK-FE-004 completa.
Ao final: marcar todos os itens como [x] e rodar npm run build.
```

---

## PROMPT SESSÃO FE-4 — Autores Externos, Agenda e Correções (TASK-FE-005 + FE-006)

```
Leia antes de começar:
1. frontend/docs/CLAUDE-FRONTEND.md
2. frontend/docs/architecture/PATTERNS-FE.md
3. frontend/docs/tasks/TASK-FE-005-006-autores-agenda-roles.md

Confirme que entendeu:
- AutoresPage migra de GuestUser para AutorExterno (entidade nova do backend)
- Formulário de AutorExterno tem campos DINÂMICOS por categoria (A/B/C/D)
- Categoria A (entidade coletiva): apenas nome — sem cargo/CPF/registro
- Categoria B (cargo + pessoa): nome + cargo + instituição + contatos
- Categoria C (profissional liberal IDs 13,15): adiciona campo registro (OAB/CRM)
- Categoria D (político externo IDs 23,24): adiciona partido + uf
- UF visível apenas para Deputado Federal (ID 23)
- canManagePessoas → apenas ADMIN_STAFF pode criar/editar/deletar AutorExterno
- AgendaPage: adicionar campo Local e vínculo com SessaoPlenaria
- UsuariosPage: role exibido como ADMIN_STAFF/STAFF/PARLIAMENTARIAN
- Remover ContextBanner das 5 páginas que ainda usam
- FrentesPage: completar com Editar e Deletar

Execute TASK-FE-005 completa, depois TASK-FE-006.
Ao final:
- Marcar todos os itens como [x]
- Rodar: npm run build (zero erros)
- Verificar: npm run dev → abrir browser e testar login com cada perfil
```

---

## Ordem global das sessões frontend

```
FE-1 (Fundação)    ← deve ser a primeira sempre
    ↓
FE-2 (Matérias)    ← pode rodar em paralelo com FE-3 e FE-4
FE-3 (Sessões + Normas + Atos)
FE-4 (Autores + Agenda + Correções)
```

## Checklist antes de cada sessão

- [ ] Backend rodando: `docker-compose up -d`
- [ ] API respondendo: `curl http://localhost:3000/api/health`
- [ ] Sessão anterior: `npm run build` sem erros
- [ ] `cd frontend` antes de rodar `claude`
```
