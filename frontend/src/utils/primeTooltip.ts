import type { TooltipOptions } from 'primereact/tooltip';

const appendToBody =
    typeof document !== 'undefined' ? document.body : undefined;

/** Tooltip acima do alvo, renderizado no body (evita corte em tabelas/painéis). */
export const SIGL_TOOLTIP_TOP: TooltipOptions = {
    position: 'top',
    appendTo: appendToBody,
    showDelay: 300,
};

/** Tooltip abaixo do alvo, renderizado no body. */
export const SIGL_TOOLTIP_BOTTOM: TooltipOptions = {
    position: 'bottom',
    appendTo: appendToBody,
    showDelay: 300,
};
