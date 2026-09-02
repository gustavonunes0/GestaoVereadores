import type { ReactNode } from 'react';
import { Dialog, type DialogProps } from 'primereact/dialog';

export type LexDialogVariant = 'default' | 'form' | 'view' | 'danger' | 'confirm';

function variantClass(variant: LexDialogVariant): string {
    return `lex-dialog lex-dialog--dense lex-dialog--${variant}`;
}

export interface LexDialogProps extends Omit<DialogProps, 'className'> {
    variant?: LexDialogVariant;
    className?: string;
    children: ReactNode;
}

/**
 * Dialog institucional Lex — wrapper sobre PrimeReact Dialog.
 * Estilos em styles/lex-dialog.css (ref. .cursor/Dialog Design).
 */
export function LexDialog({
    variant = 'default',
    className,
    children,
    ...dialogProps
}: LexDialogProps) {
    const mergedClass = [variantClass(variant), className].filter(Boolean).join(' ');

    return (
        <Dialog className={mergedClass} {...dialogProps}>
            {children}
        </Dialog>
    );
}

export function lexDialogClass(variant: LexDialogVariant = 'default', extra?: string): string {
    return [variantClass(variant), extra].filter(Boolean).join(' ');
}

/** className para confirmDialog (PrimeReact) */
export const LEX_CONFIRM_DIALOG_CLASS = lexDialogClass('confirm');
export const LEX_DANGER_DIALOG_CLASS = lexDialogClass('danger');
