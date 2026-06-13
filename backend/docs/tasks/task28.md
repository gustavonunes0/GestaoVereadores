Task 28 — Regra de geração de Norma



Módulo: `src/controle-juridico/normas`



## Objetivo



Formalizar quando uma matéria pode gerar norma.



## Regras



- Norma pertence ao tenant (escopo em create/update/list).

- Norma pode ter `materiaOrigemId` (opcional).

- Matéria de origem deve pertencer ao **mesmo tenant** (`MateriaOrigemValidator` + `tenantWhere`).

- Matéria precisa estar **APROVADA** (`MATERIA_ORIGEM_STATUSES_PERMITIDOS`).

- Não gerar norma de matéria **REJEITADA**, **ARQUIVADA** ou **RETIRADA** (nem em tramitação, rascunho, etc.).



## Implementação



| Camada | Arquivo |

|--------|---------|

| Política de domínio | `domain/policies/norma-materia-origem.policy.ts` |

| Integração Prisma | `infra/integrations/materia-origem-validator.ts` |

| Use cases | `create-norma.use-case.ts`, `update-norma.use-case.ts` |

| Erros | `MateriaOrigemNotFoundError` (404), `MateriaNaoPodeGerarNormaError` (400) |



Fluxo ao informar `materiaOrigemId` (criar ou atualizar):



1. Buscar matéria no tenant atual.

2. Se não existir → `MateriaOrigemNotFoundError`.

3. Validar status com `assertMateriaOrigemPodeGerarNorma`.

4. Se bloqueada → `MateriaNaoPodeGerarNormaError`.



## Critério de aceite



- [x] Norma valida matéria de origem antes de criar

- [x] Norma valida matéria de origem antes de atualizar vínculo

- [x] Matéria de outro tenant rejeitada

- [x] Matéria rejeitada/arquivada/retirada bloqueada

- [x] Apenas matéria APROVADA permitida


