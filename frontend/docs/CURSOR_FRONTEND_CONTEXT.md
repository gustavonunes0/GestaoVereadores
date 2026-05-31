# Frontend — Portal Legislativo Multi-Tenant

**Stack:** React 19 + React Router 7 + Vite 6 + TypeScript 5  
**UI library oficial:** PrimeReact + PrimeIcons  
**Domínio:** plataforma multi-tenant para Câmara Municipal  
**Produto:** SIGL — Sistema Integrado de Gestão Legislativa

---

## 1. Papel da IA no projeto

Você é o copiloto técnico do frontend do Portal Legislativo. Sua prioridade é entregar código pequeno, consistente, performático e aderente às regras de negócio legislativas.

Antes de alterar qualquer tela:

1. Leia os arquivos existentes relacionados à rota, componente, contexto, API client e tipos.
2. Reutilize padrões já existentes antes de criar novos.
3. Faça mudanças mínimas, coesas e fáceis de revisar.
4. Preserve multi-tenancy, autenticação, permissões e textos em português brasileiro.
5. Rode ou considere `npm run build` e corrija erros de TypeScript.
6. Não faça refatorações grandes sem necessidade.
7. Não altere contrato de API sem confirmar impacto no backend.

---

## 2. Identidade do produto

Interface do **SIGL — Sistema Integrado de Gestão Legislativa** para operadores de uma Câmara Municipal.

O usuário sempre trabalha no contexto de **uma câmara/tenant**. Dados de outra câmara nunca devem aparecer na UI.

Domínios principais:

- **Legislativo:** parlamentares, proposições/matérias, sessões plenárias, mesa diretora, comissões, frentes e agenda.
- **Administrativo:** atos internos, diárias, estrutura organizacional e gestão interna.
- **Institucional:** portal, carta de serviços, comunicações oficiais, páginas e notícias.
- **Jurídico:** normas jurídicas, legislação, pareceres e documentos com valor legal.
- **Relatórios:** produção legislativa, presença, diárias, estatísticas anuais e transparência.

Fluxo legislativo central:

```txt
Matéria/Proposição → Comissões/Tramitação → Pauta da Sessão → Presença → Votação → Norma Jurídica
```

Diferença importante:

- **Matéria Legislativa:** proposta em análise ou tramitação.
- **Norma Jurídica:** documento legal já aprovado, formalizado e publicado.
- **Ato Administrativo:** decisão ou documento interno de administração.
- **Comunicação Oficial:** mensagem institucional enviada ou publicada oficialmente.
- **Relatório:** consulta consolidada para gestão, transparência e prestação de contas.

---

## 3. Instalação obrigatória de UI

Usar **PrimeReact** como biblioteca oficial de componentes.

Comando recomendado:

```bash
npm install primereact primeicons
```

No `src/main.tsx`, ou no arquivo de bootstrap da aplicação, usar este padrão de imports:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { PrimeReactProvider } from 'primereact/api';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './styles/prime-theme-tokens.css';
import './styles/prime-overrides.css';
import './index.css';

