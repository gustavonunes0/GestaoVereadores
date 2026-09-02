import { Button } from 'primereact/button';

export interface LexDialogFooterProps {
    onCancel?: () => void;
    cancelLabel?: string;
    onConfirm?: () => void;
    confirmLabel?: string;
    confirmIcon?: string;
    loading?: boolean;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
    confirmSeverity?: 'primary' | 'danger';
    hideCancel?: boolean;
}

/**
 * Rodapé Lex — botões conforme code.html:
 * Cancelar: ghost secondary · Salvar: primary-container bold + ícone
 */
export function LexDialogFooter({
    onCancel,
    cancelLabel = 'Cancelar',
    onConfirm,
    confirmLabel = 'Salvar',
    confirmIcon = 'pi-check',
    loading = false,
    confirmDisabled = false,
    cancelDisabled = false,
    confirmSeverity = 'primary',
    hideCancel = false,
}: LexDialogFooterProps) {
    return (
        <div className="lex-dialog-actions">
            {!hideCancel && onCancel ? (
                <button
                    type="button"
                    className="lex-btn lex-btn--ghost"
                    onClick={onCancel}
                    disabled={loading || cancelDisabled}
                >
                    {cancelLabel}
                </button>
            ) : null}
            {onConfirm ? (
                <button
                    type="button"
                    className={`lex-btn lex-btn--${confirmSeverity === 'danger' ? 'danger' : 'primary'}`}
                    onClick={onConfirm}
                    disabled={loading || confirmDisabled}
                >
                    {loading ? (
                        <i className="pi pi-spin pi-spinner" aria-hidden />
                    ) : confirmIcon ? (
                        <i className={`pi ${confirmIcon}`} aria-hidden />
                    ) : null}
                    {confirmLabel}
                </button>
            ) : null}
        </div>
    );
}

/** Footer com PrimeReact Button (compat legado). */
export function LexDialogFooterPrime({
    onCancel,
    cancelLabel = 'Cancelar',
    onConfirm,
    confirmLabel = 'Salvar',
    confirmIcon = 'pi pi-check',
    loading = false,
    confirmSeverity = 'primary' as 'primary' | 'danger',
    hideCancel = false,
}: LexDialogFooterProps) {
    return (
        <div className="lex-dialog-actions">
            {!hideCancel && onCancel ? (
                <Button
                    type="button"
                    label={cancelLabel}
                    className="lex-btn-prime lex-btn-prime--ghost"
                    text
                    onClick={onCancel}
                    disabled={loading}
                />
            ) : null}
            {onConfirm ? (
                <Button
                    type="button"
                    label={confirmLabel}
                    icon={confirmIcon}
                    className={`lex-btn-prime lex-btn-prime--${confirmSeverity}`}
                    loading={loading}
                    onClick={onConfirm}
                />
            ) : null}
        </div>
    );
}
