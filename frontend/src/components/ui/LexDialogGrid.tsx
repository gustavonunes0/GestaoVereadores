import type { ReactNode } from 'react';

export type LexDialogColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';

function colClass(span: LexDialogColSpan): string {
    return span === 'full' ? 'lex-col-full' : `lex-col-${span}`;
}

export interface LexDialogGridProps {
    children: ReactNode;
    className?: string;
}

/** Grid de 12 colunas para conteúdo de dialogs (padrão Lex). */
export function LexDialogGrid({ children, className }: LexDialogGridProps) {
    return (
        <div className={['lex-dialog-grid', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

export interface LexDialogColProps {
    children: ReactNode;
    span?: LexDialogColSpan;
    className?: string;
}

/** Coluna do grid de dialog — `span` de 1 a 12 ou `full` (linha inteira). */
export function LexDialogCol({ children, span = 12, className }: LexDialogColProps) {
    return (
        <div className={[colClass(span), className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

/** Alias legado — mesmas classes do grid Lex. */
export const LEX_DIALOG_GRID_CLASS = 'lex-dialog-grid';
