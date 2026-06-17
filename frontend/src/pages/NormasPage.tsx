import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { normasApi, type Norma, type NormaFiltros } from '../api/normas.api';
import { MODULE_ICONS } from '../app/navigation';
import { DataTableLayout } from '../components/common/DataTableLayout';
import { DeleteDialog } from '../components/common/DeleteDialog';
import { FiltroLayout } from '../components/common/FiltroLayout';
import { PageHeader } from '../components/PageHeader';
import { NormaCreateDialog } from '../components/normas/NormaCreateDialog';
import { NormaEditDialog } from '../components/normas/NormaEditDialog';
import { NormaStatusBadge } from '../components/normas/NormaStatusBadge';
import { NormaVerDialog } from '../components/normas/NormaVerDialog';
import { DateRangePicker, Dropdown, mapDropdownOptions, PreviewImg, withEmptyOption } from '../components/ui';
import { useAppToast } from '../hooks/useAppToast';
import { useDominios } from '../hooks/useDominios';
import { usePermissions } from '../hooks/usePermissions';
import { formatDatePt } from '../utils/formatDate';
import { resolveMateriaTextoOriginalUrl } from '../utils/materiaDisplay';
import {
    formatNormaEspecie,
    formatNormaIdentificacao,
    resolveNormaAnoValor,
    resolveNormaStatus,
} from '../utils/normaDisplay';

const EMPTY_FILTROS: NormaFiltros = {
    tipoId: '',
    numero: '',
    search: '',
    anoId: '',
    esferaFederacaoId: '',
    page: 1,
    limit: 20,
};

type DocumentoPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

export function NormasPage() {
    const { tiposNorma, anos, esferasFederacao } = useDominios();
    const { canEdit, canDelete } = usePermissions();
    const { showApiError } = useAppToast();

    const [items, setItems] = useState<Norma[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filtros, setFiltros] = useState<NormaFiltros>({ ...EMPTY_FILTROS });
    const [filtrosApplied, setFiltrosApplied] = useState<NormaFiltros>({ ...EMPTY_FILTROS });
    const [dataNorma, setDataNorma] = useState<[Date | null, Date | null]>([null, null]);

    const [dialogCriar, setDialogCriar] = useState(false);
    const [previewDocumento, setPreviewDocumento] = useState<DocumentoPreview | null>(null);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);
    const [dialogEditar, setDialogEditar] = useState<Norma | null>(null);
    const [dialogDeletar, setDialogDeletar] = useState<Norma | null>(null);

    function handleVer(norma: Norma) {
        const url = norma.textoIntegralUrl?.trim();
        if (url) {
            const resolved = resolveMateriaTextoOriginalUrl(url);
            const isPdf = resolved.toLowerCase().includes('.pdf');
            setPreviewDocumento({
                src: resolved,
                fileName: `${formatNormaIdentificacao(norma)}${isPdf ? '.pdf' : ''}`,
                mimeType: isPdf ? 'application/pdf' : undefined,
            });
            return;
        }
        setDialogVerId(norma.id);
    }

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await normasApi.list({
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
            dataInicio: dataNorma[0]?.toISOString().slice(0, 10),
            dataFim: dataNorma[1]?.toISOString().slice(0, 10),
        });
    }

    function limparFiltros() {
        setFiltros({ ...EMPTY_FILTROS });
        setFiltrosApplied({ ...EMPTY_FILTROS });
        setDataNorma([null, null]);
        setPage(1);
    }

    const colunas = (
        <>
            <Column
                header="Espécie"
                body={(row: Norma) => (
                    <span className="font-medium">{formatNormaEspecie(row)}</span>
                )}
                style={{ width: '10rem' }}
            />
            <Column field="numero" header="Número" style={{ width: '6rem' }} />
            <Column
                header="Ano"
                body={(row: Norma) => resolveNormaAnoValor(row.ano) ?? '—'}
                style={{ width: '4.5rem' }}
            />
            <Column
                header="Ementa"
                body={(row: Norma) => (
                    <span
                        title={row.ementa}
                        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block"
                        style={{ maxWidth: '24rem' }}
                    >
                        {row.ementa}
                    </span>
                )}
            />
            <Column
                header="Status"
                body={(row: Norma) => <NormaStatusBadge status={resolveNormaStatus(row)} />}
                style={{ width: '8rem' }}
            />
            <Column
                header="Publicação"
                body={(row: Norma) => formatDatePt(row.dataPublicacao)}
                style={{ width: '7rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.normas}
                title="Normas jurídicas"
                actions={
                    (
                        <Button
                            label="Registrar norma"
                            icon="pi pi-plus"
                            onClick={() => setDialogCriar(true)}
                        />
                    )
                }
            />

            <section aria-label="Filtros de pesquisa" className="pt-4">
                <FiltroLayout onBuscar={aplicarFiltros} onLimpar={limparFiltros} loading={loading}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="nf-tipo">Espécie normativa</label>
                        <Dropdown
                            id="nf-tipo"
                            value={filtros.tipoId ?? ''}
                            options={withEmptyOption(mapDropdownOptions(tiposNorma, 'nome', 'id'))}
                            onChange={(v) => setFiltros((f) => ({ ...f, tipoId: String(v) }))}
                            placeholder="Todas"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="nf-numero">Número</label>
                        <InputText
                            id="nf-numero"
                            value={filtros.numero ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, numero: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="nf-ementa">Ementa contém</label>
                        <InputText
                            id="nf-ementa"
                            value={filtros.search ?? ''}
                            onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="nf-ano">Ano</label>
                        <Dropdown
                            id="nf-ano"
                            value={filtros.anoId ?? ''}
                            options={withEmptyOption(
                                anos.map((a) => ({ label: String(a.valor), value: a.id })),
                            )}
                            onChange={(v) => setFiltros((f) => ({ ...f, anoId: String(v) }))}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="nf-esfera">Esfera</label>
                        <Dropdown
                            id="nf-esfera"
                            value={filtros.esferaFederacaoId ?? ''}
                            options={withEmptyOption(
                                mapDropdownOptions(esferasFederacao, 'nome', 'id'),
                            )}
                            onChange={(v) =>
                                setFiltros((f) => ({ ...f, esferaFederacaoId: String(v) }))
                            }
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <DateRangePicker
                            id="nf-data"
                            label="Data"
                            value={dataNorma}
                            onChange={setDataNorma}
                            placeholder="Início — Fim"
                        />
                    </div>
                </FiltroLayout>
            </section>

            <section aria-label="Lista de normas jurídicas" className="normas-table-section">
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
                <NormaCreateDialog
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
                <NormaVerDialog
                    normaId={dialogVerId}
                    onClose={() => setDialogVerId(null)}
                />
            )}

            {dialogEditar && (
                <NormaEditDialog
                    norma={dialogEditar}
                    onClose={() => setDialogEditar(null)}
                    onSaved={() => void buscar()}
                />
            )}

            {dialogDeletar && (
                <DeleteDialog
                    visible
                    title="Excluir norma"
                    message={`Deseja excluir a norma "${formatNormaIdentificacao(dialogDeletar)}"? Esta ação não pode ser desfeita.`}
                    onConfirm={async () => {
                        await normasApi.remove(dialogDeletar.id);
                        void buscar();
                    }}
                    onClose={() => setDialogDeletar(null)}
                />
            )}
        </main>
    );
}
