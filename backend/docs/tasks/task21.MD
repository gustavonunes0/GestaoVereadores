Task 21 — Tramitação básica de Matéria



Módulo: `src/legislativo/materias`



## Objetivo



Fluxo mínimo de tramitação: status só muda por **ações explícitas**, não por update genérico.



## Status



| Valor | Label |

|-------|-------|

| `DRAFT` | Rascunho |

| `PROTOCOLADA` | Protocolada |

| `EM_TRAMITACAO` | Em tramitação |

| `EM_PAUTA` | Em pauta |

| `APROVADA` | Aprovada |

| `REJEITADA` | Rejeitada |

| `ARQUIVADA` | Arquivada |

| `RETIRADA` | Retirada |

| `TRANSFORMADA_EM_NORMA` | Transformada em norma |



Matérias novas iniciam em **DRAFT**.



## Ações de tramitação



| Ação | De | Para |

|------|-----|------|

| `PROTOCOLAR` | DRAFT | PROTOCOLADA |

| `INICIAR_TRAMITACAO` | PROTOCOLADA | EM_TRAMITACAO |

| `COLOCAR_EM_PAUTA` | EM_TRAMITACAO | EM_PAUTA |

| `RETIRAR_DA_PAUTA` | EM_PAUTA | EM_TRAMITACAO |

| `APROVAR` | EM_TRAMITACAO, EM_PAUTA | APROVADA |

| `REJEITAR` | EM_TRAMITACAO, EM_PAUTA | REJEITADA |

| `ARQUIVAR` | DRAFT, PROTOCOLADA, EM_TRAMITACAO, EM_PAUTA, APROVADA, REJEITADA, RETIRADA | ARQUIVADA |

| `RETIRAR` | EM_TRAMITACAO, EM_PAUTA | RETIRADA |

| `REINICIAR_TRAMITACAO` | RETIRADA | EM_TRAMITACAO |

| `TRANSFORMAR_EM_NORMA` | APROVADA | TRANSFORMADA_EM_NORMA |



## Endpoints



- `GET /legislative/materias/:id/tramitacao/acoes` — ações disponíveis para a matéria

- `POST /legislative/materias/:id/tramitacao` — executa tramitação (`action`, `observacao?`)

- `PATCH /legislative/materias/:id` — **não** aceita `status` nem `emTramitacao`



Integração com sessões plenárias (`sessoes-plenarias`): inclusão/remoção de pauta e resultados de votação usam `tramitarMateria` internamente.



## Critério de aceite



- [x] Status muda por use cases de tramitação, não por update genérico

- [x] Histórico registrado em `tramitacaoJson`

- [x] Sessões plenárias disparam ações (`COLOCAR_EM_PAUTA`, `APROVAR`, `REJEITAR`, `RETIRAR_DA_PAUTA`)


