import { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import {
    comissoesApi,
    type Committee,
    type CommitteeStatus,
} from '../../api/legislative/comissoes.api';
import { DataTableLayout } from '../../components/common/DataTableLayout';
import { PageHeader } from '../../components/PageHeader';
import { MODULE_ICONS } from '../../app/navigation';
import {
    STATUS_OPTIONS,
    TYPE_OPTIONS,
} from '../../components/comissoes/ComissaoFormDialog';
import { useAppToast } from '../../hooks/useAppToast';
import { usePermissions } from '../../hooks/usePermissions';

type ComissaoParlamentar = Committee & { meuPapel: string };

const STATUS_SEVERITY: Record<
    CommitteeStatus,
    'success' | 'secondary' | 'danger'
> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    FINISHED: 'danger',
};

const PAGE_SIZE = 20;

export function ParlamentarComissoesPage() {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [items, setItems] = useState<ComissaoParlamentar[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const buscar = useCallback(async () => {
        if (!parliamentarianId) {
            setItems([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const res = await comissoesApi.list({ page: 1, limit: 100 });
            const minhas = res.data.flatMap((comissao) => {
                const membro = comissao.members?.find(
                    (m) => m.parliamentarian.id === parliamentarianId,
                );
                if (!membro) return [];
                return [{ ...comissao, meuPapel: membro.roleLabel }];
            });

            const offset = (page - 1) * PAGE_SIZE;
            setItems(minhas.slice(offset, offset + PAGE_SIZE));
            setTotal(minhas.length);
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
        <>
            <Column
                header="Comissão"
                body={(row: ComissaoParlamentar) => (
                    <span className="font-medium">
                        {row.acronym ? (
                            <>
                                <span className="text-color-secondary">
                                    {row.acronym}
                                </span>{' '}
                                —{' '}
                            </>
                        ) : null}
                        {row.name}
                    </span>
                )}
            />
            <Column
                header="Tipo"
                body={(row: ComissaoParlamentar) =>
                    TYPE_OPTIONS.find((t) => t.value === row.type)?.label ??
                    row.type
                }
                style={{ width: '10rem' }}
            />
            <Column
                header="Papel"
                body={(row: ComissaoParlamentar) => (
                    <Tag value={row.meuPapel} severity="info" />
                )}
                style={{ width: '8rem' }}
            />
            <Column
                header="Status"
                body={(row: ComissaoParlamentar) => (
                    <Tag
                        value={
                            STATUS_OPTIONS.find((s) => s.value === row.status)
                                ?.label ?? row.status
                        }
                        severity={STATUS_SEVERITY[row.status]}
                    />
                )}
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
                <DataTableLayout<ComissaoParlamentar>
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
