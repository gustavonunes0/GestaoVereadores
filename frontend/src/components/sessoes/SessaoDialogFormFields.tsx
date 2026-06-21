import { InputText } from 'primereact/inputtext';
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
    mensagem,
    onMensagemChange,
}: Props) {
    return (
        <div className="sigl-dialog-body sigl-grid-12">
            <div className="sigl-filtro-campo sigl-col-6">
                <label htmlFor={`sess-${idPrefix}-inicio`}>Data início *</label>
                <InputText
                    id={`sess-${idPrefix}-inicio`}
                    type="datetime-local"
                    value={dataInicio}
                    onChange={(e) => onDataInicioChange(e.target.value)}
                    required
                />
            </div>

            <div className="sigl-filtro-campo sigl-col-6">
                <label htmlFor={`sess-${idPrefix}-tipo`}>Tipo *</label>
                <Dropdown
                    id={`sess-${idPrefix}-tipo`}
                    value={tipoSessaoId}
                    options={mapDropdownOptions(tiposSessao, 'nome', 'id')}
                    onChange={(v) => onTipoSessaoIdChange(String(v))}
                />
            </div>

            <div className="sigl-filtro-campo sigl-col-12">
                <label htmlFor={`sess-${idPrefix}-situacao`}>Situação</label>
                <InputText
                    id={`sess-${idPrefix}-situacao`}
                    value={situacaoLabel}
                    disabled
                    readOnly
                />
            </div>

            <div className="sigl-col-12">
                <SessaoMensagemField
                    id={`sess-${idPrefix}-mensagem`}
                    value={mensagem}
                    onChange={onMensagemChange}
                />
            </div>
        </div>
    );
}
