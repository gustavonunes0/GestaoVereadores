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
        <label htmlFor={id}>
            {label}
            <textarea
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={2}
                placeholder="Observações internas (opcional)"
            />
        </label>
    );
}
