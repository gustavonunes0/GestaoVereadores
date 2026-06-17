Task: Aplicar variant outlined em todos os Dropdown do PrimeReact

Problema

Os campos <Dropdown> do PrimeReact estão sem borda visível, enquanto <InputText> e <InputTextarea> aparecem com borda — deixando o formulário visualmente inconsistente (ver print: "Tipo de Matéria", "Tipo de Autor", "Autor", "Coautor(es)", "Relator(es)" sem borda).


Solução

O PrimeReact Dropdown aceita a prop variant="outlined" (a partir da v10) ou a classe CSS p-dropdown-outlined. Aplicar em todos os <Dropdown> do projeto.


O que alterar

Opção A — prop variant (PrimeReact v10+)

tsx// ANTES
<Dropdown
  id="f-tipo"
  value={filtros.tipoId}
  options={tipos}
  optionLabel="nome"
  optionValue="id"
  onChange={(e) => setFiltros((f) => ({ ...f, tipoId: e.value }))}
/>

// DEPOIS
<Dropdown
  id="f-tipo"
  value={filtros.tipoId}
  options={tipos}
  optionLabel="nome"
  optionValue="id"
  onChange={(e) => setFiltros((f) => ({ ...f, tipoId: e.value }))}
  variant="outlined"
/>

Opção B — className (fallback para versões anteriores)

Se a prop variant não estiver disponível na versão instalada, usar:

tsx<Dropdown
  className="p-dropdown-outlined"
  ...
/>

Opção C — global via CSS (se nenhuma das anteriores funcionar)

Adicionar no arquivo de estilos globais (global.css, styles.css ou primereact-overrides.css):

css/* Forçar borda outlined em todos os Dropdowns */
.p-dropdown {
  border: 1px solid #d1d5db; /* equivalente ao border-gray-300 do Tailwind */
  border-radius: 6px;
}

.p-dropdown:not(.p-disabled):hover {
  border-color: #9ca3af;
}

.p-dropdown.p-focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  outline: none;
}


Verificar a versão do PrimeReact no package.json e usar a opção correspondente. Preferir A > B > C.




Escopo — onde aplicar

Buscar todos os arquivos do projeto que contenham:

import { Dropdown } from 'primereact/dropdown'

e adicionar variant="outlined" (ou className/CSS conforme a opção escolhida) em cada instância do componente <Dropdown> encontrada — tanto nas pages (filtros) quanto nos dialogs (formulários).

Locais conhecidos que precisam da correção:

ArquivoCamposMateriasPage (filtros)Tipo de Matéria, Ano, Tipo de AutorMateriaCreateDialogTipo de Matéria, Tipo de Autor, Autor, Coautor(es), Relator(es)MateriaEditDialogidem ao CreateDemais pages e dialogstodos os <Dropdown> encontrados


Checklist


 Verificar versão do PrimeReact no package.json e escolher Opção A, B ou C
 Buscar todas as ocorrências de <Dropdown no projeto (grep -r "<Dropdown" src/)
 Adicionar variant="outlined" (ou equivalente) em cada uma
 Confirmar visualmente que a borda do Dropdown está igual à do InputText e InputTextarea
 Confirmar que o estado de foco (:focus) também exibe anel/borda corretamente
 Não alterar nenhuma outra prop dos Dropdowns (value, options, onChange, etc.)



Resultado esperado

Todos os campos do formulário — Dropdown, InputText, InputTextarea, Calendar — com borda visível e consistente no estado padrão, hover e foco.