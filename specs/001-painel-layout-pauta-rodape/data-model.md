# Data Model: 001-painel-layout-pauta-rodape

Nenhuma entidade persistida nova. O painel consome modelos já existentes.

## Entidades de leitura (inalteradas)

### SessaoPlenaria (detalhe)

- `id`, `nome` / label de sessão, status, itens de pauta via API já usada pelo painel.

### PautaItemDetalhe

- `id`, ordem, rótulo (`pautaItemRotulo`), categoria (`MATERIA` filtrada no carrossel).
- Destaque opcional: `itemDestacadoId`.

### Councilor (elenco do painel)

- `id`, `name`, `party`, `photoUrl`, presença (`present` / status), cargo de mesa quando aplicável.
- Fonte: `usePainelElenco` + updates de presença em tempo real.

## Regras de apresentação (UI)

| Regra | Origem |
|-------|--------|
| Só matérias na faixa de pauta | filtro `resolvePautaCategoria === 'MATERIA'` (já existe) |
| ≤6 itens → uma página | FR-006 |
| >6 → páginas de 6 | Assumption da spec |
| Contadores presentes/ausentes | derivados da lista de `vereadores` |

## Estado de transição

N/A — sem máquina de estados nova. Fase da sessão (início / votação) permanece no realtime existente; esta spec só altera o layout da fase de início (`PainelInicioSessao`).
