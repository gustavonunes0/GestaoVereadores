import type { ParliamentarianProfile } from '../../api/legislative/parlamentares.api';
import { PersonAvatar } from '../common/PersonAvatar';

type Props = {
    perfil: ParliamentarianProfile | null;
};

export function ParlamentarProfileCard({ perfil }: Props) {
    const nome = perfil?.parliamentaryName ?? '—';
    const cargo = perfil?.nomeCompleto ?? `${nome} Parlamentar`;

    return (
        <div className="parlamentar-profile-card">
            <PersonAvatar
                photoUrl={perfil?.photoUrl}
                name={nome}
                size="xl"
                shape="rounded"
                alt={nome}
                className="parlamentar-profile-card__photo"
            />

            <div className="parlamentar-profile-card__main">
                <h2 className="parlamentar-profile-card__nome">{nome}</h2>
                <span className="parlamentar-profile-card__cargo">{cargo}</span>
                {perfil?.partido?.sigla ? (
                    <span className="parlamentar-profile-card__partido">
                        {perfil.partido.sigla}
                    </span>
                ) : null}
            </div>

            <div className="parlamentar-profile-card__contact">
                {perfil?.email ? (
                    <div className="parlamentar-profile-card__contact-line">
                        <span className="parlamentar-profile-card__contact-label">
                            E-mail:{' '}
                        </span>
                        {perfil.email}
                    </div>
                ) : null}
                {perfil?.officeNumber ? (
                    <div className="parlamentar-profile-card__contact-line">
                        <span className="parlamentar-profile-card__contact-label">
                            Gabinete:{' '}
                        </span>
                        {perfil.officeNumber}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
