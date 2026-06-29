type Props = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    label?: string;
};

/** Campo de observações/mensagem nos formulários de sessão plenária. */
export function SessaoMensagemField({
    id = 'mensagem',
    value,
    onChange,
    label = 'Mensagem / observações',
}: Props) {
    return (
        <div className="sigl-filtro-campo">
            <label htmlFor={id}>{label}</label>
            <textarea
                id={id}
                className="p-inputtext p-component w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                placeholder="Observações internas (opcional)"
            />
        </div>
    );
}
