import { usePortalPublic } from '../../contexts/PortalPublicContext';

export function PortalContatoPage() {
    const { config } = usePortalPublic();

    if (!config) return null;

    return (
        <div className="portal-page">
            <h2 className="portal-page__title">Contato</h2>

            <div className="portal-contact-card">
                <h3>{config.titulo}</h3>
                {config.endereco ? (
                    <p>
                        <strong>Endereço:</strong> {config.endereco}
                    </p>
                ) : null}
                {config.telefone ? (
                    <p>
                        <strong>Telefone:</strong>{' '}
                        <a href={`tel:${config.telefone}`}>{config.telefone}</a>
                    </p>
                ) : null}
                {config.email ? (
                    <p>
                        <strong>E-mail:</strong>{' '}
                        <a href={`mailto:${config.email}`}>{config.email}</a>
                    </p>
                ) : null}

                {(config.redesSociais?.facebook ||
                    config.redesSociais?.instagram ||
                    config.redesSociais?.youtube) && (
                    <div className="portal-contact-social">
                        <strong>Redes sociais</strong>
                        <ul className="portal-list">
                            {config.redesSociais.facebook ? (
                                <li>
                                    <a
                                        href={config.redesSociais.facebook}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Facebook
                                    </a>
                                </li>
                            ) : null}
                            {config.redesSociais.instagram ? (
                                <li>
                                    <a
                                        href={config.redesSociais.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Instagram
                                    </a>
                                </li>
                            ) : null}
                            {config.redesSociais.youtube ? (
                                <li>
                                    <a
                                        href={config.redesSociais.youtube}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        YouTube
                                    </a>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
