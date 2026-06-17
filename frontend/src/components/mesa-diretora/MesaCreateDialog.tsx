import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { mesaDiretoraApi } from '../../api/legislative/mesa-diretora.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    legislatureId: string;
    legislaturaNumero?: number;
    onClose: () => void;
    onSaved: () => void;
}

export function MesaCreateDialog({
    legislatureId,
    legislaturaNumero,
    onClose,
    onSaved,
}: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        try {
            await mesaDiretoraApi.create({
                name: name.trim() || `Mesa Diretora ${legislaturaNumero ?? ''}ª`,
                legislatureId,
                startDate: new Date().toISOString(),
            });
            showSuccess('Mesa diretora criada com sucesso.');
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
                label="Criar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Nova mesa diretora"
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
                        <label htmlFor="mesa-nome">Nome</label>
                        <InputText
                            id="mesa-nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`Mesa ${legislaturaNumero ?? ''}ª legislatura`}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
