import type { ReactNode } from 'react';

interface LexDialogSectionProps {
    title: string;
    icon?: string;
    children: ReactNode;
    className?: string;
}

/** Seção interna do dialog (ref. code.html — card branco com título title-lg). */
export function LexDialogSection({
    title,
    icon,
    children,
    className,
}: LexDialogSectionProps) {
    return (
        <section
            className={['lex-dialog-section', className].filter(Boolean).join(' ')}
        >
            <h2 className="lex-dialog-section-title">
                {icon ? <i className={`pi ${icon}`} aria-hidden /> : null}
                {title}
            </h2>
            {children}
        </section>
    );
}

/** Campo de formulário com label + hint (ref. label-md + body-md). */
export function LexDialogField({
    label,
    htmlFor,
    hint,
    hintError,
    children,
    className,
    col = 12,
}: {
    label: string;
    htmlFor?: string;
    hint?: string;
    hintError?: boolean;
    children: ReactNode;
    className?: string;
    col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
}) {
    const colClass = col === 'full' ? 'lex-col-full' : `lex-col-${col}`;
    return (
        <div className={['lex-dialog-field', colClass, className].filter(Boolean).join(' ')}>
            <label htmlFor={htmlFor}>{label}</label>
            {children}
            {hint ? (
                <p
                    className={`lex-dialog-hint${hintError ? ' lex-dialog-hint--error' : ''}`}
                >
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

/** Valor somente leitura (ref. bg surface-container). */
export function LexDialogReadonly({ children }: { children: ReactNode }) {
    return <div className="lex-dialog-readonly">{children}</div>;
}

/** Alerta informativo dentro do dialog. */
export function LexDialogAlert({ children, icon = 'pi-info-circle' }: { children: ReactNode; icon?: string }) {
    return (
        <div className="lex-dialog-alert" role="note">
            <i className={`pi ${icon}`} aria-hidden />
            <p>{children}</p>
        </div>
    );
}
