import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { sessoesApi } from '../../api/legislative/sessoes.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { SESSAO_STATUS } from '../../types/legislative';
import { type Sessao, sessaoLabel, toDateTimeLocal } from './sessao.types';
import { SessaoDialogFormFields } from './SessaoDialogFormFields';

interface Props {
    sessao: Sessao;
    onClose: () => void;
    onSaved: () => void;
}

export function SessaoEditDialog({ sessao, onClose, onSaved }: Props) {
    const { tiposSessao } = useDominios();
    const { showSuccess, showApiError } = useAppToast();
    const [saving, setSaving] = useState(false);
    const [dataInicio, setDataInicio] = useState(toDateTimeLocal(sessao.dataInicio));
    const [tipoSessaoId, setTipoSessaoId] = useState(
        sessao.tipo?.id ?? tiposSessao[0]?.id ?? '',
    );
    const [mensagem, setMensagem] = useState(sessao.mensagem ?? '');

    async function submit() {
        if (!dataInicio || !tipoSessaoId) return;
        setSaving(true);
        try {
            await sessoesApi.update(sessao.id, {
                dataInicio: new Date(dataInicio).toISOString(),
                tipoSessaoId,
                sessaoLegislativaId: sessao.sessaoLegislativaId ?? undefined,
                mensagem: mensagem.trim() || undefined,
            });
            showSuccess('Sessão atualizada.');
            onSaved();
            onClose();
        } catch (err) {
            showApiError(err);
        } finally {
            setSaving(false);
        }
    }

    const situacaoLabel = sessao.statusSessao
        ? SESSAO_STATUS[sessao.statusSessao]
        : (sessao.situacao?.nome ?? '—');

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={saving} />
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
            header={`Editar — ${sessaoLabel(sessao)}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 640px)' }}
            footer={footer}
            modal
        >
            <SessaoDialogFormFields
                idPrefix="edit"
                dataInicio={dataInicio}
                onDataInicioChange={setDataInicio}
                tipoSessaoId={tipoSessaoId}
                onTipoSessaoIdChange={setTipoSessaoId}
                tiposSessao={tiposSessao}
                situacaoLabel={situacaoLabel}
                mensagem={mensagem}
                onMensagemChange={setMensagem}
            />
        </Dialog>
    );
}
