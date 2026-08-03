import type { CSSProperties, ReactNode } from 'react';

export type PersonAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type PersonAvatarShape = 'circle' | 'rounded';

type Props = {
    photoUrl?: string | null;
    /** Usado para inicial no fallback e alt se não houver alt. */
    name?: string | null;
    size?: PersonAvatarSize;
    shape?: PersonAvatarShape;
    className?: string;
    alt?: string;
    /** Fallback quando sem foto (ícone); se omitido, usa a inicial do nome. */
    fallback?: ReactNode;
    style?: CSSProperties;
    'aria-hidden'?: boolean | 'true' | 'false';
};

function initialFromName(name?: string | null): string {
    const trimmed = name?.trim();
    if (!trimmed) return '?';
    return trimmed.charAt(0).toUpperCase();
}

/**
 * Avatar de pessoa unificado: círculo (ou cantos arredondados) preenchido,
 * sem faixas brancas — `object-fit: cover` com foco no rosto.
 */
export function PersonAvatar({
    photoUrl,
    name,
    size = 'md',
    shape = 'circle',
    className = '',
    alt,
    fallback,
    style,
    'aria-hidden': ariaHidden,
}: Props) {
    const url = photoUrl?.trim() || '';
    const displayName = name?.trim() || '';
    const classes = [
        'sigl-avatar',
        `sigl-avatar--${size}`,
        shape === 'rounded' ? 'sigl-avatar--rounded' : 'sigl-avatar--circle',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes} style={style} aria-hidden={ariaHidden}>
            {url ? (
                <img
                    src={url}
                    alt={alt ?? (displayName || '')}
                    className="sigl-avatar__img"
                    loading="lazy"
                    decoding="async"
                />
            ) : (
                <span className="sigl-avatar__fallback">
                    {fallback ?? initialFromName(displayName)}
                </span>
            )}
        </span>
    );
}
