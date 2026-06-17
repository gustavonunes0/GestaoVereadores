import type { ParliamentarianProfile } from '../../api/legislative/parlamentares.api';

type Props = {
    perfil: ParliamentarianProfile | null;
};

export function ParlamentarProfileCard({ perfil }: Props) {
    const nome = perfil?.parliamentaryName ?? '—';
    const cargo = perfil?.nomeCompleto ?? `${nome} Parlamentar`;
    const inicial = nome.charAt(0).toUpperCase();

    return (
        <div className="parlamentar-profile-card">
            {perfil?.photoUrl ? (
                <img
                    src={perfil.photoUrl}
                    alt={nome}
                    className="parlamentar-profile-card__photo"
                />
            ) : (
                <div
                    className="parlamentar-profile-card__photo parlamentar-profile-card__photo--fallback"
                    aria-hidden
                >
                    {inicial}
                </div>
            )}

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
