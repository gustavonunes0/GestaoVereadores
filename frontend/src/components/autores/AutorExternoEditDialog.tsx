import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { autoresExternosApi, type AutorExterno, type CreateAutorExternoDto } from '../../api/autores-externos.api';
import { useAppToast } from '../../hooks/useAppToast';
import { useDominios } from '../../hooks/useDominios';
import { Dropdown, mapDropdownOptions } from '../../components/ui';

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
    autor: AutorExterno;
    onClose: () => void;
    onSaved: () => void;
}

export function AutorExternoEditDialog({ autor, onClose, onSaved }: Props) {
    const { showSuccess, showApiError } = useAppToast();
    const { tiposAutorExterno } = useDominios();
    const [loading, setLoading] = useState(false);

    const [tipoAutorId, setTipoAutorId] = useState(autor.tipoAutor.id);
    const [selectedCodigo, setSelectedCodigo] = useState<string | undefined>(
        String(autor.tipoAutor.idNegocio ?? '')
    );
    const [nome, setNome] = useState(autor.nome);
    const [cargo, setCargo] = useState(autor.cargo ?? '');
    const [instituicao, setInstituicao] = useState(autor.instituicao ?? '');
    const [registro, setRegistro] = useState(autor.registro ?? '');
    const [partido, setPartido] = useState(autor.partido ?? '');
    const [uf, setUf] = useState(autor.uf ?? '');
    const [cpf, setCpf] = useState(autor.cpf ?? '');
    const [email, setEmail] = useState(autor.email ?? '');
    const [telefone, setTelefone] = useState(autor.telefone ?? '');

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
        const tipo = tiposAutorExterno.find((t) => t.id === tipoAutorId);
        if (tipo?.codigo) setSelectedCodigo(tipo.codigo);
    }, [tiposAutorExterno, tipoAutorId]);

    function handleTipoChange(id: string) {
        const tipo = tiposAutorExterno.find((t) => t.id === id);
        setTipoAutorId(id);
        setSelectedCodigo(tipo?.codigo);
    }

    async function handleSubmit() {
        if (!tipoAutorId || !nome.trim()) return;
        setLoading(true);
        const dto: Partial<CreateAutorExternoDto> = {
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
            await autoresExternosApi.update(autor.id, dto);
            showSuccess('Autor externo atualizado com sucesso.');
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
                label="Salvar"
                icon="pi pi-check"
                loading={loading}
                onClick={() => void handleSubmit()}
            />
        </div>
    );

    return (
        <Dialog
            header={`Editar — ${autor.nome}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 680px)' }}
            footer={footer}
            modal
        >
            <div className="sigl-dialog-body">
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Classificação</span>
                    <div className="sigl-filtro-campo">
                        <label htmlFor="ae-edit-tipo">Tipo de autor *</label>
                        <Dropdown
                            id="ae-edit-tipo"
                            value={tipoAutorId}
                            options={mapDropdownOptions(tiposAutorExterno, 'nome', 'id')}
                            onChange={(v) => handleTipoChange(String(v))}
                            placeholder="Selecione o tipo"
                        />
                    </div>
                </div>
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Identificação</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className={`sigl-filtro-campo${showCpf ? '' : ' sigl-col-full'}`}>
                            <label htmlFor="ae-edit-nome">{nomeLabelPrefix} *</label>
                            <InputText
                                id="ae-edit-nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>
                        {showCpf && (
                            <div className="sigl-filtro-campo">
                                <label htmlFor="ae-edit-cpf">CPF</label>
                                <InputMask
                                    id="ae-edit-cpf"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value ?? '')}
                                    mask="999.999.999-99"
                                />
                            </div>
                        )}
                    </div>
                </div>
                {(showCargo || showInstituicao || showRegistro || showPartido || showUf) && (
                    <div className="sigl-dialog-secao">
                        <span className="sigl-dialog-secao-titulo">Dados profissionais</span>
                        <div className="sigl-dialog-grid sigl-dialog-grid-2">
                            {showCargo && (
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="ae-edit-cargo">Cargo / função</label>
                                    <InputText
                                        id="ae-edit-cargo"
                                        value={cargo}
                                        onChange={(e) => setCargo(e.target.value)}
                                    />
                                </div>
                            )}
                            {showInstituicao && (
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="ae-edit-inst">Instituição</label>
                                    <InputText
                                        id="ae-edit-inst"
                                        value={instituicao}
                                        onChange={(e) => setInstituicao(e.target.value)}
                                    />
                                </div>
                            )}
                            {showRegistro && (
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="ae-edit-reg">Nº OAB / CRM</label>
                                    <InputText
                                        id="ae-edit-reg"
                                        value={registro}
                                        onChange={(e) => setRegistro(e.target.value)}
                                    />
                                </div>
                            )}
                            {showPartido && (
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="ae-edit-partido">Partido</label>
                                    <InputText
                                        id="ae-edit-partido"
                                        value={partido}
                                        onChange={(e) => setPartido(e.target.value)}
                                    />
                                </div>
                            )}
                            {showUf && (
                                <div className="sigl-filtro-campo">
                                    <label htmlFor="ae-edit-uf">UF</label>
                                    <Dropdown
                                        id="ae-edit-uf"
                                        value={uf}
                                        options={UF_OPTIONS}
                                        onChange={(v) => setUf(String(v))}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="sigl-dialog-secao">
                    <span className="sigl-dialog-secao-titulo">Contato</span>
                    <div className="sigl-dialog-grid sigl-dialog-grid-2">
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ae-edit-email">E-mail</label>
                            <InputText
                                id="ae-edit-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="sigl-filtro-campo">
                            <label htmlFor="ae-edit-tel">Telefone</label>
                            <InputMask
                                id="ae-edit-tel"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value ?? '')}
                                mask="(99) 9 9999-9999"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
