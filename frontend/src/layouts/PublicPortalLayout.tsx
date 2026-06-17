import { NavLink, Outlet } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { usePortalPublic } from '../contexts/PortalPublicContext';
import { PortalNotFoundPage } from '../pages/portal/PortalNotFoundPage';

type NavItem = {
    to: string;
    label: string;
    end?: boolean;
};

export function PublicPortalLayout() {
    const { config, loading, error, basePath } = usePortalPublic();

    if (loading) {
        return (
            <div className="portal-public portal-public--loading">
                <ProgressSpinner aria-label="Carregando portal" />
            </div>
        );
    }

    if (error || !config) {
        return <PortalNotFoundPage message={error ?? 'Portal não encontrado'} />;
    }

    const primary = config.cores?.primaria ?? 'var(--accent, #2563a8)';
    const navItems: NavItem[] = [{ to: basePath, label: 'Início', end: true }];

    if (config.secoes.vereadores) {
        navItems.push({ to: `${basePath}/vereadores`, label: 'Vereadores' });
    }
    if (config.secoes.mesaDiretora) {
        navItems.push({ to: `${basePath}/mesa-diretora`, label: 'Mesa Diretora' });
    }
    if (config.secoes.comissoes) {
        navItems.push({ to: `${basePath}/comissoes`, label: 'Comissões' });
    }
    if (config.secoes.agenda) {
        navItems.push({ to: `${basePath}/agenda`, label: 'Agenda' });
    }
    if (config.secoes.normas) {
        navItems.push({ to: `${basePath}/normas`, label: 'Normas' });
    }
    navItems.push({ to: `${basePath}/contato`, label: 'Contato' });

    return (
        <div
            className="portal-public"
            style={{ '--portal-primary': primary } as CSSProperties}
        >
            <header className="portal-public__header">
                <div className="portal-public__header-inner">
                    <NavLink to={basePath} className="portal-public__brand">
                        {config.logo ? (
                            <img
                                src={config.logo}
                                alt={config.titulo}
                                className="portal-public__logo"
                            />
                        ) : null}
                        <div>
                            <h1 className="portal-public__title">{config.titulo}</h1>
                            {config.subtitulo ? (
                                <p className="portal-public__subtitle">{config.subtitulo}</p>
                            ) : null}
                        </div>
                    </NavLink>
                    <nav className="portal-public__nav" aria-label="Menu do portal">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `portal-public__nav-link${isActive ? ' portal-public__nav-link--active' : ''}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            {config.bannerUrl ? (
                <div
                    className="portal-public__banner"
                    style={{ backgroundImage: `url(${config.bannerUrl})` }}
                    role="img"
                    aria-label="Banner institucional"
                />
            ) : null}

            <main className="portal-public__main">
                <Outlet />
            </main>

            <footer className="portal-public__footer">
                <div className="portal-public__footer-inner">
                    <p className="portal-public__footer-title">{config.titulo}</p>
                    {config.endereco ? (
                        <p className="portal-public__footer-line">{config.endereco}</p>
                    ) : null}
                    {config.telefone ? (
                        <p className="portal-public__footer-line">Tel: {config.telefone}</p>
                    ) : null}
                    {config.email ? (
                        <p className="portal-public__footer-line">
                            <a href={`mailto:${config.email}`}>{config.email}</a>
                        </p>
                    ) : null}
                    <div className="portal-public__social">
                        {config.redesSociais?.facebook ? (
                            <a href={config.redesSociais.facebook} target="_blank" rel="noreferrer">
                                Facebook
                            </a>
                        ) : null}
                        {config.redesSociais?.instagram ? (
                            <a href={config.redesSociais.instagram} target="_blank" rel="noreferrer">
                                Instagram
                            </a>
                        ) : null}
                        {config.redesSociais?.youtube ? (
                            <a href={config.redesSociais.youtube} target="_blank" rel="noreferrer">
                                YouTube
                            </a>
                        ) : null}
                    </div>
                </div>
            </footer>
        </div>
    );
}
