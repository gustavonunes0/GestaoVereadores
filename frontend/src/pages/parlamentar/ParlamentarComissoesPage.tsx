import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { comissoesApi } from '../../api/legislative/comissoes.api';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import { useAppToast } from '../../hooks/useAppToast';
import { useAuth } from '../../contexts/AuthContext';

interface Comissao {
    id: string;
    nome: string;
    tipo?: string;
    status?: string;
    papel?: string;
}

export function ParlamentarComissoesPage() {
    const { user } = useAuth();
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<Comissao[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const buscar = useCallback(async () => {
        setLoading(true);
        try {
            const res = await comissoesApi.list({ page, limit: 20 });
            setItems(res.data as unknown as Comissao[]);
            setTotal(res.meta.total);
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [page, showApiError]);

    useEffect(() => {
        void buscar();
    }, [buscar]);

    void user;

    const columns = (
        <>
            <Column
                header="Comissão"
                body={(row: Comissao) => <span className="font-medium">{row.nome}</span>}
            />
            <Column
                header="Tipo"
                body={(row: Comissao) => row.tipo ?? '—'}
                style={{ width: '10rem' }}
            />
            <Column
                header="Papel"
                body={(row: Comissao) =>
                    row.papel ? <Tag value={row.papel} severity="info" /> : <span>—</span>
                }
                style={{ width: '8rem' }}
            />
            <Column
                header="Status"
                body={(row: Comissao) => row.status ?? '—'}
                style={{ width: '8rem' }}
            />
        </>
    );

    return (
        <main>
            <PageHeader
                icon={MODULE_ICONS.comissoes}
                title="Minhas comissões"
                subtitle="Comissões das quais você participa."
            />

            <section aria-label="Lista de comissões">
                <DataTableLayout<Comissao>
                items={items}
                total={total}
                loading={loading}
                page={page}
                onPageChange={setPage}
                columns={columns}
                canWrite={false}
                />
            </section>
        </main>
    );
}
