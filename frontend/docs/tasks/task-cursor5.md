# Task: Redesign geral do layout — paleta e visual

## Objetivo
Aplicar uma paleta coerente e refinada em todo o layout da aplicação, mantendo a mesma linha institucional da sidebar (opção 2 aprovada): tons frios e dessaturados, sem cores intensas.

---

## Tokens de cor — adicionar no arquivo de variáveis globais

```css
/* ── Layout geral ── */
--page-bg:              #f5f6f8;   /* fundo da área de conteúdo */
--topbar-bg:            #ffffff;
--topbar-border:        #eef0f3;

/* Cards e painéis */
--card-bg:              #ffffff;
--card-border:          #eef0f3;
--card-shadow:          0 1px 3px rgba(0, 0, 0, 0.04);
--card-radius:          10px;

/* Inputs e selects */
--input-bg:             #fafbfc;
--input-border:         #dde2ea;
--input-border-focus:   #2563a8;
--input-placeholder:    #b0bac8;

/* Tipografia */
--text-heading:         #1c2f4a;   /* títulos de page */
--text-body:            #374151;   /* texto principal */
--text-muted:           #8492a6;   /* labels, textos secundários */
--text-placeholder:     #b0bac8;

/* Accent institucional — coerente com a sidebar */
--accent:               #2563a8;   /* botões primários, links ativos */
--accent-hover:         #1d4f8a;
--accent-icon:          #4a7ab5;   /* ícones de page header */

/* Tabela */
--table-header-bg:      #f8f9fb;
--table-header-text:    #8492a6;
--table-border:         #eef0f3;
--table-row-hover:      #f5f7fb;

/* Paginação */
--pagination-btn-bg:    #f0f4fa;
--pagination-btn-text:  #4a7ab5;
```

---

## Tailwind — adicionar no `tailwind.config.js`

```js
theme: {
  extend: {
    colors: {
      page:    '#f5f6f8',
      card:    '#ffffff',
      accent:  '#2563a8',
      'accent-icon': '#4a7ab5',
      heading: '#1c2f4a',
      muted:   '#8492a6',
      border:  '#eef0f3',
      input:   '#fafbfc',
      'input-border': '#dde2ea',
    },
    boxShadow: {
      card: '0 1px 3px rgba(0,0,0,0.04)',
    },
    borderRadius: {
      card: '10px',
    },
  }
}
```

---

## 1. Fundo da página (`<main>` / área de conteúdo)

```css
/* ANTES */
background: #f3f4f6;

/* DEPOIS */
background: var(--page-bg); /* #f5f6f8 — levemente azulado, coerente com sidebar */
```

Tailwind: `bg-[#f5f6f8]` ou `bg-page`

---

## 2. Topbar (barra superior com seletor de legislatura)

```css
.topbar {
  background: var(--topbar-bg);          /* #ffffff */
  border-bottom: 1px solid var(--topbar-border); /* #eef0f3 */
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Seletor de legislatura

```css
/* ANTES — select nativo sem estilo */

/* DEPOIS */
.legislature-select {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-body);
  padding: 4px 10px;
  cursor: pointer;
}

.legislature-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
```

### Botão Sair

```css
/* ANTES — texto simples "→ Sair" */

/* DEPOIS — ícone MUI + texto muted */
.btn-sair {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
}
.btn-sair:hover { color: var(--text-body); }
```

```tsx
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';

<button className="btn-sair">
  <LogoutOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
  Sair
</button>
```

---

## 3. Cards (filtros, tabela, painéis)

```css
/* ANTES */
background: #ffffff;
border: 1px solid #e5e7eb;
/* sem sombra */

