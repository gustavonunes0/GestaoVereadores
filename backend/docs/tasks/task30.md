Agenda Legislativa — Task 30 — Base da Agenda Legislativa



Módulo: `src/legislativo/agenda-legislativa`



## Objetivo



Organizar eventos legislativos como calendário operacional da Câmara.



## Regras



- Agenda pertence ao **tenant** (`tenantId` + `tenantWhere`).

- Tipos de evento: **SESSAO**, **REUNIAO**, **AUDIENCIA**, **EVENTO**, **COMPROMISSO**.

- Campos: `tipo`, `numero`, `titulo`, `dataInicio`, `dataFim`, `mensagem`.

- `dataFim` não pode ser anterior a `dataInicio`.

- Soft delete via `isRemoved`.

- Referências a sessão, comissão, frente ou matéria — **futuro** (fora desta task).



## Endpoints



| Método | Rota | Descrição |

|--------|------|-----------|

| GET | `/legislative/agenda-legislativa/tipos` | Catálogo de tipos |

| GET | `/legislative/agenda-legislativa` | Lista paginada (filtro por tipo e período) |

| GET | `/legislative/agenda-legislativa/:id` | Detalhe |

| POST | `/legislative/agenda-legislativa` | Criar evento |

| PATCH | `/legislative/agenda-legislativa/:id` | Atualizar |

| DELETE | `/legislative/agenda-legislativa/:id` | Remover (soft) |



Query de listagem: `tipo`, `dataInicioDe`, `dataInicioAte`, `page`, `limit`.



## Critério de aceite



- [x] Agenda isolada por tenant

- [x] Tipos: sessão, reunião, audiência, evento, compromisso

- [x] Calendário com dataInicio/dataFim e validação

- [x] CRUD completo com paginação e filtros

- [x] Soft delete

- [x] Base preparada para vínculos futuros (sem FKs nesta task)


