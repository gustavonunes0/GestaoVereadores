import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
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
import { Dropdown, mapDropdownOptions, withEmptyOption } from '../components/ui';
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
    const [cargoFiltro, setCargoFiltro] = useState('');
    const [instituicaoFiltro, setInstituicaoFiltro] = useState('');

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
        setFiltrosApplied({
            ...filtros,
            nome: nomeFiltro || undefined,
            cargo: cargoFiltro || undefined,
            instituicao: instituicaoFiltro || undefined,
        });
    }

    function limparFiltros() {
        setFiltros({});
        setNomeFiltro('');
        setCargoFiltro('');
        setInstituicaoFiltro('');
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
        <main>
            <PageHeader
                icon={MODULE_ICONS.autores}
                title="Autores externos"
                subtitle="Pessoas e entidades externas à câmara que podem ser vinculadas como autores em matérias."
                actions={
                     (
                        <Button
                            label="Cadastrar autor"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) 
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                <div className="sigl-filtro-campo">
                    <label htmlFor="af-tipo">Tipo de autor</label>
                    <Dropdown
                        id="af-tipo"
                        value={filtros.tipoAutorId ?? ''}
                        options={withEmptyOption(mapDropdownOptions(tiposAutorExterno, 'nome', 'id'))}
                        onChange={(v) => setFiltros((f) => ({ ...f, tipoAutorId: v ? String(v) : undefined }))}
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="af-nome">Nome</label>
                    <InputText
                        id="af-nome"
                        value={nomeFiltro}
                        onChange={(e) => setNomeFiltro(e.target.value)}
                        placeholder="Nome do autor"
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="af-cargo">Cargo / função</label>
                    <InputText
                        id="af-cargo"
                        value={cargoFiltro}
                        onChange={(e) => setCargoFiltro(e.target.value)}
                        placeholder="Cargo ou função"
                    />
                </div>
                <div className="sigl-filtro-campo">
                    <label htmlFor="af-inst">Instituição</label>
                    <InputText
                        id="af-inst"
                        value={instituicaoFiltro}
                        onChange={(e) => setInstituicaoFiltro(e.target.value)}
                        placeholder="Instituição"
                    />
                </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de autores externos">
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
            </section>

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
        </main>
    );
}
