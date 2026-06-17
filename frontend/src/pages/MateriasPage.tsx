import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { materiasApi } from '../api/legislative/materias.api';
import type { Materia, MateriaFiltros } from '../api/legislative/materias.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { MateriaCreateDialog } from '../components/materias/MateriaCreateDialog';
import { MateriaDeleteDialog } from '../components/materias/MateriaDeleteDialog';
import { MateriaEditDialog } from '../components/materias/MateriaEditDialog';
import { MateriaListCard } from '../components/materias/MateriaListCard';
import { MateriaVerDialog } from '../components/materias/MateriaVerDialog';
import { DateRangePicker, Dropdown, mapDropdownOptions, PreviewImg, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import {
    resolveMateriaTextoOriginalUrl,
    resolveMateriaTitulo,
} from '../utils/materiaDisplay';

type TextoOriginalPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

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
    const { canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Materia[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<MateriaFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<MateriaFiltros>({ ...EMPTY_FILTROS });
    const [dataApresentacao, setDataApresentacao] = useState<[Date | null, Date | null]>([null, null]);
    const [dataPublicacao, setDataPublicacao] = useState<[Date | null, Date | null]>([null, null]);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [previewTextoOriginal, setPreviewTextoOriginal] =
        useState<TextoOriginalPreview | null>(null);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);

    function handleVer(materia: Materia) {
        const url = materia.textoOriginalUrl?.trim();
        if (url) {
            const resolved = resolveMateriaTextoOriginalUrl(url);
            const isPdf = resolved.toLowerCase().includes('.pdf');
            setPreviewTextoOriginal({
                src: resolved,
                fileName: `${resolveMateriaTitulo(materia)}${isPdf ? '.pdf' : ''}`,
                mimeType: isPdf ? 'application/pdf' : undefined,
            });
            return;
        }
        setDialogVerId(materia.id);
    }
    const [dialogEditar, setDialogEditar] = useState<Materia | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Materia | null>(null);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const params: MateriaFiltros = {
                ...filtrosApplied,
                page,
                limit: 20,
            };
            const res = await materiasApi.list(params);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [filtrosApplied, page, showApiError]);

    useEffect(() => { void buscar(); }, [buscar]);

    function aplicarFiltros() {
        setPage(1);
        setFiltrosApplied({
            ...filtros,
            dataInicio: dataApresentacao[0]?.toISOString().slice(0, 10),
            dataFim: dataApresentacao[1]?.toISOString().slice(0, 10),
            dataPublicacaoInicio: dataPublicacao[0]?.toISOString().slice(0, 10),
            dataPublicacaoFim: dataPublicacao[1]?.toISOString().slice(0, 10),
        });
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({ ...EMPTY_FILTROS });
        setDataApresentacao([null, null]);
        setDataPublicacao([null, null]);
        setPage(1);
    }

    const colunas = (
        <Column
            body={(row: Materia) => (
                <MateriaListCard
                    materia={row}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onVer={() => handleVer(row)}
                    onEditar={() => setDialogEditar(row)}
                    onDeletar={() => setDialogDeletar(row)}
                />
            )}
        />
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.materias}
                title="Matérias e Proposições"
                actions={
                    (
                        <Button
                            label="Nova Matéria"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    ) 
                }
            />

            <section aria-label="Filtros de pesquisa " className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-tipo">Tipo de Matéria</label>
                        <Dropdown
                            id="f-tipo"
                            value={filtros.tipoId ?? ''}
                            onChange={(v) => setFiltros((f) => ({ ...f, tipoId: String(v) }))}
                            options={withEmptyOption(mapDropdownOptions(tiposMateria, 'nome', 'id'))}
                            placeholder="Todos"
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
                            value={filtros.anoId ?? ''}
                            options={withEmptyOption(
                                anos.map((a) => ({ label: String(a.valor), value: a.id })),
                            )}
                            onChange={(v) => setFiltros((f) => ({ ...f, anoId: String(v) }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="f-tipo-autor">Tipo de Autor</label>
                        <Dropdown
                            id="f-tipo-autor"
                            value={filtros.tipoAutorId ?? ''}
                            options={withEmptyOption(mapDropdownOptions(tiposAutor, 'nome', 'id'))}
                            onChange={(v) => setFiltros((f) => ({ ...f, tipoAutorId: String(v) }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <DateRangePicker
                            id="f-data-ap"
                            label="Data Apresentação"
                            value={dataApresentacao}
                            onChange={setDataApresentacao}
                            placeholder="Início — Fim"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <DateRangePicker
                            id="f-data-pub"
                            label="Data Publicação"
                            value={dataPublicacao}
                            onChange={setDataPublicacao}
                            placeholder="Início — Fim"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de matérias" className="materias-table-section">
                <DataTableLayout
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    enableSort={false}
                    hideActionsColumn
                    tableClassName="materias-datatable materias-datatable--cards"
                />
            </section>

            {dialogCriar && (
                <MateriaCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}
            {previewTextoOriginal && (
                <PreviewImg
                    src={previewTextoOriginal.src}
                    fileName={previewTextoOriginal.fileName}
                    mimeType={previewTextoOriginal.mimeType}
                    onClose={() => setPreviewTextoOriginal(null)}
                />
            )}
            {dialogVerId && (
                <MateriaVerDialog
                    materiaId={dialogVerId}
                    onClose={() => setDialogVerId(null)}
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
