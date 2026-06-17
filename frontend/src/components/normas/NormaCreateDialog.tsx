import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { normasApi, type CreateNormaDto } from '../../api/normas.api';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { DatePicker, Dropdown, mapDropdownOptions, withEmptyOption } from '../../components/ui';

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

export function NormaCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposNorma, anos, esferasFederacao } = useDominios();
    const [loading, setLoading] = useState(false);
    const [materiasAprovadas, setMateriasAprovadas] = useState<{ id: string; identificacao?: string; ementa: string }[]>([]);

    const [form, setForm] = useState<Partial<CreateNormaDto>>({
        complementar: false,
    });

    useEffect(() => {
        materiasApi.list({ status: 'APROVADA', limit: 200 })
            .then((r) => setMateriasAprovadas(r.data as unknown as typeof materiasAprovadas))
            .catch(() => setMateriasAprovadas([]));
    }, []);

    useEffect(() => {
        if (tiposNorma[0] && !form.tipoId) {
            setForm((f) => ({ ...f, tipoId: tiposNorma[0].id }));
        }
        if (anos[0] && !form.anoId) {
            setForm((f) => ({ ...f, anoId: anos[0].id }));
        }
        if (esferasFederacao[0] && !form.esferaFederacaoId) {
            setForm((f) => ({ ...f, esferaFederacaoId: esferasFederacao[0].id }));
        }
    }, [tiposNorma, anos, esferasFederacao, form.tipoId, form.anoId, form.esferaFederacaoId]);

    function patch(values: Partial<CreateNormaDto>) {
        setForm((f) => ({ ...f, ...values }));
    }

    async function handleSubmit() {
        if (!form.tipoId || !form.numero?.trim() || !form.anoId || !form.esferaFederacaoId || !form.ementa?.trim()) {
            return;
        }
        setLoading(true);
        try {
            await normasApi.create(form as CreateNormaDto);
            showSuccess('Norma jurídica registrada com sucesso.');
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
                label="Registrar norma"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Registrar Norma Jurídica"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 700px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-tipo">Espécie normativa *</label>
                            <Dropdown
                                id="n-tipo"
                                value={form.tipoId ?? ''}
                                options={mapDropdownOptions(tiposNorma, 'nome', 'id')}
                                onChange={(v) => patch({ tipoId: String(v) })}
                                placeholder="Selecione"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-numero">Número *</label>
                            <InputText
                                id="n-numero"
                                value={form.numero ?? ''}
                                onChange={(e) => patch({ numero: e.target.value })}
                                placeholder="Ex.: 1234"
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-ano">Ano *</label>
                            <Dropdown
                                id="n-ano"
                                value={form.anoId ?? ''}
                                options={anos.map((a) => ({ label: String(a.valor), value: a.id }))}
                                onChange={(v) => patch({ anoId: String(v) })}
                                placeholder="Selecione"
                            />
                        </div>
                    </div>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-esfera">Esfera *</label>
                            <Dropdown
                                id="n-esfera"
                                value={form.esferaFederacaoId ?? ''}
                                options={mapDropdownOptions(esferasFederacao, 'nome', 'id')}
                                onChange={(v) => patch({ esferaFederacaoId: String(v) })}
                                placeholder="Selecione"
                            />
                        </div>
                        <div className="sigl-filtro-campo flex align-items-end">
                            <div className="flex align-items-center gap-2">
                                <Checkbox
                                    inputId="n-complementar"
                                    checked={form.complementar ?? false}
                                    onChange={(e) => patch({ complementar: e.checked ?? false })}
                                />
                                <label htmlFor="n-complementar">Lei Complementar</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="n-ementa">Ementa *</label>
                        <InputTextarea
                            id="n-ementa"
                            value={form.ementa ?? ''}
                            onChange={(e) => patch({ ementa: e.target.value })}
                            rows={3}
                            placeholder="Resumo do objeto e alcance da norma"
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Publicação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="n-publicacao"
                                label="Data de publicação"
                                value={form.dataPublicacao ? new Date(form.dataPublicacao) : null}
                                onChange={(d) =>
                                    patch({ dataPublicacao: d ? d.toISOString().split('T')[0] : undefined })
                                }
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-veiculo">Veículo de publicação</label>
                            <InputText
                                id="n-veiculo"
                                value={form.veiculoPublicacao ?? ''}
                                onChange={(e) => patch({ veiculoPublicacao: e.target.value })}
                                placeholder="Ex.: Diário Oficial"
                            />
                        </div>
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Vínculo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="n-materia">Matéria de origem (aprovada)</label>
                        {materiasAprovadas.length === 0 && (
                            <Message
                                severity="warn"
                                text="Nenhuma matéria aprovada disponível."
                                className="mb-2"
                            />
                        )}
                        <Dropdown
                            id="n-materia"
                            value={form.materiaOrigemId ?? ''}
                            options={withEmptyOption(
                                mapDropdownOptions(materiasAprovadas, 'ementa', 'id'),
                                'Nenhuma',
                            )}
                            onChange={(v) => patch({ materiaOrigemId: v ? String(v) : undefined })}
                            placeholder="Opcional — vincule a matéria aprovada"
                            disabled={materiasAprovadas.length === 0}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
