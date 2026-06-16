import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tooltip } from 'primereact/tooltip';
import { materiasApi } from '../api/legislative/materias.api';
import type { Materia, MateriaFiltros } from '../api/legislative/materias.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { MateriaCreateDialog } from '../components/materias/MateriaCreateDialog';
import { MateriaDeleteDialog } from '../components/materias/MateriaDeleteDialog';
import { MateriaEditDialog } from '../components/materias/MateriaEditDialog';
import { MateriaStatusBadge } from '../components/materias/MateriaStatusBadge';
import { MateriaVerDialog } from '../components/materias/MateriaVerDialog';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';
import type { MateriaStatus } from '../types/legislative';

const EMPTY_FILTROS: MateriaFiltros = {
    tipoId: '',
    ementa: '',
    numeroProtocolo: '',
    anoId: '',
    tipoAutorId: '',
    page: 1,
    limit: 20,
};

export function MateriasPage() {
    const { tiposMateria, tiposAutor, anos } = useDominios();
    const { canWrite, canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Materia[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<MateriaFiltros>({ ...EMPTY_FILTROS });
    const [dataApresentacao, setDataApresentacao] = useState<Date[]>([]);
    const [dataPublicacao, setDataPublicacao] = useState<Date[]>([]);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [dialogVer, setDialogVer] = useState<Materia | null>(null);
    const [dialogEditar, setDialogEditar] = useState<Materia | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Materia | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const params: MateriaFiltros = {
                ...filtros,
                page,
                limit: 20,
                dataInicio: dataApresentacao[0]?.toISOString().slice(0, 10),
                dataFim: dataApresentacao[1]?.toISOString().slice(0, 10),
                dataPublicacaoInicio: dataPublicacao[0]?.toISOString().slice(0, 10),
                dataPublicacaoFim: dataPublicacao[1]?.toISOString().slice(0, 10),
            };
            const res = await materiasApi.list(params);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtros, page, dataApresentacao, dataPublicacao, showApiError]);

    useEffect(() => { void buscar(); }, [buscar]);

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setDataApresentacao([]);
        setDataPublicacao([]);
        setPage(1);
    }

    const colunas = (
        <>
            <Column
                field="identificacao"
                header="Identificação"
                sortable
                style={{ minWidth: '9rem' }}
                body={(row: Materia) => (
                    <span className="font-semibold">{row.identificacao ?? `${row.tipo?.sigla ?? ''} nº ${row.numero}/${row.ano}`}</span>
                )}
            />
            <Column
                header="Ementa"
                body={(row: Materia) => (
                    <>
                        <Tooltip target={`.ementa-${row.id}`} content={row.ementa} position="top" />
                        <span
                            className={`ementa-${row.id}`}
                            style={{
                                display: 'block',
                                maxWidth: '28rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {row.ementa}
                        </span>
                    </>
                )}
            />
            <Column
                header="Status"
                style={{ width: '9rem' }}
                body={(row: Materia) =>
                    row.status ? <MateriaStatusBadge status={row.status as MateriaStatus} /> : '—'
                }
            />
            <Column
                header="Autor"
                style={{ width: '10rem' }}
                body={(row: Materia) => row.autor?.nome ?? '—'}
            />
            <Column
                header="Protocolo"
                style={{ width: '7rem' }}
                body={(row: Materia) => formatDatePt(row.dataProtocolo)}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.materias}
                title="Matérias e Proposições"
                actions={
                    canWrite ? (
                        <Button
                            label="Nova Matéria"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) : undefined
                }
            />

            <section aria-label="Filtros de pesquisa">
                <FiltroLayout onBuscar={() => { setPage(1); void buscar(); }} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-tipo">Tipo de Matéria</label>
                        <Dropdown
                            id="f-tipo"
                            value={filtros.tipoId}
                            options={[{ id: '', nome: 'Todos' }, ...tiposMateria]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setFiltros((f) => ({ ...f, tipoId: e.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-ementa">Ementa contém</label>
                        <InputText
                            id="f-ementa"
                            value={filtros.ementa ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, ementa: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-protocolo">Nº Protocolo</label>
                        <InputText
                            id="f-protocolo"
                            value={filtros.numeroProtocolo ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, numeroProtocolo: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-ano">Ano</label>
                        <Dropdown
                            id="f-ano"
                            value={filtros.anoId}
                            options={[{ id: '', nome: 'Todos' }, ...anos.map((a) => ({ id: a.id, nome: String(a.valor) }))]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setFiltros((f) => ({ ...f, anoId: e.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-tipo-autor">Tipo de Autor</label>
                        <Dropdown
                            id="f-tipo-autor"
                            value={filtros.tipoAutorId}
                            options={[{ id: '', nome: 'Todos' }, ...tiposAutor]}
                            optionLabel="nome"
                            optionValue="id"
                            onChange={(e) => setFiltros((f) => ({ ...f, tipoAutorId: e.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-data-ap">Data Apresentação</label>
                        <Calendar
                            id="f-data-ap"
                            value={dataApresentacao}
                            onChange={(e) => setDataApresentacao((e.value as Date[]) ?? [])}
                            selectionMode="range"
                            dateFormat="dd/mm/yy"
                            placeholder="Início — Fim"
                            showButtonBar
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-data-pub">Data Publicação</label>
                        <Calendar
                            id="f-data-pub"
                            value={dataPublicacao}
                            onChange={(e) => setDataPublicacao((e.value as Date[]) ?? [])}
                            selectionMode="range"
                            dateFormat="dd/mm/yy"
                            placeholder="Início — Fim"
                            showButtonBar
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de matérias">
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

            {dialogCriar && (
                <MateriaCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}
            {dialogVer && (
                <MateriaVerDialog
                    materia={dialogVer}
                    onClose={() => setDialogVer(null)}
                />
            )}
            {dialogEditar && (
                <MateriaEditDialog
                    materia={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}
            {dialogDeletar && (
                <MateriaDeleteDialog
                    materia={dialogDeletar}
                    onClose={() => setDialogDeletar(null)}
                    onDeleted={() => void buscar()}
                />
            )}
        </main>
    );
}
