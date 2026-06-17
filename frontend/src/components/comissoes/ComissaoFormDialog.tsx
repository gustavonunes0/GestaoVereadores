import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import type { Committee, CommitteeInput, CommitteeStatus, CommitteeType } from '../../api/legislative/comissoes.api';
import { Dropdown } from '../ui';

export const TYPE_OPTIONS: { label: string; value: CommitteeType }[] = [
    { label: 'Permanente', value: 'PERMANENT' },
    { label: 'Temporária', value: 'TEMPORARY' },
];

export const STATUS_OPTIONS: { label: string; value: CommitteeStatus }[] = [
    { label: 'Ativa', value: 'ACTIVE' },
    { label: 'Inativa', value: 'INACTIVE' },
    { label: 'Encerrada', value: 'FINISHED' },
];

export type ComissaoFormState = {
    name: string;
    acronym: string;
    type: CommitteeType;
    purpose: string;
    startDate: string;
    endDate: string;
    status: CommitteeStatus;
    notes: string;
};

export function emptyComissaoForm(): ComissaoFormState {
    return {
        name: '',
        acronym: '',
        type: 'PERMANENT',
        purpose: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
        notes: '',
    };
}

export function comissaoToForm(row: Committee): ComissaoFormState {
    return {
        name: row.name,
        acronym: row.acronym ?? '',
        type: row.type,
        purpose: row.purpose,
        startDate: row.startDate?.slice(0, 10) ?? '',
        endDate: row.endDate?.slice(0, 10) ?? '',
        status: row.status,
        notes: row.notes ?? '',
    };
}

export function buildComissaoPayload(form: ComissaoFormState): CommitteeInput {
    const trim = (s: string) => s.trim() || undefined;
    const dateIso = (d: string) => (d ? new Date(d).toISOString() : undefined);
    return {
        name: form.name.trim(),
        acronym: trim(form.acronym),
        type: form.type,
        purpose: form.purpose.trim(),
        startDate: dateIso(form.startDate),
        endDate: dateIso(form.endDate),
        status: form.status,
        notes: trim(form.notes),
    };
}

interface Props {
    title: string;
    initial: ComissaoFormState;
    loading: boolean;
    onClose: () => void;
    onSubmit: (form: ComissaoFormState) => void;
}

export function ComissaoFormDialog({ title, initial, loading, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<ComissaoFormState>(initial);
    const patch = (v: Partial<ComissaoFormState>) => setForm((f) => ({ ...f, ...v }));

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => onSubmit(form)}
                disabled={!form.name.trim() || !form.purpose.trim()}
            />
        </div>
    );

    return (
        <Dialog
            header={title}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 680px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-nome">Nome *</label>
                            <InputText
                                id="com-nome"
                                value={form.name}
                                onChange={(e) => patch({ name: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-sigla">Sigla</label>
                            <InputText
                                id="com-sigla"
                                value={form.acronym}
                                onChange={(e) => patch({ acronym: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Classificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-tipo">Tipo *</label>
                            <Dropdown
                                id="com-tipo"
                                value={form.type}
                                options={TYPE_OPTIONS}
                                onChange={(v) => patch({ type: String(v) as CommitteeType })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-status">Situação</label>
                            <Dropdown
                                id="com-status"
                                value={form.status}
                                options={STATUS_OPTIONS}
                                onChange={(v) => patch({ status: String(v) as CommitteeStatus })}
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="com-finalidade">Finalidade *</label>
                        <InputTextarea
                            id="com-finalidade"
                            value={form.purpose}
                            onChange={(e) => patch({ purpose: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Período</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-inicio">Início</label>
                            <InputText
                                id="com-inicio"
                                type="date"
                                value={form.startDate}
                                onChange={(e) => patch({ startDate: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="com-fim">Fim</label>
                            <InputText
                                id="com-fim"
                                type="date"
                                value={form.endDate}
                                onChange={(e) => patch({ endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Observações</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="com-obs">Observações</label>
                        <InputTextarea
                            id="com-obs"
                            value={form.notes}
                            onChange={(e) => patch({ notes: e.target.value })}
                            rows={2}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
