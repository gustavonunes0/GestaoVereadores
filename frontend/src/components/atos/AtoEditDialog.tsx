import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { atosApi, type Ato, type CreateAtoDto } from '../../api/atos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, FileUpload, mapDropdownOptions, withEmptyOption } from '../ui';

interface Props {
    ato: Ato;
    onClose: () => void;
    onSaved: () => void;
}

export function AtoEditDialog({ ato, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposAto, classificacoesAto } = useDominios();
    const [loading, setLoading] = useState(false);
    const [anexo, setAnexo] = useState<File | null>(null);
    const [form, setForm] = useState<Partial<CreateAtoDto>>({
        tipoId: ato.tipo.id,
        classificacaoId: ato.classificacao?.id,
        numero: ato.numero,
        dataAto: ato.dataAto,
        dataPublicacao: ato.dataPublicacao,
        ementa: ato.ementa,
    });

    useEffect(() => {
        setForm({
            tipoId: ato.tipo.id,
            classificacaoId: ato.classificacao?.id,
            numero: ato.numero,
            dataAto: ato.dataAto,
            dataPublicacao: ato.dataPublicacao,
            ementa: ato.ementa,
        });
    }, [ato]);

    function patch(values: Partial<CreateAtoDto>) {
        setForm((f) => ({ ...f, ...values }));
    }

    async function handleSubmit() {
        if (!form.tipoId || !form.numero?.trim()) return;
        setLoading(true);
        try {
            await atosApi.update(ato.id, form);
            if (anexo) {
                await atosApi.uploadAnexo(ato.id, anexo);
            }
            showSuccess('Ato administrativo atualizado com sucesso.');
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
                label="Salvar alterações"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${ato.tipo.nome} nº ${ato.numero}`}
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
                            <label htmlFor="ae-tipo">Tipo de ato *</label>
                            <Dropdown
                                id="ae-tipo"
                                value={form.tipoId ?? ''}
                                options={mapDropdownOptions(tiposAto, 'nome', 'id')}
                                onChange={(v) => patch({ tipoId: String(v) })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ae-class">Classificação</label>
                            <Dropdown
                                id="ae-class"
                                value={form.classificacaoId ?? ''}
                                options={withEmptyOption(
                                    mapDropdownOptions(classificacoesAto, 'nome', 'id'),
                                    'Nenhuma',
                                )}
                                onChange={(v) =>
                                    patch({ classificacaoId: v ? String(v) : undefined })
                                }
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ae-numero">Número do ato *</label>
                            <InputText
                                id="ae-numero"
                                value={form.numero ?? ''}
                                onChange={(e) => patch({ numero: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="ae-data"
                                label="Data do ato"
                                value={form.dataAto ? new Date(form.dataAto) : null}
                                onChange={(d) =>
                                    patch({
                                        dataAto: d ? d.toISOString().split('T')[0] : undefined,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ae-ementa">Ementa</label>
                        <InputTextarea
                            id="ae-ementa"
                            value={form.ementa ?? ''}
                            onChange={(e) => patch({ ementa: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Publicação</span>
                    <div className="sigl-filtro-campo">
                        <DatePicker
                            id="ae-pub"
                            label="Data de publicação"
                            value={form.dataPublicacao ? new Date(form.dataPublicacao) : null}
                            onChange={(d) =>
                                patch({
                                    dataPublicacao: d
                                        ? d.toISOString().split('T')[0]
                                        : undefined,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Anexo</span>
                    {ato.anexoUrl ? (
                        <p className="text-sm text-color-secondary mb-2">
                            Anexo já enviado. Envie um novo arquivo para substituir.
                        </p>
                    ) : null}
                    <FileUpload
                        id="ae-anexo"
                        label="Documento do ato"
                        value={anexo}
                        onChange={setAnexo}
                    />
                </div>
            </div>
        </Dialog>
    );
}
