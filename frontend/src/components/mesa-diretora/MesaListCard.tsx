import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { Board } from '../../api/legislative/mesa-diretora.api';
import { formatDatePt } from '../../utils/formatDate';
import { MesaComposicaoTable } from './MesaComposicaoTable';

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativa',
    INACTIVE: 'Inativa',
    FINISHED: 'Encerrada',
};

type Props = {
    board: Board;
    legislaturaNumero?: number;
    canEdit?: boolean;
    onEdit?: () => void;
    onChanged: () => void;
};

export function MesaListCard({
    board,
    legislaturaNumero,
    canEdit,
    onEdit,
    onChanged,
}: Props) {
    const legislatura =
        board.legislature?.number ?? legislaturaNumero ?? '—';

    return (
        <article className="mesa-list-card">
            <header className="mesa-list-card__header">
                <div>
                    <h2 className="mesa-list-card__name">{board.name}</h2>
                    <p className="mesa-list-card__meta">
                        {legislatura}ª legislatura
                        {board.startDate
                            ? ` · Início ${formatDatePt(board.startDate)}`
                            : ''}
                    </p>
                </div>
                <div className="mesa-list-card__actions">
                    {canEdit && onEdit ? (
                        <Button
                            type="button"
                            icon="pi pi-pencil"
                            rounded
                            text
                            aria-label="Editar nome da mesa"
                            onClick={onEdit}
                        />
                    ) : null}
                    <Tag
                        value={STATUS_LABEL[board.status] ?? board.status}
                        severity={board.status === 'ACTIVE' ? 'success' : 'secondary'}
                        className="text-xs"
                    />
                </div>
            </header>

            <MesaComposicaoTable
                boardId={board.id}
                entityLabel="mesa diretora"
                membros={board.members ?? []}
                onChanged={onChanged}
            />
        </article>
    );
}
