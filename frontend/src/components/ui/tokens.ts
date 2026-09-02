/** Tokens JS espelham variáveis CSS de prime-theme-tokens.css */
export const tokens = {
    input: {
        bg: 'var(--input-bg)',
        border: 'var(--input-border)',
        borderFocus: 'var(--input-border-focus)',
        borderHover: 'var(--text-placeholder)',
        radius: 'var(--layout-radius-sm)',
        text: 'var(--text-body)',
        placeholder: 'var(--text-placeholder)',
        shadow: '0 0 0 3px var(--focus-ring-color)',
    },
    accent: 'var(--accent)',
    heading: 'var(--text-heading)',
    muted: 'var(--text-muted)',
    danger: 'var(--danger)',
} as const;
