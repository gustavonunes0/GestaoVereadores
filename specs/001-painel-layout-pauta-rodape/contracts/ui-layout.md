# UI Contract: Layout inicial do painel público

**Route**: `/sessoes/{sessaoId}/painel`  
**Component**: `PainelInicioSessao` em `frontend/src/components/sessoes/painel/SessaoPainelPage.tsx`  
**Styles**: `.sessao-painel-inicio*` em `frontend/src/styles/sigl-ui-patterns.css`

## Layout regions

```text
┌─────────────────────┬──────────────────────────────────────────┐
│ Mesa diretora       │ Presença dos vereadores                  │
│ (coluna estreita)   │ (flex 1 — grade com mais cards/linha)     │
└─────────────────────┴──────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│ Pauta da sessão (faixa full-width, itens na horizontal)        │
└────────────────────────────────────────────────────────────────┘
```

## Accessibility

| Region | Role / label |
|--------|----------------|
| Mesa | `aria-label="Mesa diretora"` (já existe) |
| Presença | card com totais Presentes / Ausentes |
| Pauta | `aria-label="Pauta da sessão"`; `aria-live="polite"` na página do carrossel |

## Behavioural contract

1. **Topo**: exatamente duas colunas (Mesa | Presença). Pauta **não** ocupa a terceira coluna.
2. **Pauta**: `grid-column` span full width abaixo do topo.
3. **Itens de pauta**: layout horizontal; até 6 por página; truncar títulos longos com ellipsis.
4. **Pauta vazia**: mensagem idle discreta; faixa sem altura excessiva.
5. **Fullscreen 1920×1080**: sem scrollbar na viewport do painel com ~20 vereadores e ≤6 itens.
6. **Realtime**: contadores e selo AO VIVO inalterados (mesmo pipeline de dados).

## Non-goals (out of contract)

- Layout da tela de votação (`VotingPanel`).
- Remoção de mesa duplicada (spec 002).
- Troca automática de etapa (spec 018).
