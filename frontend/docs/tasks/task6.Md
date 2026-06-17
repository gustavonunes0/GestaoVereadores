Task: 6 ajustes pendentes do redesign — bater de uma vez

Aplicar os itens que ficaram faltando após o redesign inicial.
Não alterar lógica, rotas ou estrutura de componentes — apenas CSS/estilo.


1. Fundo da página — <main> 🔴 crítico

O fundo do <main> está igual ao fundo dos cards, eliminando a hierarquia visual.

css/* Localizar o container principal do conteúdo (main, .layout-content, .page-wrapper ou equivalente) */

/* ANTES */
background: #ffffff; /* ou #f3f4f6 */

/* DEPOIS */
background: #f5f6f8;

Tailwind: trocar bg-white ou bg-gray-100 por bg-[#f5f6f8] no elemento raiz do conteúdo.


Buscar no projeto: o elemento que envolve <PageHeader> + filtros + tabela em todas as pages. Pode ser .layout-content, .main-content, <main>, ou o container do router outlet.




2. Dropdowns outlined — PrimeReact 🔴 crítico

Os <Dropdown> do PrimeReact estão sem borda, enquanto <InputText> e <InputTextarea> têm — inconsistência visual clara nos filtros e dialogs.

Verificar versão no package.json e aplicar a opção correspondente:

Opção A — prop variant (PrimeReact v10+):

tsx<Dropdown variant="outlined" ... />

Buscar todas as ocorrências e adicionar a prop:

bashgrep -rn "<Dropdown" src/

Opção B — override CSS global (qualquer versão):

css/* Adicionar no arquivo de estilos globais */
.p-dropdown {
  border: 1px solid #dde2ea !important;
  border-radius: 6px !important;
  background: #fafbfc !important;
}

.p-dropdown:not(.p-disabled):hover {
  border-color: #b0bac8 !important;
}

.p-dropdown.p-focus,
.p-dropdown.p-inputwrapper-focus {
  border-color: #2563a8 !important;
  box-shadow: 0 0 0 3px rgba(37, 99, 168, 0.12) !important;
  outline: none !important;
}


Usar Opção A se disponível. Cair na Opção B caso contrário. O resultado visual deve ser idêntico ao <InputText>.




3. Borda direita da sidebar ⚠️ importante

Sem separação entre sidebar e conteúdo, as duas áreas se fundem visualmente.

css/* Localizar o elemento .sidebar, aside, ou equivalente */

/* ADICIONAR */
border-right: 1px solid #eef0f3;

Tailwind: adicionar border-r border-[#eef0f3] no elemento da sidebar.


4. Grid de filtros inconsistente ⚠️ importante

A primeira linha de filtros tem colunas de tamanhos diferentes da segunda, criando desalinhamento visual.

css/* FiltroLayout ou o container dos campos de filtro */

/* ANTES — colunas com tamanhos arbitrários */

/* DEPOIS — grid uniforme de 3 colunas em todas as linhas */
.sigl-filtro-campos {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

Tailwind: grid grid-cols-3 gap-3 no container dos campos dentro do <FiltroLayout>.


Se algum campo precisar de mais espaço (ex: Ementa), usar col-span-2:



tsx<div className="sigl-filtro-campo col-span-2"> ... </div>


5. "AÇÕES" → sentence case ⚠️ importante

O cabeçalho da DataTable está em uppercase, padrão que foi abandonado no redesign.

css/* Override PrimeReact — cabeçalho da tabela */
.p-datatable .p-datatable-thead > tr > th {
  text-transform: none !important;   /* remover uppercase */
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #8492a6 !important;
  letter-spacing: 0 !important;
}

Além disso, localizar onde o texto "AÇÕES" é definido nas colunas e alterar para "Ações":

tsx// ANTES
{ field: 'acoes', header: 'AÇÕES' }

// DEPOIS
{ field: 'acoes', header: 'Ações' }


Buscar no projeto: grep -rn "AÇÕES\|ACOES\|\"ACAO" src/




6. Estilo da paginação ⚠️ importante

Os botões de paginação « ‹ › » ainda estão com aparência nativa do PrimeReact.

css/* Override PrimeReact Paginator */
.p-paginator {
  background: #ffffff !important;
  border-top: 1px solid #eef0f3 !important;
  padding: 8px 14px !important;
  border-radius: 0 0 10px 10px !important;
}

.p-paginator .p-paginator-element {
  background: #f0f4fa !important;
  color: #4a7ab5 !important;
  border: none !important;
  border-radius: 6px !important;
  min-width: 32px !important;
  height: 32px !important;
  font-size: 13px !important;
  margin: 0 2px !important;
  transition: background 0.12s !important;
}

.p-paginator .p-paginator-element:hover:not(.p-disabled) {
  background: #dde8f5 !important;
  color: #2563a8 !important;
}

.p-paginator .p-paginator-element.p-highlight {
  background: #2563a8 !important;
  color: #ffffff !important;
}

.p-paginator .p-paginator-element.p-disabled {
  background: #f8f9fb !important;
  color: #b0bac8 !important;
  cursor: not-allowed !important;
}


Checklist de execução


 1. background: #f5f6f8 no <main> / container de conteúdo
 2. <Dropdown variant="outlined"> em todas as ocorrências ou override CSS .p-dropdown
 3. border-right: 1px solid #eef0f3 na sidebar
 4. grid-template-columns: repeat(3, minmax(0, 1fr)) no container de filtros
 5. "AÇÕES" → "Ações" nos headers das DataTables + remover text-transform: uppercase do .p-datatable-thead th
 6. Overrides do .p-paginator aplicados


O que NÃO alterar


Lógica de negócio, rotas ou estado
Estrutura JSX dos componentes
Logo, sidebar layout ou largura
Outros estilos não mencionados acima