import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from '../../ui';
import { sessoesApi } from '../../../api/legislative/sessoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import type { TipoVotacao } from '../../../types/legislative';
import { pautaItemRotulo, type PautaItemDetalhe } from '../../../types/sessoes';

const TIPO_VOTACAO_OPTIONS: { label: string; value: TipoVotacao }[] = [
    { label: 'Nominal', value: 'NOMINAL' },
    { label: 'Simbólica', value: 'SIMBOLICA' },
    { label: 'Secreta', value: 'SECRETA' },
];

interface Props {
    sessaoId: string;
    item: PautaItemDetalhe;
    onClose: () => void;
    onAberta: () => void;
}

export function AbrirVotacaoDialog({ sessaoId, item, onClose, onAberta }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const [tipoVotacao, setTipoVotacao] = useState<TipoVotacao>('NOMINAL');
    const [saving, setSaving] = useState(false);

    const rotulo = pautaItemRotulo(item);

    async function confirmar() {
        setSaving(true);
        try {
            await sessoesApi.abrirVotacao(sessaoId, item.id, { tipoVotacao });
            showSuccess('Votação aberta. A matéria está em votação.');
            onAberta();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
            <Button
                label="Abrir votação"
                icon="pi pi-play"
                loading={saving}
                onClick={() => void confirmar()}
            />
        </div>
    );

    return (
        <Dialog
            header="Abrir votação"
            visible
            onHide={onClose}
            style={{ width: 'min(92vw, 460px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <p className="mt-0 mb-3 text-sm">
                    Abrir votação para <strong>{rotulo}</strong>. O status da matéria passará para{' '}
                    <strong>Em votação</strong>.
                </p>
                <div className="sigl-grid-12">
                    <div className="sigl-col-6">
                        <Dropdown
                            id="abrir-votacao-tipo"
                            label="Tipo de votação"
                            value={tipoVotacao}
                            options={TIPO_VOTACAO_OPTIONS}
                            onChange={(v) => setTipoVotacao(v as TipoVotacao)}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
