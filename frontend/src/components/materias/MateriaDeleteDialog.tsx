import { DeleteDialog } from '../common/DeleteDialog';
import { materiasApi } from '../../api/legislative/materias.api';
import type { Materia } from '../../api/legislative/materias.api';

interface Props {
    materia: Materia;
    onClose: () => void;
    onDeleted: () => void;
}

export function MateriaDeleteDialog({ materia, onClose, onDeleted }: Props) {
    return (
        <DeleteDialog
            visible
            title="Excluir Matéria"
            message={`Deseja excluir a matéria "${materia.identificacao}"? Esta ação não pode ser desfeita.`}
            onConfirm={async () => {
                await materiasApi.remove(materia.id);
                onDeleted();
            }}
            onClose={onClose}
        />
    );
}
