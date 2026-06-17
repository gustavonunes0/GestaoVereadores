Task: Padronizar Layout dos Dialogs com CSS Grid

Problema

Os dialogs de criação/edição estão com campos posicionados de forma inconsistente — sem grid, com margens manuais e flex-wrap aleatório — causando campos "flutuantes" e alinhamentos quebrados.

Referência visual: antes × depois

ANTES (caótico)                        DEPOIS (grid)
┌──────────────────────────┐           ┌──────────────────────────┐
│ Nova Matéria           ✕ │           │ Nova Matéria           ✕ │
├──────────────────────────┤           ├──────────────────────────┤
│ [Data]  [Tipo Autor]     │           │ — Identificação ──────── │
│              [Tipo Mat.] │           │ [Tipo Mat.][Data][Ano]   │
│ [Autor]      [Coautor]   │           │ — Autoria ─────────────  │
│         [Relator]        │           │ [Tipo Autor] [Autor    ] │
│ [Ementa              ]   │           │ [Coautor   ] [Relator  ] │
│ [Justificativa       ]   │           │ — Conteúdo ────────────  │
│ [Arquivo...]             │           │ [Ementa                ] │
├──────────────────────────┤           │ [Justificativa         ] │
│         [Cancelar][Salvar│           │ [Arquivo...]             │
└──────────────────────────┘           ├──────────────────────────┤
                                       │         [Cancelar][Salvar]│
                                       └──────────────────────────┘


Regra de Layout a Aplicar em Todos os Dialogs

1. Estrutura base do corpo do dialog

tsx<div className="sigl-dialog-body">
  {/* seções com grid interno */}
</div>

CSS:

css.sigl-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;        /* espaço entre seções */
  padding: 1.5rem;
}


2. Seções com título separador

Agrupar campos relacionados em seções semânticas com um título visual leve:

tsx<div className="sigl-dialog-secao">
  <span className="sigl-dialog-secao-titulo">Identificação</span>
  <div className="sigl-dialog-grid sigl-dialog-grid-3">
    {/* campos */}
  </div>
</div>

CSS:

css.sigl-dialog-secao {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sigl-dialog-secao-titulo {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--muted-color);       /* cinza/secundário do design system */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}


3. Grids de campos

Usar variações de grid por número de colunas:

tsx{/* 2 colunas — padrão para a maioria dos campos */}
<div className="sigl-dialog-grid sigl-dialog-grid-2">
  <div className="sigl-filtro-campo"> ... </div>
  <div className="sigl-filtro-campo"> ... </div>
</div>

{/* 3 colunas — campos curtos (tipo, data, ano) */}
<div className="sigl-dialog-grid sigl-dialog-grid-3">
  <div className="sigl-filtro-campo"> ... </div>
  <div className="sigl-filtro-campo"> ... </div>
  <div className="sigl-filtro-campo"> ... </div>
</div>

{/* 1 coluna — campos longos (ementa, justificativa) */}
<div className="sigl-filtro-campo">
  <label>Ementa *</label>
  <InputTextarea ... />
</div>

CSS:

css.sigl-dialog-grid {
  display: grid;
  gap: 0.75rem;
}
.sigl-dialog-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sigl-dialog-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* responsivo: 1 coluna em telas pequenas */
@media (max-width: 640px) {
  .sigl-dialog-grid-2,
  .sigl-dialog-grid-3 {
    grid-template-columns: 1fr;
  }
}


4. Campo individual (reutilizar o padrão já existente)

Manter a classe sigl-filtro-campo já usada nas pages:

tsx<div className="sigl-filtro-campo">
  <label htmlFor="f-tipo">Tipo de Matéria *</label>
  <Dropdown id="f-tipo" ... />
</div>


5. Campos que devem ocupar coluna inteira (col-span)

Para campos que precisam de largura total dentro de um grid:

tsx<div className="sigl-filtro-campo sigl-col-full">
  <label>Ementa *</label>
  <InputTextarea ... />
</div>

CSS:

css.sigl-col-full { grid-column: 1 / -1; }


Agrupamento sugerido para dialogs de Matéria

SeçãoCamposGridIdentificaçãoTipo de Matéria, Data Protocolo, Ano3 colunasAutoriaTipo de Autor, Autor, Coautor(es), Relator(es)2 colunasConteúdoEmenta (full), Justificativa (full), Texto Original (full)1 coluna


Checklist por Dialog

Para cada dialog de criar/editar no projeto:


 Corpo do dialog usa .sigl-dialog-body com flex-direction: column
 Campos agrupados em seções semânticas com .sigl-dialog-secao
 Cada seção tem um título com .sigl-dialog-secao-titulo
 Campos dentro de grid usando .sigl-dialog-grid-2 ou .sigl-dialog-grid-3
 Campos longos (textarea, file) com .sigl-col-full
 Nenhum campo usa margin, margin-top, margin-left manual para se posicionar
 Nenhum campo usa width fixo em px para se alinhar
 Nenhum campo usa position: absolute
 Grid responsivo (1 coluna em mobile)
 Dialog de edição usa a mesma estrutura do dialog de criação



O que NÃO alterar


Lógica de validação e submissão do formulário
Props, estado e handlers dos campos
Componentes de campo em si (Dropdown, InputText, Calendar, etc.)
Labels e textos (inclusive asteriscos de obrigatório)
Footer com botões Cancelar / Salvar