# Spec — Painel Eletrônico de Votação (Câmara Municipal)

> Nota: como não recebi o repositório/stack do projeto, esta spec é
> **framework-agnóstica** (HTML/CSS/JS puro, fácil de portar para React/Vue).
> Se o projeto já usa um stack específico (ex: React + Tailwind, Vue,
> Next.js), me diga e eu adapto os nomes de componentes e convenções antes
> de gerar o código.

## 1. Objetivo

Reproduzir, em componente web, o layout de um painel de votação eletrônico
de plenário (estilo placar de LED preto), como referência da imagem
fornecida (Câmara Municipal de Aracoiaba). O painel deve exibir:

- Cabeçalho com nome da instituição
- Presidente da Câmara em destaque
- Lista de vereadores da mesa diretora (coluna esquerda)
- Lista dos demais vereadores (coluna direita)
- Rodapé com relógio/data, contadores de voto (SIM/NÃO/ABS) e
  estatísticas (parlamentares/ausentes/presentes)

## 2. Design tokens

```css
:root {
  --panel-bg: #000000;
  --panel-border: #2a2a2a;
  --title-yellow: #f5e400;
  --divider-white: #ffffff;
  --name-red: #ff3b30;      /* nomes dos vereadores (colunas L/R) */
  --name-cyan: #4fd8ff;     /* nome do presidente / "presentes" */
  --party-yellow: #f5e400;
  --sim-green: #2ecc40;
  --nao-orange: #ff8c1a;
  --abs-yellow: #ffd400;
  --footer-strip: #cdb9e8;  /* faixa lilás separadora */
  --clock-white: #ffffff;
  --font-display: 'Arial Black', 'Helvetica Neue', sans-serif;
}
```

- Fonte condensada/bold em caixa alta, estilo painel de LED.
- Círculos indicadores (voto/presença): `border-radius: 50%`, borda
  colorida, preenchimento sólido quando "aceso" (verde = presente/votou
  sim, vermelho = não, apagado = ausente/sem voto).

## 3. Estrutura do layout (regiões)

```
┌───────────────────────────────────────────────────────────┐
│ HEADER: "CÂMARA MUNICIPAL DE {MUNICIPIO}"        (amarelo) │
├───────────────────────────────────────────────────────────┤
│ PRESIDENTE: ○ NOME                              SIGLA      │
├───────────────────────────────────────────────────────────┤
│ COLUNA ESQUERDA (mesa)     │  COLUNA DIREITA (vereadores)  │
│ ○ CARGO  NOME      SIGLA   │  ○ NOME              SIGLA    │
│ ...                        │  ...                          │
├───────────────────────────────────────────────────────────┤
│ [faixa separadora lilás]                                    │
├──────────────┬──────┬──────┬──────┬─────────────────────────┤
│ HH:MM:SS     │ SIM  │ NÃO  │ ABS  │ PARLAMENTARES   11       │
│ DD/MM/AAAA   │  0   │  0   │  0   │ AUSENTES        10       │
│              │      │      │      │ PRESENTES       01       │
└──────────────┴──────┴──────┴──────┴─────────────────────────┘
```

## 4. Componentes sugeridos

- `<VotingPanel>` — container raiz (grid, fundo preto, borda arredondada)
  - `<PanelHeader title />`
  - `<PresidentRow name party status />`
  - `<CouncilorColumn side="left" members[] />`
  - `<CouncilorColumn side="right" members[] />`
  - `<FooterStrip />`
  - `<VoteFooter>`
    - `<ClockBlock time date />`
    - `<VoteCounter label="SIM" color="green" value />`
    - `<VoteCounter label="NÃO" color="orange" value />`
    - `<VoteCounter label="ABS" color="yellow" value />`
    - `<StatsBlock parlamentares ausentes presentes />`

## 5. Modelo de dados

```ts
interface Councilor {
  id: string;
  name: string;
  party: string;          // sigla, ex: "PP", "PSB"
  role?: 'PRESIDENTE' | 'VICE' | '1SEC' | '2SEC'; // opcional
  status: 'ausente' | 'presente' | 'sim' | 'nao' | 'abstencao';
  side: 'left' | 'right';
}

interface PanelState {
  institutionName: string;
  president: Councilor;
  councilors: Councilor[];   // demais membros, com `side`
  clock: string;             // HH:MM:SS, atualizado a cada segundo
  date: string;               // DD/MM/AAAA
  votes: { sim: number; nao: number; abs: number };
  stats: { parlamentares: number; ausentes: number; presentes: number };
}
```

## 6. Comportamento / regras

1. **Relógio**: atualizar `clock` a cada 1s (setInterval no client), formato
   `HH:MM:SS` 24h.
2. **Indicador circular** de cada vereador reflete `status`:
   - `ausente` → círculo apagado (cor de borda apenas)
   - `presente` → círculo aceso azul/branco
   - `sim` → círculo aceso verde
   - `nao` → círculo aceso vermelho/laranja
   - `abstencao` → círculo aceso amarelo
3. **Contadores SIM/NÃO/ABS** = soma reativa de `status` de todos os
   vereadores (derivado, não hardcoded).
4. **Presentes/Ausentes** = derivado de `status !== 'ausente'`.
5. Nome do **presidente** sempre em `--name-cyan`; demais nomes em
   `--name-red`.
6. Layout deve manter proporção 16:9 aproximada (referência do painel
   físico) e ser responsivo (`clamp()` para tamanhos de fonte).

## 7. Acessibilidade

- Cores não devem ser o único indicador de status: usar `aria-label`
  (“Presente”, “Votou sim” etc.) em cada círculo.
- Contraste alto já é natural pelo estilo (texto claro em fundo preto).
- `role="status"` + `aria-live="polite"` no bloco de contadores SIM/NÃO/ABS
  para leitores de tela acompanharem mudanças em tempo real.

## 8. Estrutura de arquivos sugerida

```
/src
  /components
    VotingPanel.tsx
    PanelHeader.tsx
    PresidentRow.tsx
    CouncilorColumn.tsx
    CouncilorRow.tsx
    VoteFooter.tsx
    ClockBlock.tsx
    VoteCounter.tsx
    StatsBlock.tsx
  /styles
    votingPanel.css        (ou módulo/tailwind config)
  /data
    mockCouncilors.ts
  /hooks
    useClock.ts
    useVoteTally.ts
```

## 9. Critérios de aceite

- [ ] Layout reproduz fielmente as 3 regiões (header, corpo em 2 colunas,
      rodapé com 2 sub-blocos).
- [ ] Cores batem com os tokens definidos na seção 2.
- [ ] Relógio funcional, atualizando em tempo real.
- [ ] Contadores derivados corretamente do array de vereadores (não fixos).
- [ ] Responsivo: legível em telas de 1920×1080 (uso real em painel de TV)
      e degrada bem em telas menores (preview em desktop/mobile).
- [ ] Círculos indicadores mudam de cor conforme `status`.
- [ ] Nenhuma marca/nome real de terceiros hardcoded como dado de exemplo
      fora do mock de desenvolvimento.

---

**Para usar no Cursor**: cole este arquivo na raiz do projeto (ex.:
`SPEC.md`) e peça para o agente implementar seção por seção, começando
pela estrutura de componentes (seção 4) e o modelo de dados (seção 5),
depois estilizando com os tokens (seção 2) e por fim ligando o
comportamento dinâmico (seção 6).