import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider value={{ ripple: true }}>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);
```

Observações:

- Não misturar Material UI, Ant Design, Chakra ou outra UI library sem decisão explícita.
- Preferir importação individual dos componentes para manter bundle menor.
- PrimeReact deve ser usado como base visual.
- Regras de negócio continuam nos hooks, contexts, services e API client do projeto.
- Não colocar regra de negócio dentro de componente visual genérico.

---

## 4. Design system e tokens de cor

Usar somente os tokens definidos em:

```txt
src/styles/prime-theme-tokens.css
```

Não inventar cores soltas no código.

### Tokens principais

```css
:root {
  /* Brand */
  --brand-blue-iris: #377EF2;
  --brand-safety-orange: #FF8465;
  --brand-pale-purple: #D3D2FD;
  --brand-night-blue: #0E1E46;

  /* Text / neutral scale */
  --text-primary: #0E0D35;
  --text-900: #27264A;
  --text-800: #3E3D5D;
  --text-700: #575672;
  --text-600: #6E6E86;
  --text-500: #868599;
  --text-400: #9F9EAE;
  --text-300: #B7B7C3;
  --text-200: #CFCFD7;
  --text-inverse: #FFFFFF;

  /* Background */
  --bg-app: #F9FAFE;
  --bg-soft: #F5F6F9;
  --bg-border: #E6E9F5;
  --bg-card: #FFFFFF;

  /* System */
  --info: #2C65DA;
  --danger: #EB4F46;
  --success: #65BE58;
  --warning: #F2B04F;
}
```

### Uso semântico

- Ação primária: `--brand-blue-iris`.
- Ação secundária/destaque leve: `--brand-pale-purple`.
- CTA complementar: `--brand-safety-orange`.
- Texto forte/títulos: `--text-primary` ou `--brand-night-blue`.
- Fundo de página: `--bg-app`.
- Card/modal/tabela: `--bg-card`.
- Bordas/divisórias: `--bg-border`.
- Erro/destrutivo: `--danger`.
- Sucesso: `--success`.
- Aviso: `--warning`.
- Informação: `--info`.

---

## 5. Convenções de código

- Componentes, hooks, types, funções e arquivos: inglês.
- Labels, botões, mensagens, erros e subtítulos de UI: português brasileiro.
- Datas e números: formatar para `pt-BR`.
- API: todo acesso deve passar por `src/api/client.ts`.
- Não usar `fetch` direto em páginas/componentes.
- Não duplicar lógica de autenticação fora de `AuthContext` e `client.ts`.
- Validar minimamente no client, mas considerar backend como fonte final da regra.
- Normalizar CPF/CNPJ antes do POST quando a API esperar apenas dígitos.
- Componentes de página devem ser simples, legíveis e fáceis de revisar.
- Evitar componente genérico grande sem necessidade real.

---

## 6. Estrutura de pastas recomendada

```txt
src/
├── api/
│   └── client.ts
├── app/
│   └── routes.tsx                # opcional, caso App.tsx cresça demais
├── contexts/
│   ├── AuthContext.tsx
│   └── LegislaturaContext.tsx
├── components/
│   ├── layout/
│   ├── common/
│   ├── forms/
│   └── feedback/
├── hooks/
│   ├── useDominios.ts
│   └── useAsyncAction.ts          # opcional
├── pages/
│   ├── dashboard/
│   ├── materias/
│   ├── sessoes/
│   ├── camara/
│   ├── publicacao/
│   ├── relatorios/
│   └── platform/
├── styles/
│   ├── prime-theme-tokens.css
│   ├── prime-overrides.css
│   └── index.css
└── types/
```

Nova página:

1. Criar em `src/pages/<dominio>/<FeaturePage>.tsx`.
2. Registrar rota.
3. Adicionar menu no layout apenas se for item principal.
4. Usar `PageHeader`, filtros, tabela e `Dialog` de formulário.
5. Usar `api()` / `apiList()`.
6. Tratar loading, erro, vazio e sucesso.

---

## 7. PrimeReact — componentes padrão

Preferir estes componentes conforme o caso:

- Botões: `Button`.
- Inputs texto: `InputText`, `InputTextarea`.
- Select/lookups: `Dropdown`, `MultiSelect`, `AutoComplete` quando fizer sentido.
- Datas: `Calendar`.
- Booleanos: `Checkbox`, `InputSwitch`.
- Tabelas: `DataTable` + `Column`.
- Modais: `Dialog`.
- Confirmações: `ConfirmDialog` + `confirmDialog`.
- Feedback: `Toast`, `Message`, `Tag`, `ProgressSpinner`, `Skeleton`.
- Organização: `Card`, `Panel`, `Toolbar`, `TabView`, `Divider`, `Breadcrumb`.
- Upload: `FileUpload`, somente quando houver endpoint preparado para multipart.

Padrões de UX:

- Toda ação de salvar deve ter loading e desabilitar botão enquanto envia.
- Erros de API devem aparecer em português com `Toast` ou bloco de erro visível.
- Ações destrutivas exigem confirmação.
- Tabelas grandes devem usar paginação/filtro, evitando renderizar milhares de linhas.
- Estado vazio deve explicar o próximo passo do usuário.
- Filtros devem ser claros e fáceis de limpar.
- Campos obrigatórios devem ter indicação visual e validação mínima.

---

## 8. Multi-tenancy e autenticação

Regra crítica:

```txt
NUNCA enviar tenantId no body ou query para escolher a câmara.
```

O backend resolve o tenant pelo JWT (`tid`). O frontend só envia o Bearer token.

Modelo alvo de usuário autenticado:

```ts
type AuthUser = {
  id: string;
  nome: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'MASTER';
  tenantId?: string;
  isAdmin?: boolean;
};
```

Armazenamento atual:

- Token: `localStorage.access_token`.
- Usuário: `localStorage.user`.

Rotas:

- `ProtectedRoute`: qualquer usuário autenticado.
- `MasterRoute`: somente `role === 'MASTER'` para gestão de plataforma.

Permissões de UI:

- Escrita em dados da câmara: `ADMIN` ou `OPERATOR`.
- Leitura: `ADMIN`, `OPERATOR` ou `VIEWER`.
- Plataforma/tenants/users: `MASTER`.

Permissão no frontend é apenas UX. Segurança real deve existir no backend.

---

## 9. API client e chamadas HTTP

Toda chamada HTTP deve passar por:

```txt
src/api/client.ts
```

Padrões esperados:

```ts
import { api, apiList } from '@/api/client';
```

Não fazer:

```ts
fetch('/algum-endpoint')
```

Sempre que criar tela de listagem:

- Usar função de carregamento separada.
- Tratar `loading`.
- Tratar erro com mensagem clara.
- Evitar carregar lista gigante sem paginação/limite.
- Preservar filtros funcionais como query params quando fizer sentido.

Quando backend retornar erro:

- `400`: mostrar validação clara.
- `401`: usuário não autenticado ou token inválido.
- `403`: usuário sem permissão.
- `404`: registro não encontrado.
- `409`: conflito de regra de negócio ou duplicidade.

---

## 10. Contexto legislativo global

Usar `LegislaturaProvider` + `useLegislatura()` para telas que dependem de legislatura/sessão legislativa.

Persistência:

- `legislaturaId` e `sessaoLegislativaId` em `localStorage`.
- Chave recomendada: `sigl_legislatura_ctx`.

Usar `ContextBanner` quando a tela depender desse contexto.

Filtros permitidos:

- `legislaturaId` e `sessaoLegislativaId` podem ser enviados como filtros funcionais de listagem.
- Nunca usar esses campos como substituto de tenant.

---

## 11. Regras de negócio que a UI deve refletir

| Ação | Condição esperada na UI |
|---|---|
| Incluir matéria na pauta | Matéria em tramitação e sessão apta a receber pauta |
| Registrar presença | Sessão existente e parlamentar ativo |
| Registrar voto | Parlamentar presente na sessão |
| Criar norma | Matéria aprovada/formalizada |
| Exibir votos nominais | Apenas se votação não for secreta |
| Encerrar sessão | Confirmar e avisar sobre pendências |
| Cargo único na mesa | Não permitir duplicidade para cargo marcado como único |
| Relatórios | Sempre respeitar filtros de período, parlamentar, tipo e legislatura |

Regras negativas importantes:

- Não exibir voto individual em votação secreta.
- Não oferecer “Gerar norma” para matéria não aprovada.
- Não permitir ações de escrita para perfil somente leitura.
- Não mascarar erro de permissão como erro genérico.
- Não permitir duplicidade visual quando backend retorna conflito `409`.

---

## 12. Rotas funcionais esperadas

```txt
/login                         Autenticação
/                              Dashboard
/materias                      Proposições / matérias legislativas
/sessoes                       Sessões plenárias, pauta, presença e votação
/relatorios                    Relatórios
/camara/parlamentares          Vereadores/parlamentares
/camara/comissoes              Comissões
/camara/frentes                Frentes parlamentares
/camara/mesa-diretora          Mesa diretora
/camara/autores                Autores
/camara/legislaturas           Legislaturas e sessões legislativas
/publicacao/normas             Normas jurídicas
/publicacao/atos               Atos administrativos
/usuarios                      MASTER — usuários/plataforma
```

Manter redirects legados ao renomear rotas.

---

## 13. Padrão de página com PrimeReact

```tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';

