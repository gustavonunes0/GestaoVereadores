import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { mesaDiretoraApi, type Board } from '../../api/legislative/mesa-diretora.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    board: Board;
    onClose: () => void;
    onSaved: () => void;
}

export function MesaEditDialog({ board, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [name, setName] = useState(board.name);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        const trimmed = name.trim();
        if (!trimmed) return;

        setLoading(true);
        try {
            await mesaDiretoraApi.update(board.id, { name: trimmed });
            showSuccess('Nome da mesa atualizado.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                disabled={!name.trim()}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Editar mesa diretora"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 480px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="mesa-edit-nome">Nome</label>
                        <InputText
                            id="mesa-edit-nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
