import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { normasApi, type CreateNormaDto } from '../../api/normas.api';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';

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
            <div className="grid p-fluid">
                <div className="col-12 md:col-6">
                    <label htmlFor="n-tipo">Espécie normativa *</label>
                    <Dropdown
                        id="n-tipo"
                        value={form.tipoId}
                        options={tiposNorma}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => patch({ tipoId: e.value })}
                        placeholder="Selecione"
                    />
                </div>
                <div className="col-12 md:col-3">
                    <label htmlFor="n-numero">Número *</label>
                    <InputText
                        id="n-numero"
                        value={form.numero ?? ''}
                        onChange={(e) => patch({ numero: e.target.value })}
                        placeholder="Ex.: 1234"
                    />
                </div>
                <div className="col-12 md:col-3">
                    <label htmlFor="n-ano">Ano *</label>
                    <Dropdown
                        id="n-ano"
                        value={form.anoId}
                        options={anos}
                        optionLabel="valor"
                        optionValue="id"
                        onChange={(e) => patch({ anoId: e.value })}
                        placeholder="Selecione"
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="n-esfera">Esfera *</label>
                    <Dropdown
                        id="n-esfera"
                        value={form.esferaFederacaoId}
                        options={esferasFederacao}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => patch({ esferaFederacaoId: e.value })}
                        placeholder="Selecione"
                    />
                </div>
                <div className="col-12 md:col-6 flex align-items-end">
                    <div className="flex align-items-center gap-2">
                        <Checkbox
                            inputId="n-complementar"
                            checked={form.complementar ?? false}
                            onChange={(e) => patch({ complementar: e.checked ?? false })}
                        />
                        <label htmlFor="n-complementar">Lei Complementar</label>
                    </div>
                </div>
                <div className="col-12">
                    <label htmlFor="n-ementa">Ementa *</label>
                    <InputTextarea
                        id="n-ementa"
                        value={form.ementa ?? ''}
                        onChange={(e) => patch({ ementa: e.target.value })}
                        rows={3}
                        placeholder="Resumo do objeto e alcance da norma"
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="n-publicacao">Data de publicação</label>
                    <Calendar
                        id="n-publicacao"
                        value={form.dataPublicacao ? new Date(form.dataPublicacao) : null}
                        onChange={(e) =>
                            patch({ dataPublicacao: e.value ? (e.value as Date).toISOString().split('T')[0] : undefined })
                        }
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="n-veiculo">Veículo de publicação</label>
                    <InputText
                        id="n-veiculo"
                        value={form.veiculoPublicacao ?? ''}
                        onChange={(e) => patch({ veiculoPublicacao: e.target.value })}
                        placeholder="Ex.: Diário Oficial"
                    />
                </div>
                <div className="col-12">
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
                        value={form.materiaOrigemId ?? null}
                        options={materiasAprovadas}
                        optionLabel="ementa"
                        optionValue="id"
                        onChange={(e) => patch({ materiaOrigemId: e.value })}
                        placeholder="Opcional — vincule a matéria aprovada"
                        disabled={materiasAprovadas.length === 0}
                        showClear
                    />
                </div>
            </div>
        </Dialog>
    );
}