import { apiList } from '@/api/client';

type Item = {
  id: string;
  nome: string;
  status: string;
};

export function ExamplePage() {
  const toastRef = useRef<Toast>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const response = await apiList<Item>('/recurso', { limit: 100 });
      setItems(response.data);
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os registros.',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="page">
      <Toast ref={toastRef} />

      <PageHeader
        title="Título da tela"
        subtitle="Descrição objetiva da funcionalidade."
        actions={
          <Button
            label="Novo"
            icon="pi pi-plus"
            onClick={() => setOpen(true)}
          />
        }
      />

      <DataTable
        value={items}
        loading={loading}
        dataKey="id"
        paginator
        rows={10}
        emptyMessage="Nenhum registro encontrado."
      >
        <Column field="nome" header="Nome" sortable />
        <Column field="status" header="Situação" />
      </DataTable>

      <Dialog
        header="Novo registro"
        visible={open}
        onHide={() => setOpen(false)}
        modal
      >
        {/* formulário */}
      </Dialog>
    </section>
  );
}
```

---

## 14. Prompt recomendado para o Cursor Composer

Use este prompt quando for pedir uma nova tela ou refatoração:

```txt
Leia primeiro .cursorrules e docs/CURSOR_FRONTEND_CONTEXT.md.

Implemente esta funcionalidade no frontend usando React, TypeScript e PrimeReact.

