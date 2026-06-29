import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { SessaoDialogFormFields } from './SessaoDialogFormFields';

interface Props {
    sessaoLegislativaId?: string;
    legislaturaLabel?: string;
    onClose: () => void;
    onSaved: () => void;
}

export function SessaoCreateDialog({
    sessaoLegislativaId,
    legislaturaLabel,
    onClose,
    onSaved,
}: Props) {
    const { tiposSessao, situacoesSessao } = useDominios();
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [tipoSessaoId, setTipoSessaoId] = useState('');
    const [mensagem, setMensagem] = useState('');

    useEffect(() => {
        if (!tipoSessaoId && tiposSessao[0]) {
            setTipoSessaoId(tiposSessao[0].id);
        }
    }, [tiposSessao, tipoSessaoId]);

    const situacaoAgendada =
        situacoesSessao.find((s) => s.codigo === 'AGENDADA')?.nome ?? 'Agendada';

    async function submit() {
        if (!dataInicio || !tipoSessaoId) return;
        setSaving(true);
        try {
            await sessoesApi.create({
                dataInicio: new Date(dataInicio).toISOString(),
                tipoSessaoId,
                sessaoLegislativaId: sessaoLegislativaId || undefined,
                mensagem: mensagem.trim() || undefined,
            });
            showSuccess('Sessão plenária cadastrada.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Cancelar"
                severity="secondary"
                onClick={onClose}
                disabled={saving}
            />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={saving}
                onClick={() => void submit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Nova sessão plenária"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 640px)' }}
            footer={footer}
            modal
        >
            <SessaoDialogFormFields
                idPrefix="create"
                dataInicio={dataInicio}
                onDataInicioChange={setDataInicio}
                tipoSessaoId={tipoSessaoId}
                onTipoSessaoIdChange={setTipoSessaoId}
                tiposSessao={tiposSessao}
                situacaoLabel={situacaoAgendada}
                legislaturaLabel={legislaturaLabel}
                mensagem={mensagem}
                onMensagemChange={setMensagem}
            />
        </Dialog>
    );
}
