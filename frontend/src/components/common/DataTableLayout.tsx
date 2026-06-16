import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

interface DataTableLayoutProps<T extends object> {
    items: T[];
    total: number;
    loading: boolean;
    page: number;
    limit?: number;
    onPageChange: (page: number) => void;
    columns: React.ReactNode;
    canWrite?: boolean;
    onVer?: (item: T) => void;
    onEditar?: (item: T) => void;
    onDeletar?: (item: T) => void;
}

export function DataTableLayout<T extends object>({
    items,
    total,
    loading,
    page,
    limit = 20,
    onPageChange,
    columns,
    canWrite,
    onVer,
    onEditar,
    onDeletar,
}: DataTableLayoutProps<T>) {
    return (
        <DataTable
            value={items}
            size="small"
            paginator
            rows={limit}
            totalRecords={total}
            first={(page - 1) * limit}
            onPage={(e) => onPageChange(Math.floor(e.first / limit) + 1)}
            lazy
            loading={loading}
            sortField="createdAt"
            sortOrder={-1}
            emptyMessage="Nenhum registro encontrado"
            className="sigl-datatable"
        >
            {columns}
            <Column
                header="Ações"
                style={{ width: '8rem' }}
                body={(row: T) => (
                    <div className="flex gap-1">
                        {onVer && (
                            <Button
                                icon="pi pi-eye"
                                rounded
                                text
                                size="small"
                                aria-label="Ver detalhes"
                                onClick={() => onVer(row)}
                            />
                        )}
                        {canWrite && onEditar && (
                            <Button
                                icon="pi pi-pencil"
                                rounded
                                text
                                size="small"
                                aria-label="Editar"
                                onClick={() => onEditar(row)}
                            />
                        )}
                        {canWrite && onDeletar && (
                            <Button
                                icon="pi pi-trash"
                                rounded
                                text
                                size="small"
                                severity="danger"
                                aria-label="Deletar"
                                onClick={() => onDeletar(row)}
                            />
                        )}
                    </div>
                )}
            />
        </DataTable>
    );
}
