interface CadeiraVaziaProps {
    size?: 'sm' | 'md';
}

/** Cadeira decorativa sem parlamentar — preenche o layout fixo do plenário. */
export function CadeiraVazia({ size = 'sm' }: CadeiraVaziaProps) {
    return (
        <div
            className={[
                'presenca-seat',
                'presenca-seat--vazia',
                size === 'md' ? 'presenca-seat--mesa' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-hidden
        />
    );
}
