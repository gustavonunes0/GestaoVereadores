import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { atosApi, type CreateAtoDto } from '../../api/atos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, mapDropdownOptions, withEmptyOption } from '../../components/ui';

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
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Dados do ato</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="a-tipo">Tipo de ato *</label>
                            <Dropdown
                                id="a-tipo"
                                value={form.tipoId ?? ''}
                                options={mapDropdownOptions(tiposAto, 'nome', 'id')}
                                onChange={(v) => patch({ tipoId: String(v) })}
                                placeholder="Selecione"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="a-class">Classificação</label>
                            <Dropdown
                                id="a-class"
                                value={form.classificacaoId ?? ''}
                                options={withEmptyOption(
                                    mapDropdownOptions(classificacoesAto, 'nome', 'id'),
                                    'Nenhuma',
                                )}
                                onChange={(v) => patch({ classificacaoId: v ? String(v) : undefined })}
                                placeholder="Selecione"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="a-numero">Número do ato *</label>
                            <InputText
                                id="a-numero"
                                value={form.numero ?? ''}
                                onChange={(e) => patch({ numero: e.target.value })}
                                placeholder="Ex.: 012/2026"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="a-data"
                                label="Data do ato"
                                value={form.dataAto ? new Date(form.dataAto) : null}
                                onChange={(d) =>
                                    patch({ dataAto: d ? d.toISOString().split('T')[0] : undefined })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="a-ementa">Ementa</label>
                        <InputTextarea
                            id="a-ementa"
                            value={form.ementa ?? ''}
                            onChange={(e) => patch({ ementa: e.target.value })}
                            rows={3}
                            placeholder="Descrição resumida do ato"
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Publicação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="a-pub"
                                label="Data de publicação"
                                value={form.dataPublicacao ? new Date(form.dataPublicacao) : null}
                                onChange={(d) =>
                                    patch({ dataPublicacao: d ? d.toISOString().split('T')[0] : undefined })
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
