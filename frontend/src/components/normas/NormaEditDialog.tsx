import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { normasApi, type CreateNormaDto, type Norma } from '../../api/normas.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import {
    DatePicker,
    Dropdown,
    FileUpload,
    mapDropdownOptions,
    withEmptyOption,
} from '../ui';
import {
    findTipoNormaIdByNome,
    formatNormaIdentificacao,
    isLeiComplementarTipo,
    LEI_COMPLEMENTAR_TIPO_NOME,
    LEI_TIPO_NOME,
} from '../../utils/normaDisplay';

interface Props {
    norma: Norma;
    onClose: () => void;
    onSaved: () => void;
}

function buildUpdatePayload(form: Partial<CreateNormaDto>): Partial<CreateNormaDto> {
    return {
        ...(form.tipoId ? { tipoId: form.tipoId } : {}),
        ...(form.numero?.trim() ? { numero: form.numero.trim() } : {}),
        ...(form.anoId ? { anoId: form.anoId } : {}),
        ...(form.esferaFederacaoId ? { esferaFederacaoId: form.esferaFederacaoId } : {}),
        ...(form.ementa?.trim() ? { ementa: form.ementa.trim() } : {}),
        complementar: !!form.complementar,
        ...(form.materiaOrigemId ? { materiaOrigemId: form.materiaOrigemId } : {}),
        ...(form.dataPublicacao ? { dataPublicacao: form.dataPublicacao } : {}),
        ...(form.veiculoPublicacao?.trim()
            ? { veiculoPublicacao: form.veiculoPublicacao.trim() }
            : {}),
        ...(form.identificadorId ? { identificadorId: form.identificadorId } : {}),
        ...(form.urlExternaPublicacao?.trim()
            ? { urlExternaPublicacao: form.urlExternaPublicacao.trim() }
            : {}),
        ...(form.paginaInicio != null ? { paginaInicio: form.paginaInicio } : {}),
        ...(form.paginaFim != null ? { paginaFim: form.paginaFim } : {}),
    };
}

