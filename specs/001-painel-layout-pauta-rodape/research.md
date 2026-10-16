# Research: 001-painel-layout-pauta-rodape

## Decision: Grid CSS 2×1 + faixa de pauta

**Decision**: Trocar `grid-template-columns: mesa | presença | pauta` por:
- área superior: `grid-template-columns: mesa | presença` (2 colunas);
- pauta: `grid-column: 1 / -1` na linha inferior (faixa full-width).

**Rationale**: O JSX já monta Mesa → Presença → Pauta nessa ordem; basta CSS + ajustar o carrossel para lista horizontal. Menor risco vs. reescrever componentes.

**Alternatives considered**:
- Flexbox com `order` — mais frágil em breakpoints.
- Dois wrappers no JSX — desnecessário se o grid cobrir o caso.

## Decision: Paginação horizontal da pauta (até 6 visíveis)

**Decision**: Substituir `PAUTA_CARROSSEL_POR_PAGINA = 3` (slides verticais) por faixa horizontal com até **6** itens por página; se `total > 6`, manter carrossel/dots com intervalo atual (8s).

**Rationale**: Spec FR-006 / SC (até 6 sem paginação). O carrossel atual já tem timer e dots.

**Alternatives considered**:
- Scroll horizontal sem página — conflita com “tela cheia sem rolagem”.
- Sempre mostrar todos — quebra projeção com pautas longas.

## Decision: Altura da presença acompanha conteúdo

**Decision**: Remover / evitar `align-items: stretch` forçando altura fixa no card de presença; usar `align-items: start` no grid superior ou `height: auto` / `min-height: 0` na grade, sem faixa vazia grande abaixo dos cards.

**Rationale**: FR-005 / SC-002.

## Decision: Colunas da grade de presença

**Decision**: Aumentar colunas da grade (ex.: `repeat(auto-fill, minmax(...))` ou 6 colunas em 1920) sem distorcer avatar/nome. Valor exato na implementação visual.

**Rationale**: Spec assume decisão de layout na implementação; exige aproveitar largura.

## Decision: Sem backend

**Decision**: Nenhuma mudança de API, WebSocket ou elenco.

**Rationale**: Dados e realtime já existem; só composição visual.
