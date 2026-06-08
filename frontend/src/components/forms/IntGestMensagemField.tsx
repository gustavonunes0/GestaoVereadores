type Props = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    label?: string;
};

/** Campo observações/mensagem presente nos formulários SIGL IntGest. */
export function IntGestMensagemField({
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