export function NormaEditDialog({ norma, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposNorma, anos, esferasFederacao, identificadoresNorma } = useDominios();
    const [loading, setLoading] = useState(false);
    const [textoIntegral, setTextoIntegral] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);
    const [form, setForm] = useState<Partial<CreateNormaDto>>({
        tipoId: norma.tipo.id,
        numero: norma.numero,
        anoId: norma.ano?.id,
        esferaFederacaoId: norma.esferaFederacao?.id,
        ementa: norma.ementa,
        complementar: norma.complementar,
        materiaOrigemId: norma.materiaOrigem?.id,
        dataPublicacao: norma.dataPublicacao,
    });

    useEffect(() => {
        setForm({
            tipoId: norma.tipo.id,
            numero: norma.numero,
            anoId: norma.ano?.id,
            esferaFederacaoId: norma.esferaFederacao?.id,
            ementa: norma.ementa,
            complementar: norma.complementar,
            materiaOrigemId: norma.materiaOrigem?.id,
            dataPublicacao: norma.dataPublicacao,
        });
    }, [norma]);

    function handleTipoChange(tipoId: string) {
        const complementar = isLeiComplementarTipo(tiposNorma, tipoId);
        patch({ tipoId, complementar });
    }

    function handleComplementarChange(checked: boolean) {
        if (checked) {
            const leiComplementarId = findTipoNormaIdByNome(
                tiposNorma,
                LEI_COMPLEMENTAR_TIPO_NOME,
            );
            patch({
                complementar: true,
                ...(leiComplementarId ? { tipoId: leiComplementarId } : {}),
            });
            return;
        }

        const nextPatch: Partial<CreateNormaDto> = { complementar: false };
        if (isLeiComplementarTipo(tiposNorma, form.tipoId)) {
            const leiId = findTipoNormaIdByNome(tiposNorma, LEI_TIPO_NOME);
            if (leiId) nextPatch.tipoId = leiId;
        }
        patch(nextPatch);
    }

    function patch(values: Partial<CreateNormaDto>) {
        setForm((f) => ({ ...f, ...values }));
    }

    async function handleSubmit() {
        if (
            !form.tipoId ||
            !form.numero?.trim() ||
            !form.anoId ||
            !form.esferaFederacaoId ||
            !form.ementa?.trim()
        ) {
            showApiError(
                new Error(
                    'Preencha os campos obrigatórios: espécie, número, ano, esfera e ementa.',
                ),
            );
            return;
        }
        if (
            form.paginaInicio != null &&
            form.paginaFim != null &&
            form.paginaFim < form.paginaInicio
        ) {
            showApiError(
                new Error('A página fim deve ser maior ou igual à página início.'),
            );
            return;
        }
        setLoading(true);
        try {
            await normasApi.update(norma.id, buildUpdatePayload(form));
            if (textoIntegral) {
                await normasApi.uploadTextoIntegral(norma.id, textoIntegral);
            }
            if (audio) {
                await normasApi.uploadAudio(norma.id, audio);
            }
            showSuccess('Norma jurídica atualizada com sucesso.');
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
            header={`Editar — ${formatNormaIdentificacao(norma)}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 760px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-3">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-tipo">Espécie normativa *</label>
                            <Dropdown
                                id="ne-tipo"
                                value={form.tipoId ?? ''}
                                options={mapDropdownOptions(tiposNorma, 'nome', 'id')}
                                onChange={(v) => handleTipoChange(String(v))}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-numero">Número *</label>
                            <InputText
                                id="ne-numero"
                                value={form.numero ?? ''}
                                onChange={(e) => patch({ numero: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-ano">Ano *</label>
                            <Dropdown
                                id="ne-ano"
                                value={form.anoId ?? ''}
                                options={anos.map((a) => ({ label: String(a.valor), value: a.id }))}
                                onChange={(v) => patch({ anoId: String(v) })}
                            />
                        </div>
                    </div>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-esfera">Esfera *</label>
                            <Dropdown
                                id="ne-esfera"
                                value={form.esferaFederacaoId ?? ''}
                                options={mapDropdownOptions(esferasFederacao, 'nome', 'id')}
                                onChange={(v) => patch({ esferaFederacaoId: String(v) })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-identificador">Identificador</label>
                            <Dropdown
                                id="ne-identificador"
                                value={form.identificadorId ?? ''}
                                options={withEmptyOption(
                                    mapDropdownOptions(identificadoresNorma, 'nome', 'id'),
                                    'Nenhum',
                                )}
                                onChange={(v) =>
                                    patch({ identificadorId: v ? String(v) : undefined })
                                }
                            />
                        </div>
                    </div>
                    <div className="sigl-filtro-campo">
                        <div className="flex align-items-center gap-2">
                            <Checkbox
                                inputId="ne-complementar"
                                checked={
                                    form.complementar ??
                                    isLeiComplementarTipo(tiposNorma, form.tipoId)
                                }
                                onChange={(e) =>
                                    handleComplementarChange(e.checked ?? false)
                                }
                            />
                            <label htmlFor="ne-complementar">Complementar?</label>
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Conteúdo</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ne-ementa">Ementa *</label>
                        <InputTextarea
                            id="ne-ementa"
                            value={form.ementa ?? ''}
                            onChange={(e) => patch({ ementa: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Publicação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <DatePicker
                                id="ne-publicacao"
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
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-veiculo">Veículo de publicação</label>
                            <InputText
                                id="ne-veiculo"
                                value={form.veiculoPublicacao ?? ''}
                                onChange={(e) => patch({ veiculoPublicacao: e.target.value })}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-pg-ini">Página início</label>
                            <InputNumber
                                id="ne-pg-ini"
                                value={form.paginaInicio ?? null}
                                onValueChange={(e) =>
                                    patch({ paginaInicio: e.value ?? undefined })
                                }
                                useGrouping={false}
                                min={1}
                                max={2147483647}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ne-pg-fim">Página fim</label>
                            <InputNumber
                                id="ne-pg-fim"
                                value={form.paginaFim ?? null}
                                onValueChange={(e) => patch({ paginaFim: e.value ?? undefined })}
                                useGrouping={false}
                                min={1}
                                max={2147483647}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="ne-url">URL externa</label>
                            <InputText
                                id="ne-url"
                                value={form.urlExternaPublicacao ?? ''}
                                onChange={(e) =>
                                    patch({ urlExternaPublicacao: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Documentos</span>
                    {norma.textoIntegralUrl ? (
                        <p className="text-sm text-color-secondary mb-2">
                            Texto integral já anexado. Envie um novo arquivo para substituir.
                        </p>
                    ) : null}
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <FileUpload
                            id="ne-texto-integral"
                            label="Texto integral"
                            value={textoIntegral}
                            onChange={setTextoIntegral}
                        />
                        <FileUpload
                            id="ne-audio"
                            label="Áudio"
                            accept=".mp3,.wav,.m4a,.ogg"
                            value={audio}
                            onChange={setAudio}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