Antes de codar, procure componentes, hooks, contexts, tipos, rotas e padrões parecidos já existentes.

Não use fetch direto. Use src/api/client.ts.

Não envie tenantId manualmente. O tenant vem do JWT.

Use textos de UI em português brasileiro e nomes de código em inglês.

Use os tokens de cor de src/styles/prime-theme-tokens.css.

Inclua loading, erro, vazio, Toast de sucesso/erro e confirmação para ação destrutiva.

Faça a menor alteração segura possível.

No final, liste os arquivos alterados e verifique se npm run build tende a passar.
```

---

## 15. O que NÃO fazer

- Não usar `fetch` direto fora de `src/api/client.ts`.
- Não enviar `tenantId` manualmente para endpoints legislativos.
- Não criar telas com textos em inglês.
- Não usar cores fora dos tokens do design system.
- Não misturar bibliotecas de UI sem decisão explícita.
- Não criar componente genérico grande sem necessidade.
- Não duplicar lógica de paginação/filtro se já existir helper.
- Não exibir voto individual em votação secreta.
- Não oferecer “Gerar norma” para matéria não aprovada.
- Não quebrar redirects/rotas antigas sem mapear impacto.
- Não criar abstrações prematuras.
- Não alterar permissões sem considerar backend e rotas protegidas.

---

## 16. Checklist antes de responder uma tarefa de código

- [ ] A solução respeita multi-tenancy por JWT?
- [ ] Usou `api()` ou `apiList()`?
- [ ] UI em português brasileiro?
- [ ] Componentes PrimeReact importados individualmente?
- [ ] Cores via tokens CSS?
- [ ] Estados de loading, erro e vazio tratados?
- [ ] Ações destrutivas com confirmação?
- [ ] Permissão refletida na UI?
- [ ] Evitou `tenantId` manual?
- [ ] Evitou `fetch` direto?
- [ ] `npm run build` tende a passar sem erro de TypeScript?

---

## 17. Variáveis de ambiente e comandos

```env
VITE_API_URL=http://localhost:3000/api
```

```bash
cd frontend
npm install
npm install primereact primeicons
npm run dev
npm run build
```

---

## 18. Ordem recomendada para trabalhar com a IA

1. Pedir para a IA ler `.cursorrules`.
2. Pedir para ler `docs/CURSOR_FRONTEND_CONTEXT.md`.
3. Pedir para localizar arquivos parecidos.
4. Pedir para propor plano curto.
5. Pedir para implementar.
6. Pedir para revisar TypeScript/imports.
7. Pedir para verificar build.
8. Pedir para resumir arquivos alterados.

---

## 19. Status de implementação no repositório

### Infraestrutura (implementado)

| Item | Caminho |
|------|---------|
| Tipos de auth | `src/types/auth.ts` |
| Regras legislativas (UI) | `src/types/legislative.ts` |
| Mensagens de erro HTTP | `src/utils/apiErrorMessage.ts` |
| CPF/CNPJ só dígitos | `src/utils/normalizeDocument.ts` |
| Permissões de escrita/leitura | `src/hooks/usePermissions.ts` |
| Toast + ConfirmDialog global | `src/hooks/useAppToast.tsx` → `Layout` |
| Alias `@/` | `vite.config.ts`, `tsconfig.json` |

### Autenticação (implementado)

- `POST /auth/login` — aba **Plataforma SIGL** (`loginSigl`).
- `POST /auth/login-camara` — aba **Câmara Municipal** (e-mail, senha, CNPJ).
- **Não** enviar `tenantId` nas telas legislativas; tenant vem do JWT após login.
- `AuthUser` com `authType`, `tenantId`, `tenantName`, `isAdmin` quando retornados pela API.

### Telas migradas para PrimeReact (piloto + fluxo)

| Tela | PrimeReact | Regras de negócio na UI |
|------|------------|-------------------------|
| Login | Sim | Erros por status HTTP |
| Parlamentares | Sim | `canWrite`, confirmação de exclusão |
| Matérias | Sim | Filtro `EM_TRAMITACAO`, status na tabela |
| Normas | Sim | Só matérias `APROVADA` no vínculo |
| Sessões | Parcial | Pauta só `EM_ANDAMENTO` + matérias em tramitação |

### Pendente (próximas iterações)

- Migrar Comissões, Frentes, Mesa, Autores, Legislaturas, Atos, Relatórios, Dashboard.
- UI de **presença**, **votação** e **voto secreto** (ocultar nominais).
- `useAsyncAction` opcional.
- Unificar tokens legados de `index.css` com `prime-theme-tokens.css`.
