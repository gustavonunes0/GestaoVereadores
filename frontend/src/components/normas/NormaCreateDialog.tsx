import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { normasApi, type CreateNormaDto } from '../../api/normas.api';
import { materiasApi } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import {
    DatePicker,
    Dropdown,
    FileUpload,
    mapDropdownOptions,
    withEmptyOption,
} from '../../components/ui';
import {
    findTipoNormaIdByNome,
    isLeiComplementarTipo,
    LEI_COMPLEMENTAR_TIPO_NOME,
    LEI_TIPO_NOME,
    resolveDefaultTipoNormaId,
} from '../../utils/normaDisplay';

interface Props {
    onClose: () => void;
    onSaved: () => void;
}

function buildCreatePayload(form: Partial<CreateNormaDto>): CreateNormaDto {
    return {
        tipoId: form.tipoId!,
        numero: form.numero!.trim(),
        anoId: form.anoId!,
        esferaFederacaoId: form.esferaFederacaoId!,
        ementa: form.ementa!.trim(),
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

export function NormaCreateDialog({ onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposNorma, anos, esferasFederacao, identificadoresNorma } = useDominios();
    const [loading, setLoading] = useState(false);
    const [materiasAprovadas, setMateriasAprovadas] = useState<
        { id: string; identificacao?: string; ementa: string }[]
    >([]);
    const [textoIntegral, setTextoIntegral] = useState<File | null>(null);
    const [audio, setAudio] = useState<File | null>(null);

    const [form, setForm] = useState<Partial<CreateNormaDto>>({
        complementar: false,
    });

    useEffect(() => {
        materiasApi
            .list({ status: 'APROVADA', limit: 200 })
            .then((r) => setMateriasAprovadas(r.data as unknown as typeof materiasAprovadas))
            .catch(() => setMateriasAprovadas([]));
    }, []);

    useEffect(() => {
        if (tiposNorma.length > 0 && !form.tipoId) {
            setForm((f) => ({ ...f, tipoId: resolveDefaultTipoNormaId(tiposNorma) }));
        }
        if (anos[0] && !form.anoId) {
            setForm((f) => ({ ...f, anoId: anos[0].id }));
        }
        if (esferasFederacao[0] && !form.esferaFederacaoId) {
            setForm((f) => ({ ...f, esferaFederacaoId: esferasFederacao[0].id }));
        }
    }, [tiposNorma, anos, esferasFederacao, form.tipoId, form.anoId, form.esferaFederacaoId]);

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
            const created = await normasApi.create(buildCreatePayload(form));

            if (textoIntegral) {
                await normasApi.uploadTextoIntegral(created.id, textoIntegral);
            }
            if (audio) {
                await normasApi.uploadAudio(created.id, audio);
            }

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
            style={{ width: 'min(90vw, 760px)' }}
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
                                onChange={(v) => handleTipoChange(String(v))}
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
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-identificador">Identificador</label>
                            <Dropdown
                                id="n-identificador"
                                value={form.identificadorId ?? ''}
                                options={withEmptyOption(
                                    mapDropdownOptions(identificadoresNorma, 'nome', 'id'),
                                    'Nenhum',
                                )}
                                onChange={(v) =>
                                    patch({ identificadorId: v ? String(v) : undefined })
                                }
                                placeholder="Selecione"
                            />
                        </div>
                    </div>
                    <div className="sigl-filtro-campo">
                        <div className="flex align-items-center gap-2">
                            <Checkbox
                                inputId="n-complementar"
                                checked={
                                    form.complementar ??
                                    isLeiComplementarTipo(tiposNorma, form.tipoId)
                                }
                                onChange={(e) =>
                                    handleComplementarChange(e.checked ?? false)
                                }
                            />
                            <label htmlFor="n-complementar">Complementar?</label>
                        </div>
                        <small className="text-color-secondary">
                            Marca como lei complementar e seleciona a espécie &quot;Lei
                            Complementar&quot;.
                        </small>
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
                                    patch({
                                        dataPublicacao: d
                                            ? d.toISOString().split('T')[0]
                                            : undefined,
                                    })
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
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-pg-ini">Página início</label>
                            <InputNumber
                                id="n-pg-ini"
                                value={form.paginaInicio ?? null}
                                onValueChange={(e) =>
                                    patch({ paginaInicio: e.value ?? undefined })
                                }
                                placeholder="Ex.: 12"
                                useGrouping={false}
                                min={1}
                                max={2147483647}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="n-pg-fim">Página fim</label>
                            <InputNumber
                                id="n-pg-fim"
                                value={form.paginaFim ?? null}
                                onValueChange={(e) => patch({ paginaFim: e.value ?? undefined })}
                                placeholder="Ex.: 15"
                                useGrouping={false}
                                min={1}
                                max={2147483647}
                            />
                        </div>
                        <div className="sigl-filtro-campo sigl-col-full">
                            <label htmlFor="n-url">URL externa</label>
                            <InputText
                                id="n-url"
                                value={form.urlExternaPublicacao ?? ''}
                                onChange={(e) =>
                                    patch({ urlExternaPublicacao: e.target.value })
                                }
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Documentos</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <FileUpload
                            id="n-texto-integral"
                            label="Texto integral"
                            value={textoIntegral}
                            onChange={setTextoIntegral}
                        />
                        <FileUpload
                            id="n-audio"
                            label="Áudio"
                            accept=".mp3,.wav,.m4a,.ogg"
                            value={audio}
                            onChange={setAudio}
                        />
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
                            onChange={(v) =>
                                patch({ materiaOrigemId: v ? String(v) : undefined })
                            }
                            placeholder="Opcional — vincule a matéria aprovada"
                            disabled={materiasAprovadas.length === 0}
                        />
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
