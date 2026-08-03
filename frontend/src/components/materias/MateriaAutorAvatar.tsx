import type { MateriaAutorResumo } from '../../utils/materiaDisplay';
import { PersonAvatar, type PersonAvatarSize } from '../common/PersonAvatar';

interface Props {
    autor: MateriaAutorResumo;
    size?: 'large' | 'normal' | 'xlarge' | PersonAvatarSize;
}

const SIZE_MAP: Record<string, PersonAvatarSize> = {
    normal: 'md',
    large: 'lg',
    xlarge: 'xl',
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

export function MateriaAutorAvatar({ autor, size = 'large' }: Props) {
    const mapped = SIZE_MAP[size] ?? 'lg';
    const fallback =
        autor.tipo === 'tenant_partner' ? (
            <i className="pi pi-building" aria-hidden />
        ) : undefined;

    return (
        <PersonAvatar
            photoUrl={autor.photoUrl}
            name={autor.nome}
            size={mapped}
            fallback={fallback}
            alt={autor.nome}
            className="materia-detail__avatar"
        />
    );
}
