import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { MODULE_ICONS } from '../app/navigation';
import { autoresExternosApi, type AutorExterno, type AutorExternoFiltros } from '../api/autores-externos.api';
import { PageHeader } from '../components/PageHeader';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { AutorExternoCreateDialog } from '../components/autores/AutorExternoCreateDialog';
import { AutorExternoVerDialog } from '../components/autores/AutorExternoVerDialog';
import { AutorExternoEditDialog } from '../components/autores/AutorExternoEditDialog';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';

export function AutoresPage() {
    const { canManagePessoas } = usePermissions();
    const { showApiError } = useAppToast();
    const { tiposAutorExterno } = useDominios();

    const [items, setItems] = useState<AutorExterno[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<AutorExternoFiltros>({});
    const [filtrosApplied, setFiltrosApplied] = useState<AutorExternoFiltros>({});

    const [nomeFiltro, setNomeFiltro] = useState('');

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVer, setDialogVer] = useState<AutorExterno | null>(null);
    const [dialogEditar, setDialogEditar] = useState<AutorExterno | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<AutorExterno | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await autoresExternosApi.list({ ...filtrosApplied, page, limit: 20 });
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    function aplicarFiltros() {
        setPage(1);
        setFiltrosApplied({ ...filtros, nome: nomeFiltro || undefined });
    }

    function limparFiltros() {
        setFiltros({});
        setNomeFiltro('');
        setFiltrosApplied({});
        setPage(1);
    }

    const columns = (
        <>
            <Column
                header="Nome"
                body={(row: AutorExterno) => <span className="font-medium">{row.nome}</span>}
            />
            <Column
                header="Tipo"
                body={(row: AutorExterno) => row.tipoAutor.nome}
                style={{ width: '14rem' }}
            />
            <Column
                header="Cargo"
                body={(row: AutorExterno) => row.cargo ?? '—'}
                style={{ width: '10rem' }}
            />
            <Column
                header="Instituição"
                body={(row: AutorExterno) => row.instituicao ?? '—'}
                style={{ width: '12rem' }}
            />
        </>
    );

    return (
        <section className="page">
            <PageHeader
                icon={MODULE_ICONS.autores}
                title="Autores externos"
                subtitle="Pessoas e entidades externas à câmara que podem ser vinculadas como autores em matérias."
                actions={
                    canManagePessoas ? (
                        <Button
                            label="Cadastrar autor"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                <div className="col-12 md:col-6 lg:col-3">
                    <label htmlFor="af-tipo">Tipo de autor</label>
                    <Dropdown
                        id="af-tipo"
                        value={filtros.tipoAutorId ?? ''}
                        options={[{ id: '', nome: 'Todos' }, ...tiposAutorExterno]}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => setFiltros((f) => ({ ...f, tipoAutorId: e.value || undefined }))}
                        filter
                    />
                </div>
                <div className="col-12 md:col-6 lg:col-3">
                    <label htmlFor="af-nome">Nome</label>
                    <InputText
                        id="af-nome"
                        value={nomeFiltro}
                        onChange={(e) => setNomeFiltro(e.target.value)}
                        placeholder="Nome do autor"
                    />
                </div>
            </FiltroLayout>

            <DataTableLayout<AutorExterno>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={canManagePessoas}
                onVer={(item) => setDialogVer(item)}
                onEditar={canManagePessoas ? (item) => setDialogEditar(item) : undefined}
                onDeletar={canManagePessoas ? (item) => setDialogDeletar(item) : undefined}
            />

            {dialogCriar && (
                <AutorExternoCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogVer && (
                <AutorExternoVerDialog
                    autorId={dialogVer.id}
                    onClose={() => setDialogVer(null)}
                />
            )}

            {dialogEditar && (
                <AutorExternoEditDialog
                    autor={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir autor externo"
                    message={`Deseja excluir "${dialogDeletar.nome}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => autoresExternosApi.remove(dialogDeletar.id)}
                    onClose={() => {
                        setDialogDeletar(null);
                        void buscar();
                    }}
                />
            )}
        </section>
    );
}
