import { PLATFORM_META } from '../app/platform';

type Props = {
    /** Variante compacta (ex.: login). */
    compact?: boolean;
    className?: string;
};

/** Rodapé institucional: plataforma, versão, beta e powered by em uma única linha. */
export function FooterBar({ compact = false, className = '' }: Props) {
    const { version, poweredBy, poweredByUrl } = PLATFORM_META;

    return (
        <footer
            className={`footer-bar${compact ? ' footer-bar--compact' : ''}${className ? ` ${className}` : ''}`}
            role="contentinfo"
        >
            {/* <span className="footer-bar__platform">
                <strong>{name}</strong>
                <span className="footer-bar__badge">{stage}</span>
            </span> */}

            <span className="footer-bar__sep" aria-hidden>
                ·
            </span>

            <span className="footer-bar__version" title={`Versão ${version}`}>
                v{version}
            </span>

            <span className="footer-bar__sep" aria-hidden>
                ·
            </span>

            <span className="footer-bar__powered">
                Powered by{' '}
                {poweredByUrl ? (
                    <a href={poweredByUrl} target="_blank" rel="noopener noreferrer">
                        {poweredBy}
                    </a>
                ) : (
                    <strong>{poweredBy}</strong>
                )}
            </span>
        </footer>
    );
}
