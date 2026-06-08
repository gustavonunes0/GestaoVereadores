type Props = {
    icon?: string;
    title: string;
    hint?: string;
    className?: string;
};

/** Estado vazio padronizado para tabelas e listagens. */
export function EmptyState({
    icon = 'pi pi-inbox',
    title,
    hint,
    className = '',
}: Props) {
    return (
        <div className={`ui-empty-state ${className}`.trim()} role="status">
            <i className={`ui-empty-state__icon ${icon}`} aria-hidden />
            <p className="ui-empty-state__title">{title}</p>
            {hint && <p className="ui-empty-state__hint">{hint}</p>}
        </div>
    );
}
