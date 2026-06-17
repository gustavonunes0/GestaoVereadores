import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { atosApi, type Ato, type AtoFiltros } from '../api/atos.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { AtoCreateDialog } from '../components/atos/AtoCreateDialog';
import { AtoEditDialog } from '../components/atos/AtoEditDialog';
import { AtoVerDialog } from '../components/atos/AtoVerDialog';
import { DateRangePicker, Dropdown, mapDropdownOptions, PreviewImg, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';
import { resolveMateriaTextoOriginalUrl } from '../utils/materiaDisplay';

const EMPTY_FILTROS: AtoFiltros = {
    tipoId: '',
    numero: '',
    page: 1,
    limit: 20,
};

type DocumentoPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

export function AtosPage() {
    const { tiposAto } = useDominios();
    const { canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Ato[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<AtoFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<AtoFiltros>({ ...EMPTY_FILTROS });
    const [dataAto, setDataAto] = useState<[Date | null, Date | null]>([null, null]);
    const [dataPublicacao, setDataPublicacao] = useState<[Date | null, Date | null]>([
        null,
        null,
    ]);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [previewDocumento, setPreviewDocumento] = useState<DocumentoPreview | null>(null);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);
    const [dialogEditar, setDialogEditar] = useState<Ato | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Ato | null>(null);

    function handleVer(ato: Ato) {
        const url = (ato.anexoUrl ?? ato.textoUrl)?.trim();
        if (url) {
            const resolved = resolveMateriaTextoOriginalUrl(url);
            const isPdf = resolved.toLowerCase().includes('.pdf');
            setPreviewDocumento({
                src: resolved,
                fileName: `${ato.tipo.nome} nº ${ato.numero}${isPdf ? '.pdf' : ''}`,
                mimeType: isPdf ? 'application/pdf' : undefined,
            });
            return;
        }
        setDialogVerId(ato.id);
    }

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await atosApi.list({
                ...filtrosApplied,
                page,
                limit: 20,
            });
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
            dataInicioDe: dataAto[0]?.toISOString().slice(0, 10),
            dataInicioAte: dataAto[1]?.toISOString().slice(0, 10),
            dataPublicacaoDe: dataPublicacao[0]?.toISOString().slice(0, 10),
            dataPublicacaoAte: dataPublicacao[1]?.toISOString().slice(0, 10),
        });
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({ ...EMPTY_FILTROS });
        setDataAto([null, null]);
        setDataPublicacao([null, null]);
        setPage(1);
    }

    const colunas = (
        <>
            <Column
                header="Tipo"
                body={(row: Ato) => <span className="font-medium">{row.tipo.nome}</span>}
                style={{ width: '10rem' }}
            />
            <Column
                header="Classificação"
                body={(row: Ato) => row.classificacao?.nome ?? '—'}
                style={{ width: '11rem' }}
            />
            <Column field="numero" header="Número" style={{ width: '7rem' }} />
            <Column
                header="Ementa"
                body={(row: Ato) => (
                    <span
                        title={row.ementa ?? ''}
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block"
                        style={{ maxWidth: '22rem' }}
                    >
                        {row.ementa ?? '—'}
                    </span>
                )}
            />
            <Column
                header="Data do ato"
                body={(row: Ato) => formatDatePt(row.dataAto)}
                style={{ width: '8rem' }}
            />
            <Column
                header="Publicação"
                body={(row: Ato) => formatDatePt(row.dataPublicacao)}
                style={{ width: '7rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.atos}
                title="Atos administrativos"
                actions={
                    (
                        <Button
                            label="Registrar ato"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    )
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="af-tipo">Tipo do ato</label>
                        <Dropdown
                            id="af-tipo"
                            value={filtros.tipoId ?? ''}
                            options={withEmptyOption(mapDropdownOptions(tiposAto, 'nome', 'id'))}
                            onChange={(v) => setFiltros((f) => ({ ...f, tipoId: String(v) }))}
                            placeholder="Todos"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="af-numero">Número</label>
                        <InputText
                            id="af-numero"
                            value={filtros.numero ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, numero: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <DateRangePicker
                            id="af-data"
                            label="Data do ato"
                            value={dataAto}
                            onChange={setDataAto}
                            placeholder="Início — Fim"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <DateRangePicker
                            id="af-publicacao"
                            label="Data publicação"
                            value={dataPublicacao}
                            onChange={setDataPublicacao}
                            placeholder="Início — Fim"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de atos administrativos" className="atos-table-section">
                <DataTableLayout
                    items={items}
                    total={total}
                    loading={loading}
                    page={page}
                    onPageChange={setPage}
                    columns={colunas}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onVer={handleVer}
                    onEditar={canEdit ? (item) => setDialogEditar(item) : undefined}
                    onDeletar={canDelete ? (item) => setDialogDeletar(item) : undefined}
                />
            </section>

            {dialogCriar && (
                <AtoCreateDialog
                    onClose={() => setDialogCriar(false)}
                    onSaved={() => void buscar()}
                />
            )}

            {previewDocumento && (
                <PreviewImg
                    src={previewDocumento.src}
                    fileName={previewDocumento.fileName}
                    mimeType={previewDocumento.mimeType}
                    onClose={() => setPreviewDocumento(null)}
                />
            )}

            {dialogVerId && (
                <AtoVerDialog atoId={dialogVerId} onClose={() => setDialogVerId(null)} />
            )}

            {dialogEditar && (
                <AtoEditDialog
                    ato={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir ato"
                    message={`Deseja excluir o ato "${dialogDeletar.tipo.nome} nº ${dialogDeletar.numero}"? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await atosApi.remove(dialogDeletar.id);
                        void buscar();
                    }}
                    onClose={() => setDialogDeletar(null)}
                />
            )}
        </main>
    );
}
