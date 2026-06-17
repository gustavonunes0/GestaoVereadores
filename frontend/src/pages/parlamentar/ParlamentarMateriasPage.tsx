import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { useAuth } from '../../contexts/AuthContext';
import { materiasApi, type Materia } from '../../api/legislative/materias.api';
import { MateriaVerDialog } from '../../components/materias/MateriaVerDialog';
import { MateriaStatusBadge } from '../../components/materias/MateriaStatusBadge';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import { useAppToast } from '../../hooks/useAppToast';

export function ParlamentarMateriasPage() {
    const { user } = useAuth();
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<Materia[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [dialogVer, setDialogVer] = useState<Materia | null>(null);

    const buscar = useCallback(async () => {
        if (!user?.parliamentarianId) return;
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
    }, [page, user?.parliamentarianId, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    const columns = (
        <>
            <Column
                header="Identificação"
                body={(row: Materia) => <span className="font-medium">{row.identificacao}</span>}
                style={{ width: '10rem' }}
            />
            <Column
                header="Ementa"
                body={(row: Materia) => (
                    <span className="text-sm" title={row.ementa}>
                        {row.ementa.length > 80 ? `${row.ementa.slice(0, 80)}…` : row.ementa}
                    </span>
                )}
            />
            <Column
                header="Status"
                body={(row: Materia) => <MateriaStatusBadge status={row.status} />}
                style={{ width: '9rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.materias}
                title="Minhas matérias"
                subtitle="Matérias onde você é autor, coautor ou relator."
            />

            <section aria-label="Lista de matérias">
                <DataTableLayout<Materia>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={false}
                onVer={(item) => setDialogVer(item)}
                />
            </section>

            {dialogVer && (
                <MateriaVerDialog
                    materia={dialogVer}
                    onClose={() => setDialogVer(null)}
                />
            )}
        </main>
    );
}
