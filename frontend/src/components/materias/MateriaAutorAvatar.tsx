import { Avatar } from 'primereact/avatar';
import type { MateriaAutorResumo } from '../../utils/materiaDisplay';

interface Props {
    autor: MateriaAutorResumo;
    size?: 'large' | 'normal' | 'xlarge';
}

export function MateriaAutorAvatar({ autor, size = 'large' }: Props) {
    const initial = autor.nome.charAt(0).toUpperCase();
    const icon = autor.tipo === 'externo' ? 'pi pi-user' : undefined;

    if (autor.photoUrl) {
        return <Avatar image={autor.photoUrl} shape="circle" size={size} />;
    }

    if (icon) {
        return <Avatar icon={icon} shape="circle" size={size} />;
    }

    return <Avatar label={initial} shape="circle" size={size} />;
}
