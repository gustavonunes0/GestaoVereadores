type Props = {
    title: string;
    logoSrc?: string | null;
    materiaTitulo?: string;
    mode?: 'live' | 'result';
    resultadoLabel?: string | null;
};

export function PanelHeader({
    title,
    logoSrc,
    materiaTitulo,
    mode = 'live',
    resultadoLabel,
}: Props) {
    const hasLogo = Boolean(logoSrc?.trim());
    const hasMateria = Boolean(materiaTitulo?.trim());
    const statusText =
        mode === 'live' ? 'Votação Aberta' : resultadoLabel ?? 'Resultado';

    return (
        <header className="vp-card vp-header vp-header--dashboard">
            <div className="vp-header__branding">
                {hasLogo ? (
                    <img
                        src={logoSrc!}
                        alt=""
                        className="vp-header__logo"
                    />
                ) : (
                    <div className="vp-header__emblem" aria-hidden>
                        <i className="pi pi-building" />
                    </div>
                )}
                <div className="vp-header__titles">
                    <span className="vp-header__estado">Estado do Ceará</span>
                    <h1 className="vp-header__title">{title}</h1>
                </div>
            </div>

            {hasMateria ? (
                <div
                    className="vp-header__materia"
                    role="status"
                    aria-live="polite"
                    aria-label={
                        mode === 'live'
                            ? `Votação aberta: ${materiaTitulo}`
                            : `Resultado ${resultadoLabel ?? ''}: ${materiaTitulo}`
                    }
                >
                    <div className="vp-header__materia-text">
                        <span className="vp-header__materia-label">
                            <i className="pi pi-file" aria-hidden />
                            Matéria em Votação
                        </span>
                        <strong className="vp-header__materia-titulo">
                            {materiaTitulo}
                        </strong>
                    </div>
                    <span
                        className={`vp-header__status${
                            mode === 'live'
                                ? ' vp-header__status--live'
                                : ' vp-header__status--result'
                        }`}
                    >
                        <span className="vp-header__status-dot" aria-hidden />
                        {statusText}
                    </span>
                </div>
            ) : null}
        </header>
    );
}
