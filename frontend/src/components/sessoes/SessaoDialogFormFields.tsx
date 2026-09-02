import { InputText } from 'primereact/inputtext';
import { LexDialogCol, LexDialogGrid } from '../ui/LexDialogGrid';
import { SessaoMensagemField } from '../forms/SessaoMensagemField';
import { Dropdown, mapDropdownOptions } from '../ui';

type TipoSessaoOption = { id: string; nome: string };

interface Props {
    idPrefix: 'create' | 'edit';
    dataInicio: string;
    onDataInicioChange: (value: string) => void;
    tipoSessaoId: string;
    onTipoSessaoIdChange: (value: string) => void;
    tiposSessao: TipoSessaoOption[];
    situacaoLabel: string;
    legislaturaLabel?: string;
    mensagem: string;
    onMensagemChange: (value: string) => void;
}

export function SessaoDialogFormFields({
    idPrefix,
    dataInicio,
    onDataInicioChange,
    tipoSessaoId,
    onTipoSessaoIdChange,
    tiposSessao,
    situacaoLabel,
    legislaturaLabel,
    mensagem,
    onMensagemChange,
}: Props) {
    return (
        <div className="sigl-dialog-body">
            <LexDialogGrid>
                {legislaturaLabel ? (
                    <LexDialogCol span={12}>
                        <div className="sigl-filtro-campo">
                            <label htmlFor={`sess-${idPrefix}-legislatura`}>
                                Legislatura em vigor
                            </label>
                            <InputText
                                id={`sess-${idPrefix}-legislatura`}
                                value={legislaturaLabel}
                                disabled
                                readOnly
                            />
                        </div>
                    </LexDialogCol>
                ) : null}

                <LexDialogCol span={6}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`sess-${idPrefix}-inicio`}>Data início *</label>
                        <InputText
                            id={`sess-${idPrefix}-inicio`}
                            type="datetime-local"
                            value={dataInicio}
                            onChange={(e) => onDataInicioChange(e.target.value)}
                            required
                        />
                    </div>
                </LexDialogCol>

                <LexDialogCol span={6}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`sess-${idPrefix}-tipo`}>Tipo *</label>
                        <Dropdown
                            id={`sess-${idPrefix}-tipo`}
                            value={tipoSessaoId}
                            options={mapDropdownOptions(tiposSessao, 'nome', 'id')}
                            onChange={(v) => onTipoSessaoIdChange(String(v))}
                        />
                    </div>
                </LexDialogCol>

                <LexDialogCol span={12}>
                    <div className="sigl-filtro-campo">
                        <label htmlFor={`sess-${idPrefix}-situacao`}>Situação</label>
                        <InputText
                            id={`sess-${idPrefix}-situacao`}
                            value={situacaoLabel}
                            disabled
                            readOnly
                        />
                    </div>
                </LexDialogCol>

                <LexDialogCol span={12}>
                    <SessaoMensagemField
                        id={`sess-${idPrefix}-mensagem`}
                        value={mensagem}
                        onChange={onMensagemChange}
                    />
                </LexDialogCol>
            </LexDialogGrid>
        </div>
    );
}
