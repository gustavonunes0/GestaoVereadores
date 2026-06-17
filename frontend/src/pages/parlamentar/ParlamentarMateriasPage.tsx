import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { usePermissions } from '../../hooks/usePermissions';
import { materiasApi, type Materia } from '../../api/legislative/materias.api';
import { MateriaListCard } from '../../components/materias/MateriaListCard';
import { MateriaVerDialog } from '../../components/materias/MateriaVerDialog';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import { PreviewImg } from '../../components/ui';
import { useAppToast } from '../../hooks/useAppToast';
import {
    resolveMateriaTextoOriginalUrl,
    resolveMateriaTitulo,
} from '../../utils/materiaDisplay';

type TextoOriginalPreview = {
    src: string;
    fileName: string;
    mimeType?: string;
};

export function ParlamentarMateriasPage() {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<Materia[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [dialogVerId, setDialogVerId] = useState<string | null>(null);
    const [previewTextoOriginal, setPreviewTextoOriginal] =
        useState<TextoOriginalPreview | null>(null);

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

    const buscar = useCallback(async () => {
        if (!parliamentarianId) return;
        setLoading(true);
        try {
            const res = await materiasApi.list({
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
    }, [page, parliamentarianId, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const columns = (
        <Column
            body={(row: Materia) => (
                <MateriaListCard
                    materia={row}
                    onVer={() => handleVer(row)}
                />
            )}
        />
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.materias}
                title="Minhas matérias"
                subtitle="Matérias onde você é autor, coautor ou relator."
            />

            <section aria-label="Lista de matérias" className="materias-table-section">
                <DataTableLayout<Materia>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                enableSort={false}
                hideActionsColumn
                tableClassName="materias-datatable materias-datatable--cards"
                canWrite={false}
                />
            </section>

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
        </main>
    );
}
