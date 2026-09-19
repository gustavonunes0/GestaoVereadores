export function PanelHeader({
    title,
    logoSrc,
}: {
    title: string;
    logoSrc?: string | null;
}) {
    const hasLogo = Boolean(logoSrc?.trim());

    return (
        <header className="vp-card vp-header">
            <div
                className={`vp-header__brand${
                    hasLogo ? ' vp-header__brand--logo-only' : ''
                }`}
            >
                {hasLogo ? (
                    <img
                        src={logoSrc!}
                        alt={title}
                        className="vp-header__logo"
                    />
                ) : (
                    <h1 className="vp-header__title">{title}</h1>
                )}
            </div>
        </header>
    );
}
