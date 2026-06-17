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
    onChanged: () => void;
};

export function MesaListCard({ board, legislaturaNumero, onChanged }: Props) {
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
                <Tag
                    value={STATUS_LABEL[board.status] ?? board.status}
                    severity={board.status === 'ACTIVE' ? 'success' : 'secondary'}
                    className="text-xs"
                />
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
