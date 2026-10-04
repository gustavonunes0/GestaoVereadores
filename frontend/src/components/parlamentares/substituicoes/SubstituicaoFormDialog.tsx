import { useEffect, useMemo, useState } from 'react';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { substituicoesApi } from '../../../api/legislative/substituicoes.api';
import { useAppToast } from '../../../hooks/useAppToast';
import {
    MOTIVO_SUBSTITUICAO_OPTIONS,
    type MotivoSubstituicao,
    type Substituicao,
    type SuplenteElegivel,
} from '../../../types/substituicoes';
import { Dropdown } from '../../ui';
import { dataCivilParaDate, dateParaDataCivil } from './data-civil';

interface Props {
    titular: { id: string; parliamentaryName: string };
    /** Quando informado, edita apenas datas e observação. */
    substituicao?: Substituicao;
    onClose: () => void;
    onSaved: () => void;
}

export function SubstituicaoFormDialog({ titular, substituicao, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const editando = !!substituicao;
    const [saving, setSaving] = useState(false);
    const [suplentes, setSuplentes] = useState<SuplenteElegivel[]>([]);
    const [carregandoSuplentes, setCarregandoSuplentes] = useState(!editando);

    const [suplenteId, setSuplenteId] = useState(substituicao?.suplente.id ?? '');
    const [motivo, setMotivo] = useState<MotivoSubstituicao | ''>(
        substituicao?.motivo.value ?? '',
    );
    const [dataInicio, setDataInicio] = useState<Date | null>(
        dataCivilParaDate(substituicao?.dataInicio) ?? (editando ? null : new Date()),
    );
    const [dataFim, setDataFim] = useState<Date | null>(dataCivilParaDate(substituicao?.dataFim));
    const [observacao, setObservacao] = useState(substituicao?.observacao ?? '');

    useEffect(() => {
        if (editando) return;
        substituicoesApi
            .suplentesElegiveis(titular.id)
            .then(setSuplentes)
            .catch((err) => {
                setSuplentes([]);
                showApiError(err);
            })
            .finally(() => setCarregandoSuplentes(false));
    }, [editando, titular.id, showApiError]);

    const suplenteOptions = useMemo(
        () =>
            suplentes.map((s) => ({
                label: [
                    s.parliamentaryName,
                    s.partyAcronym ? `(${s.partyAcronym})` : null,
                    s.mesmoPartido ? '· mesmo partido' : null,
                ]
                    .filter(Boolean)
                    .join(' '),
                value: s.id,
            })),
        [suplentes],
    );

    const periodoValido = !dataInicio || !dataFim || dataFim.getTime() >= dataInicio.getTime();
    const canSubmit =
        !!dataInicio && periodoValido && (editando || (!!suplenteId && !!motivo));

    async function handleSubmit() {
        if (!canSubmit) return;
        setSaving(true);
        try {
            if (editando && substituicao) {
                await substituicoesApi.update(substituicao.id, {
                    dataInicio: dateParaDataCivil(dataInicio)!,
                    dataFim: dateParaDataCivil(dataFim),
                    observacao: observacao.trim() || null,
                });
                showSuccess('Substituição atualizada.');
            } else {
                await substituicoesApi.create({
                    titularId: titular.id,
                    suplenteId,
                    motivo: motivo as MotivoSubstituicao,
                    dataInicio: dateParaDataCivil(dataInicio)!,
                    dataFim: dateParaDataCivil(dataFim),
                    ...(observacao.trim() ? { observacao: observacao.trim() } : {}),
                });
                showSuccess('Suplente vinculado ao titular.');
            }
            onSaved();
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
                label={editando ? 'Salvar datas' : 'Vincular suplente'}
                icon="pi pi-check"
                loading={saving}
                disabled={!canSubmit}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={editando ? 'Editar substituição' : 'Vincular suplente'}
            visible
            onHide={() => !saving && onClose()}
            style={{ width: 'min(95vw, 560px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body sigl-dialog-body--dense">
                <div className="sigl-filtro-campo">
                    <span className="sigl-field-label">Titular</span>
                    <p className="parlamentar-ver-value m-0">{titular.parliamentaryName}</p>
                </div>

                <div className="sigl-filtro-campo">
                    {editando ? (
                        <>
                            <span className="sigl-field-label">Suplente</span>
                            <p className="parlamentar-ver-value m-0">
                                {substituicao?.suplente.parliamentaryName} ·{' '}
                                {substituicao?.motivo.label}
                            </p>
                        </>
                    ) : (
                        <>
                            <label htmlFor="sub-suplente">Suplente *</label>
                            <Dropdown
                                id="sub-suplente"
                                options={suplenteOptions}
                                value={suplenteId || null}
                                onChange={(v) => setSuplenteId(String(v))}
                                placeholder={
                                    carregandoSuplentes
                                        ? 'Carregando suplentes…'
                                        : suplenteOptions.length === 0
                                          ? 'Nenhum suplente ativo na legislatura'
                                          : 'Selecione o suplente'
                                }
                                disabled={carregandoSuplentes || suplenteOptions.length === 0}
                                className="w-full"
                                filter
                            />
                            <small className="text-color-secondary">
                                Suplentes do mesmo partido aparecem primeiro.
                            </small>
                        </>
                    )}
                </div>

                {!editando && (
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sub-motivo">Motivo *</label>
                        <Dropdown
                            id="sub-motivo"
                            options={MOTIVO_SUBSTITUICAO_OPTIONS}
                            value={motivo || null}
                            onChange={(v) => setMotivo(v as MotivoSubstituicao)}
                            placeholder="Selecione o motivo"
                            className="w-full"
                        />
                    </div>
                )}

                <div className="sigl-dialog-grid sigl-dialog-grid-2">
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sub-inicio">Data de início *</label>
                        <Calendar
                            id="sub-inicio"
                            value={dataInicio}
                            onChange={(e) => setDataInicio((e.value as Date | null) ?? null)}
                            dateFormat="dd/mm/yy"
                            locale="pt"
                            showIcon
                            placeholder="dd/mm/aaaa"
                            className="w-full"
                        />
                    </div>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="sub-fim">Data de fim</label>
                        <Calendar
                            id="sub-fim"
                            value={dataFim}
                            onChange={(e) => setDataFim((e.value as Date | null) ?? null)}
                            dateFormat="dd/mm/yy"
                            locale="pt"
                            showIcon
                            showButtonBar
                            placeholder="Sem prazo"
                            minDate={dataInicio ?? undefined}
                            className={`w-full${periodoValido ? '' : ' p-invalid'}`}
                        />
                        {!periodoValido ? (
                            <small className="p-error">A data de fim deve ser igual ou posterior ao início.</small>
                        ) : (
                            <small className="text-color-secondary">
                                Último dia de exercício do suplente. Vazio = sem prazo.
                            </small>
                        )}
                    </div>
                </div>

                <div className="sigl-filtro-campo">
                    <label htmlFor="sub-observacao">Observação</label>
                    <InputTextarea
                        id="sub-observacao"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={3}
                        autoResize
                        maxLength={2000}
                        className="w-full"
                    />
                </div>

                <small className="text-color-secondary">
                    Durante o período, presença e voto passam ao suplente. Em sessão já aberta, a
                    mudança vale a partir da próxima sessão.
                </small>
            </div>
        </Dialog>
    );
}
