import { resolveMateriaTextoOriginalUrl } from '../../../../utils/materiaDisplay';

function resolvePhoto(url?: string | null): string | null {
    const trimmed = url?.trim();
    if (!trimmed) return null;
    return resolveMateriaTextoOriginalUrl(trimmed);
}

export function CouncilorAvatar({
    name,
    photoUrl,
    highlighted,
}: {
    name: string;
    photoUrl?: string | null;
    highlighted?: boolean;
}) {
    const src = resolvePhoto(photoUrl);
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');

    return (
        <span
            className={`vp-avatar${highlighted ? ' vp-avatar--president' : ''}`}
            aria-hidden
        >
            {src ? (
                <img src={src} alt="" className="vp-avatar__img" />
            ) : (
                <span className="vp-avatar__fallback">{initials || '—'}</span>
            )}
        </span>
    );
}
