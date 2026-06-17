import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { SelectButton } from 'primereact/selectbutton';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    sessaoId: string;
    pautaItemId: string;
    parlamentarId: string;
    onClose: () => void;
    onSaved: () => void;
}

const VOTO_OPTIONS = [
    { label: 'Sim', value: 'SIM' },
    { label: 'Não', value: 'NAO' },
    { label: 'Abstenção', value: 'ABSTENCAO' },
];

export function RegistrarVotoDialog({ sessaoId, pautaItemId, parlamentarId, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [voto, setVoto] = useState<string>('SIM');
    const [loading, setLoading] = useState(false);

    async function handleConfirmar() {
        setLoading(true);
        try {
            await sessoesApi.registrarVoto(sessaoId, pautaItemId, {
                parlamentarId,
                voto,
            });
            showSuccess('Voto registrado com sucesso.');
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
                label="Confirmar Voto"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleConfirmar()}
            />
        </div>
    );

    return (
        <Dialog
            header="Registrar Meu Voto"
            visible
            onHide={onClose}
            style={{ width: '360px' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Voto</span>
                    <p className="m-0 text-color-secondary">Selecione seu voto para esta matéria:</p>
                    <div className="flex justify-content-center">
                        <SelectButton
                            value={voto}
                            options={VOTO_OPTIONS}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setVoto(e.value)}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
