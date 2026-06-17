Task: Padronizar Layout das Pages do Frontend

Objetivo

Reorganizar todas as pages do frontend seguindo o layout padrão já estabelecido na page de Matérias e Proposições, garantindo consistência visual e estrutural em todo o projeto.


Layout Padrão (baseado em MateriasPage)

┌─────────────────────────────────────────────────────────┐
│  [Icon + Título da Page]       [Botão: + Nova Entidade] │  ← <PageHeader>
├─────────────────────────────────────────────────────────┤
│  <FiltroLayout onBuscar onLimpar loading>               │
│    [campo 1]  [campo 2]  [campo 3]  ...                 │  ← <section aria-label="Filtros">
│  </FiltroLayout>                                        │
├─────────────────────────────────────────────────────────┤
│  <DataTableLayout items total loading page columns ...> │  ← <section aria-label="Lista de ...">
│                    DataTable                            │
│  </DataTableLayout>                                     │
└─────────────────────────────────────────────────────────┘


Estrutura de Componentes a Replicar

Cada page deve seguir exatamente esta estrutura JSX:

tsx<main>
  {/* 1. Cabeçalho */}
  <PageHeader
    icon={MODULE_ICONS.<modulo>}
    title="Título da Page"
    actions={
      canWrite ? (
        <Button
          label="Nova [Entidade]"
          icon="pi pi-plus"
          onClick={() => setDialogCriar(true)}
        />
      ) : undefined
    }
  />

  {/* 2. Filtros */}
  <section aria-label="Filtros de pesquisa">
    <FiltroLayout
      onBuscar={() => { setPage(1); void buscar(); }}
      onLimpar={limparFiltros}
      loading={loading}
    >
      <div className="sigl-filtro-campo">
        <label htmlFor="f-campo">Label do Filtro</label>
        <Dropdown {/* ou InputText, Calendar, etc. */} />
      </div>
      {/* demais campos específicos da page */}
    </FiltroLayout>
  </section>

  {/* 3. Tabela */}
  <section aria-label="Lista de [entidades]">
    <DataTableLayout
      items={items}
      total={total}
      loading={loading}
      page={page}
      onPageChange={setPage}
      columns={colunas}
      canWrite={canEdit}
      onVer={setDialogVer}
      onEditar={canEdit ? setDialogEditar : undefined}
      onDeletar={canDelete ? setDialogDeletar : undefined}
    />
  </section>

  {/* 4. Dialogs condicionais */}
  {dialogCriar && <EntidadeCreateDialog onClose={() => setDialogCriar(false)} onSaved={() => void buscar()} />}
  {dialogVer   && <EntidadeVerDialog    materia={dialogVer}    onClose={() => setDialogVer(null)} />}
  {dialogEditar && <EntidadeEditDialog  materia={dialogEditar} onClose={() => setDialogEditar(null)} onSaved={() => void buscar()} />}
  {dialogDeletar && <EntidadeDeleteDialog materia={dialogDeletar} onClose={() => setDialogDeletar(null)} onDeleted={() => void buscar()} />}
</main>


Padrão de Estado Esperado em Cada Page

ts// Controle de paginação
const [page, setPage] = useState(1);

// Controle de loading e dados
const [loading, setLoading] = useState(false);
const [items, setItems]     = useState<Entidade[]>([]);
const [total, setTotal]     = useState(0);

// Filtros (objeto com campos específicos da entidade)
const [filtros, setFiltros] = useState<FiltrosEntidade>(filtrosIniciais);

// Dialogs
const [dialogCriar,   setDialogCriar]   = useState(false);
const [dialogVer,     setDialogVer]     = useState<Entidade | null>(null);
const [dialogEditar,  setDialogEditar]  = useState<Entidade | null>(null);
const [dialogDeletar, setDialogDeletar] = useState<Entidade | null>(null);

// Permissões
const canWrite  = /* checar permissão */;
const canEdit   = /* checar permissão */;
const canDelete = /* checar permissão */;


Checklist por Page

Para cada page encontrada no projeto:

Estrutura


 Raiz é <main> (sem wrapper desnecessário)
 <PageHeader> com icon, title e actions (botão só se canWrite)
 Filtros dentro de <section aria-label="Filtros de pesquisa">
 <FiltroLayout> com onBuscar, onLimpar e loading
 Cada campo de filtro usa <div className="sigl-filtro-campo"> com <label> e o input
 Tabela dentro de <section aria-label="Lista de [entidade]">
 <DataTableLayout> com todas as props necessárias
 Dialogs condicionais ao final do <main>


Comportamento


 onBuscar faz setPage(1) antes de buscar
 limparFiltros reseta o estado de filtros para os valores iniciais
 onSaved e onDeleted nos dialogs chamam void buscar() para recarregar
 Botão de criar só renderiza se canWrite === true
 onEditar e onDeletar no DataTableLayout são undefined quando sem permissão


Ícone


 O icon do PageHeader está em MODULE_ICONS com a chave correta do módulo



Como Executar


Mapear todas as pages do projeto (buscar arquivos *Page.tsx, *View.tsx ou equivalentes).
Comparar a estrutura de cada uma com o padrão acima.
Refatorar as que divergem, aplicando:

Estrutura JSX correta
Componentes PageHeader, FiltroLayout, DataTableLayout
Padrão de estado e permissões



Não alterar:

Lógica de negócio e chamadas de API
Colunas e configurações da DataTable
Campos e lógica dos filtros (apenas reposicionar se necessário)
Conteúdo dos dialogs