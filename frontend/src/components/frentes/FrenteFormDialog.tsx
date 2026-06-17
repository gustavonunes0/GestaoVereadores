import { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import type { FrontStatus } from '../../api/legislative/frentes.api';
import { Dropdown } from '../ui';

export const STATUS_OPTIONS: { label: string; value: FrontStatus }[] = [
    { label: 'Ativa', value: 'ACTIVE' },
    { label: 'Inativa', value: 'INACTIVE' },
    { label: 'Encerrada', value: 'FINISHED' },
];

export interface FrenteFormState {
    name: string;
    theme: string;
    description: string;
    startDate: string;
    endDate: string;
    status: FrontStatus;
}

export function emptyFrenteForm(): FrenteFormState {
    return { name: '', theme: '', description: '', startDate: '', endDate: '', status: 'ACTIVE' };
}

interface Props {
    title: string;
    initial: FrenteFormState;
    loading: boolean;
    onClose: () => void;
    onSubmit: (form: FrenteFormState) => void;
}

export function FrenteFormDialog({ title, initial, loading, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<FrenteFormState>(initial);
    const patch = (v: Partial<FrenteFormState>) => setForm((f) => ({ ...f, ...v }));

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" severity="secondary" onClick={onClose} disabled={loading} />
            <Button
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => onSubmit(form)}
                disabled={!form.name.trim() || !form.theme.trim()}
            />
        </div>
    );

    return (
        <Dialog
            header={title}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 600px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-nome">Nome *</label>
                            <InputText
                                id="fr-nome"
                                value={form.name}
                                onChange={(e) => patch({ name: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-status">Situação</label>
                            <Dropdown
                                id="fr-status"
                                value={form.status}
                                options={STATUS_OPTIONS}
                                onChange={(v) => patch({ status: String(v) as FrontStatus })}
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="fr-tema">Tema *</label>
                        <InputText
                            id="fr-tema"
                            value={form.theme}
                            onChange={(e) => patch({ theme: e.target.value })}
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="fr-desc">Descrição</label>
                        <InputTextarea
                            id="fr-desc"
                            value={form.description}
                            onChange={(e) => patch({ description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Período</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-inicio">Data de início</label>
                            <InputText
                                id="fr-inicio"
                                type="date"
                                value={form.startDate}
                                onChange={(e) => patch({ startDate: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="fr-fim">Data de fim</label>
                            <InputText
                                id="fr-fim"
                                type="date"
                                value={form.endDate}
                                onChange={(e) => patch({ endDate: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
