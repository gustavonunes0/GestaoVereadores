/** Cadeira decorativa sem parlamentar — preenche o layout fixo do plenário. */
export function CadeiraVazia({ size = 'sm' }: { size?: 'sm' | 'md' }) {
    return (
        <div
            className={[
                'presenca-seat',
                'presenca-seat--vazia',
                'presenca-seat--institucional',
                size === 'md' ? 'presenca-seat--mesa' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-hidden
            title="Cadeira"
        />
    );
}
