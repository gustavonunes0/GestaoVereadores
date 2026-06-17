import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';

/** PrimeReact só reconhece <Column> como filhos diretos do DataTable. */
function flattenColumns(columns: ReactNode): ReactNode[] {
    const result: ReactNode[] = [];
    Children.forEach(columns, (child) => {
        if (isValidElement(child) && child.type === Fragment) {
            Children.forEach(
                (child.props as { children?: ReactNode }).children,
                (nested) => {
                    if (nested != null && nested !== false) result.push(nested);
                },
            );
            return;
        }
        if (child != null && child !== false) result.push(child);
    });
    return result;
}

interface DataTableLayoutProps<T extends object> {
    items: T[];
    total: number;
    loading: boolean;
    page: number;
    limit?: number;
    dataKey?: string;
    onPageChange: (page: number) => void;
    columns: React.ReactNode;
    enableSort?: boolean;
    sortField?: string;
    sortOrder?: 1 | -1 | 0 | null;
    canWrite?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    onVer?: (item: T) => void;
    onEditar?: (item: T) => void;
    onDeletar?: (item: T) => void;
    tableClassName?: string;
    actionsColumnWidth?: string;
    hideActionsColumn?: boolean;
}

export function DataTableLayout<T extends object>({
    items,
    total,
    loading,
    page,
    limit = 20,
    dataKey = 'id',
    onPageChange,
    columns,
    enableSort = true,
    sortField = 'createdAt',
    sortOrder = -1,
    canWrite,
    canEdit,
    canDelete,
    onVer,
    onEditar,
    onDeletar,
    tableClassName,
    actionsColumnWidth = '8rem',
    hideActionsColumn = false,
}: DataTableLayoutProps<T>) {
    const allowEdit = canEdit ?? canWrite ?? false;
    const allowDelete = canDelete ?? canWrite ?? false;

    return (
        <DataTable
            value={items}
            dataKey={dataKey}
            size="small"
            paginator
            rows={limit}
            totalRecords={total}
            first={(page - 1) * limit}
            onPage={(e) => onPageChange(Math.floor(e.first / limit) + 1)}
            lazy
            loading={loading}
            {...(enableSort ? { sortField, sortOrder } : {})}
            emptyMessage="Nenhum registro encontrado"
            className={tableClassName ? `sigl-datatable ${tableClassName}` : 'sigl-datatable'}
        >
            {flattenColumns(columns)}
            {!hideActionsColumn && (
            <Column
                header="Ações"
                style={{ width: actionsColumnWidth }}
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
                        {allowEdit && onEditar && (
                            <Button
                                icon="pi pi-pencil"
                                rounded
                                text
                                size="small"
                                aria-label="Editar"
                                onClick={() => onEditar(row)}
                            />
                        )}
                        {allowDelete && onDeletar && (
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
            )}
        </DataTable>
    );
}