/* DEPOIS */
background: var(--card-bg);
border: 1px solid var(--card-border);   /* #eef0f3 — mais suave */
box-shadow: var(--card-shadow);          /* 0 1px 3px rgba(0,0,0,.04) */
border-radius: var(--card-radius);       /* 10px */
```

Tailwind: `bg-white border border-[#eef0f3] shadow-card rounded-[10px]`

---

## 4. Inputs, Dropdowns e Calendars

```css
/* ANTES */
background: #ffffff;
border: 1px solid #d1d5db;

/* DEPOIS */
background: var(--input-bg);             /* #fafbfc — levemente off-white */
border: 1px solid var(--input-border);   /* #dde2ea */
border-radius: 6px;
color: var(--text-body);
font-size: 13px;
}

/* Placeholder */
::placeholder {
  color: var(--input-placeholder);       /* #b0bac8 */
}

/* Focus */
:focus {
  border-color: var(--input-border-focus); /* #2563a8 */
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 168, 0.12);
}
```

> Aplicar também nos overrides do PrimeReact: `.p-inputtext`, `.p-dropdown`, `.p-calendar input`

---

## 5. Botão primário (Pesquisar, Nova Matéria, Salvar)

```css
/* ANTES */
background: #1e293b;  /* azul-escuro sem relação com o restante */

/* DEPOIS */
background: var(--accent);              /* #2563a8 — mesmo tom do active da sidebar */
color: #ffffff;
border: none;
border-radius: 7px;
padding: 8px 16px;
font-size: 13px;
font-weight: 500;
display: flex;
align-items: center;
gap: 6px;
cursor: pointer;
transition: background 0.12s;
}

.btn-primary:hover {
  background: var(--accent-hover);      /* #1d4f8a */
}
```

Tailwind: `bg-[#2563a8] hover:bg-[#1d4f8a] text-white rounded-[7px] px-4 py-2 text-[13px] font-medium`

---

## 6. Botão secundário (Limpar)

```css
background: transparent;
color: var(--text-muted);
border: 1px solid var(--input-border);
border-radius: 7px;
padding: 8px 14px;
font-size: 13px;
cursor: pointer;
transition: background 0.12s, color 0.12s;
}

.btn-secondary:hover {
  background: var(--page-bg);
  color: var(--text-body);
}
```

---

## 7. PageHeader — título e ícone

```css
/* Título */
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-heading);      /* #1c2f4a */
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Ícone ao lado do título — usar MUI Icons */
.page-title-icon {
  color: var(--accent-icon);       /* #4a7ab5 */
  font-size: 24px !important;      /* sx={{ fontSize: 24 }} */
}
```

```tsx
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';

<PageHeader
  icon={<DescriptionOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
  title="Matérias e Proposições"
  actions={<Button label="Nova Matéria" ... />}
/>
```

---

## 8. DataTable

```css
/* Cabeçalho da tabela */
.p-datatable-thead > tr > th {
  background: var(--table-header-bg);   /* #f8f9fb */
  color: var(--table-header-text);      /* #8492a6 */
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--table-border);
  padding: 10px 14px;
}

/* Linhas */
.p-datatable-tbody > tr > td {
  font-size: 13px;
  color: var(--text-body);
  border-bottom: 1px solid var(--table-border);
  padding: 10px 14px;
}

/* Hover na linha */
.p-datatable-tbody > tr:hover {
  background: var(--table-row-hover);   /* #f5f7fb */
}

/* Empty state */
.p-datatable-emptymessage td {
  color: var(--text-placeholder);
  text-align: center;
  padding: 32px;
  font-size: 13px;
}
```

---

## 9. Paginação

```css
.p-paginator {
  background: var(--card-bg);
  border-top: 1px solid var(--table-border);
  padding: 8px 14px;
}

.p-paginator .p-paginator-element {
  background: var(--pagination-btn-bg);   /* #f0f4fa */
  color: var(--pagination-btn-text);      /* #4a7ab5 */
  border: none;
  border-radius: 6px;
  min-width: 32px;
  height: 32px;
  font-size: 13px;
  transition: background 0.12s;
}

.p-paginator .p-paginator-element:hover {
  background: #dde8f5;
}

.p-paginator .p-highlight {
  background: var(--accent);
  color: #ffffff;
}
```

---

## 10. Labels e textos de seção

```css
/* ANTES — tudo em maiúsculo, letras apertadas */
text-transform: uppercase;
font-size: 9px;

/* DEPOIS — sentence case, mais legível */
.section-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  /* sem uppercase */
}
```

> Aplicar no cabeçalho da coluna "AÇÕES" → "Ações" (sentence case)

---

## Checklist

### Tokens
- [ ] Variáveis CSS adicionadas no arquivo global
- [ ] Cores do `tailwind.config.js` atualizadas

### Fundo e estrutura
- [ ] `<main>` com `background: var(--page-bg)` (`#f5f6f8`)
- [ ] Topbar com `background: #fff` e `border-bottom: 1px solid #eef0f3`
- [ ] Seletor de legislatura com estilo `input-bg` + `input-border`
- [ ] Botão "Sair" com ícone `LogoutOutlined` do MUI + cor muted

### Cards
- [ ] Todos os cards com `border: 1px solid #eef0f3` + `box-shadow: 0 1px 3px rgba(0,0,0,.04)`
- [ ] `border-radius: 10px` em todos os cards

### Inputs
- [ ] `background: #fafbfc` em InputText, Dropdown, Calendar
- [ ] `border: 1px solid #dde2ea` em todos os inputs
- [ ] Focus ring `box-shadow: 0 0 0 3px rgba(37,99,168,.12)` + `border-color: #2563a8`

### Botões
- [ ] Primário: `background: #2563a8` (substituindo `#1e293b`)
- [ ] Hover primário: `background: #1d4f8a`
- [ ] Secundário: border `#dde2ea`, texto muted
- [ ] `border-radius: 7px` em todos os botões

### PageHeader
- [ ] Título com `color: #1c2f4a` e `font-size: 20px`
- [ ] Ícone MUI com `color: #4a7ab5` e `fontSize: 24`

### DataTable
- [ ] Header: `background: #f8f9fb`, texto `#8492a6`, uppercase 11px
- [ ] Rows: `border-bottom: 1px solid #eef0f3`, hover `#f5f7fb`
- [ ] Paginação: botões `#f0f4fa` / `#4a7ab5`, ativo `#2563a8`
- [ ] "AÇÕES" → "Ações" (sentence case)

## O que NÃO alterar
- Estrutura HTML/JSX dos componentes
- Lógica de negócio e estado
- Largura da sidebar e do layout
- Logo e identidade da Câmara