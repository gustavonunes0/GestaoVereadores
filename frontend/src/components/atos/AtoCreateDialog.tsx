import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { atosApi, type CreateAtoDto } from '../../api/atos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export function AtoCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposAto, classificacoesAto } = useDominios();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Partial<CreateAtoDto>>({});

    useEffect(() => {
        if (tiposAto[0] && !form.tipoId) {
            setForm((f) => ({ ...f, tipoId: tiposAto[0].id }));
        }
        if (classificacoesAto[0] && !form.classificacaoId) {
            setForm((f) => ({ ...f, classificacaoId: classificacoesAto[0].id }));
        }
    }, [tiposAto, classificacoesAto, form.tipoId, form.classificacaoId]);

    function patch(values: Partial<CreateAtoDto>) {
        setForm((f) => ({ ...f, ...values }));
    }

    async function handleSubmit() {
        if (!form.tipoId || !form.numero?.trim()) return;
        setLoading(true);
        try {
            await atosApi.create(form as CreateAtoDto);
            showSuccess('Ato administrativo registrado com sucesso.');
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
                label="Registrar ato"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Registrar Ato Administrativo"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 650px)' }}
            footer={footer}
            modal
        >
            <div className="grid p-fluid">
                <div className="col-12 md:col-6">
                    <label htmlFor="a-tipo">Tipo de ato *</label>
                    <Dropdown
                        id="a-tipo"
                        value={form.tipoId}
                        options={tiposAto}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => patch({ tipoId: e.value })}
                        placeholder="Selecione"
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="a-class">Classificação</label>
                    <Dropdown
                        id="a-class"
                        value={form.classificacaoId}
                        options={classificacoesAto}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => patch({ classificacaoId: e.value })}
                        placeholder="Selecione"
                        showClear
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="a-numero">Número do ato *</label>
                    <InputText
                        id="a-numero"
                        value={form.numero ?? ''}
                        onChange={(e) => patch({ numero: e.target.value })}
                        placeholder="Ex.: 012/2026"
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="a-data">Data do ato</label>
                    <Calendar
                        id="a-data"
                        value={form.dataAto ? new Date(form.dataAto) : null}
                        onChange={(e) =>
                            patch({ dataAto: e.value ? (e.value as Date).toISOString().split('T')[0] : undefined })
                        }
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>
                <div className="col-12">
                    <label htmlFor="a-ementa">Ementa</label>
                    <InputTextarea
                        id="a-ementa"
                        value={form.ementa ?? ''}
                        onChange={(e) => patch({ ementa: e.target.value })}
                        rows={3}
                        placeholder="Descrição resumida do ato"
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="a-pub">Data de publicação</label>
                    <Calendar
                        id="a-pub"
                        value={form.dataPublicacao ? new Date(form.dataPublicacao) : null}
                        onChange={(e) =>
                            patch({ dataPublicacao: e.value ? (e.value as Date).toISOString().split('T')[0] : undefined })
                        }
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>
            </div>
        </Dialog>
    );
}
