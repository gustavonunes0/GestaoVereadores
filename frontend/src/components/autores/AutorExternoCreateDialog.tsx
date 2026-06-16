import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { autoresExternosApi, type CreateAutorExternoDto } from '../../api/autores-externos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';

const CATEGORIA_A_IDS = [2, 3, 4, 5, 6, 7, 10, 17, 20, 25, 26];
const CATEGORIA_C_IDS = [13, 15];
const CATEGORIA_D_IDS = [23, 24];
const ID_DEPUTADO_FEDERAL = 23;

const UF_OPTIONS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
].map((uf) => ({ label: uf, value: uf }));

function getCategoria(codigo?: string): 'A' | 'B' | 'C' | 'D' {
    const id = parseInt(codigo ?? '0', 10);
    if (CATEGORIA_A_IDS.includes(id)) return 'A';
    if (CATEGORIA_C_IDS.includes(id)) return 'C';
    if (CATEGORIA_D_IDS.includes(id)) return 'D';
    return 'B';
}

interface Props {
    onClose: () => void;
    onSaved: () => void;
    initialValues?: Partial<CreateAutorExternoDto>;
}

export function AutorExternoCreateDialog({ onClose, onSaved, initialValues }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposAutorExterno } = useDominios();
    const [loading, setLoading] = useState(false);

    const [tipoAutorId, setTipoAutorId] = useState(initialValues?.tipoAutorId ?? '');
    const [selectedCodigo, setSelectedCodigo] = useState<string | undefined>(undefined);
    const [nome, setNome] = useState(initialValues?.nome ?? '');
    const [cargo, setCargo] = useState(initialValues?.cargo ?? '');
    const [instituicao, setInstituicao] = useState(initialValues?.instituicao ?? '');
    const [registro, setRegistro] = useState(initialValues?.registro ?? '');
    const [partido, setPartido] = useState(initialValues?.partido ?? '');
    const [uf, setUf] = useState(initialValues?.uf ?? '');
    const [cpf, setCpf] = useState(initialValues?.cpf ?? '');
    const [email, setEmail] = useState(initialValues?.email ?? '');
    const [telefone, setTelefone] = useState(initialValues?.telefone ?? '');

    const categoria = getCategoria(selectedCodigo);
    const idNegocio = parseInt(selectedCodigo ?? '0', 10);

    const showCargo = categoria !== 'A';
    const showInstituicao = categoria === 'B' || categoria === 'C';
    const showRegistro = categoria === 'C';
    const showPartido = categoria === 'D';
    const showUf = idNegocio === ID_DEPUTADO_FEDERAL;
    const showCpf = categoria === 'B' || categoria === 'C';
    const nomeLabelPrefix = categoria === 'A' ? 'Nome da Entidade' : 'Nome da Pessoa';

    useEffect(() => {
        if (tiposAutorExterno[0] && !tipoAutorId) {
            const first = tiposAutorExterno[0];
            setTipoAutorId(first.id);
            setSelectedCodigo(first.codigo);
        }
    }, [tiposAutorExterno, tipoAutorId]);

    function handleTipoChange(id: string) {
        const tipo = tiposAutorExterno.find((t) => t.id === id);
        setTipoAutorId(id);
        setSelectedCodigo(tipo?.codigo);
    }

    async function handleSubmit() {
        if (!tipoAutorId || !nome.trim()) return;
        setLoading(true);
        const dto: CreateAutorExternoDto = {
            tipoAutorId,
            nome: nome.trim(),
            cargo: showCargo ? cargo.trim() || undefined : undefined,
            instituicao: showInstituicao ? instituicao.trim() || undefined : undefined,
            registro: showRegistro ? registro.trim() || undefined : undefined,
            partido: showPartido ? partido.trim() || undefined : undefined,
            uf: showUf ? uf || undefined : undefined,
            cpf: showCpf ? cpf.replace(/\D/g, '') || undefined : undefined,
            email: email.trim() || undefined,
            telefone: telefone.replace(/\D/g, '') || undefined,
        };
        try {
            await autoresExternosApi.create(dto);
            showSuccess('Autor externo cadastrado com sucesso.');
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
                label="Cadastrar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header="Cadastrar Autor Externo"
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 680px)' }}
            footer={footer}
            modal
        >
            <div className="grid p-fluid">
                <div className="col-12">
                    <label htmlFor="ae-tipo">Tipo de autor *</label>
                    <Dropdown
                        id="ae-tipo"
                        value={tipoAutorId}
                        options={tiposAutorExterno}
                        optionLabel="nome"
                        optionValue="id"
                        onChange={(e) => handleTipoChange(e.value)}
                        placeholder="Selecione o tipo"
                        filter
                    />
                </div>
                <div className="col-12 md:col-8">
                    <label htmlFor="ae-nome">{nomeLabelPrefix} *</label>
                    <InputText
                        id="ae-nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder={nomeLabelPrefix}
                    />
                </div>
                {showCpf && (
                    <div className="col-12 md:col-4">
                        <label htmlFor="ae-cpf">CPF</label>
                        <InputMask
                            id="ae-cpf"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value ?? '')}
                            mask="999.999.999-99"
                            placeholder="000.000.000-00"
                        />
                    </div>
                )}
                {showCargo && (
                    <div className="col-12 md:col-6">
                        <label htmlFor="ae-cargo">Cargo / função</label>
                        <InputText
                            id="ae-cargo"
                            value={cargo}
                            onChange={(e) => setCargo(e.target.value)}
                        />
                    </div>
                )}
                {showInstituicao && (
                    <div className="col-12 md:col-6">
                        <label htmlFor="ae-inst">Instituição</label>
                        <InputText
                            id="ae-inst"
                            value={instituicao}
                            onChange={(e) => setInstituicao(e.target.value)}
                        />
                    </div>
                )}
                {showRegistro && (
                    <div className="col-12 md:col-6">
                        <label htmlFor="ae-reg">Nº OAB / CRM</label>
                        <InputText
                            id="ae-reg"
                            value={registro}
                            onChange={(e) => setRegistro(e.target.value)}
                        />
                    </div>
                )}
                {showPartido && (
                    <div className="col-12 md:col-6">
                        <label htmlFor="ae-partido">Partido</label>
                        <InputText
                            id="ae-partido"
                            value={partido}
                            onChange={(e) => setPartido(e.target.value)}
                        />
                    </div>
                )}
                {showUf && (
                    <div className="col-12 md:col-3">
                        <label htmlFor="ae-uf">UF</label>
                        <Dropdown
                            id="ae-uf"
                            value={uf}
                            options={UF_OPTIONS}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => setUf(e.value)}
                            placeholder="UF"
                        />
                    </div>
                )}
                <div className="col-12 md:col-6">
                    <label htmlFor="ae-email">E-mail</label>
                    <InputText
                        id="ae-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="col-12 md:col-6">
                    <label htmlFor="ae-tel">Telefone</label>
                    <InputMask
                        id="ae-tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value ?? '')}
                        mask="(99) 9 9999-9999"
                        placeholder="(00) 0 0000-0000"
                    />
                </div>
            </div>
        </Dialog>
    );
}
