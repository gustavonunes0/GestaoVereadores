# Cursor Frontend Pack — SIGL

Este pacote contém os arquivos alinhados para o Cursor trabalhar melhor no frontend do SIGL.

## Como aplicar

Extraia o ZIP dentro da raiz do projeto `frontend`.

A estrutura esperada ficará assim:

```txt
frontend/
├── .cursorrules
├── docs/
│   └── CURSOR_FRONTEND_CONTEXT.md
└── src/
    └── styles/
        ├── prime-theme-tokens.css
        └── prime-overrides.css
```

## Depois de extrair

Instale PrimeReact e PrimeIcons:

```bash
npm install primereact primeicons
```

No `src/main.tsx`, confirme se existem estes imports:

```tsx
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './styles/prime-theme-tokens.css';
import './styles/prime-overrides.css';
import './index.css';
```

E confirme se o `App` está envolvido pelo provider:

```tsx
<PrimeReactProvider value={{ ripple: true }}>
  <App />
</PrimeReactProvider>
```

## Arquivos do pacote

- `.cursorrules`: regras curtas e obrigatórias para o Cursor.
- `docs/CURSOR_FRONTEND_CONTEXT.md`: contexto completo do projeto, stack, domínio, padrões, rotas, PrimeReact e regras multi-tenant.
- `src/styles/prime-theme-tokens.css`: tokens de cor e compatibilidade com PrimeReact.
- `src/styles/prime-overrides.css`: pequenos ajustes visuais em componentes PrimeReact.
