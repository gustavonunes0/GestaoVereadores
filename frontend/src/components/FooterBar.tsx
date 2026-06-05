import { PLATFORM_META } from '../app/platform';

type Props = {
  /** Variante compacta (ex.: login). */
  compact?: boolean;
  className?: string;
};

/** Rodapé institucional: plataforma, versão, beta e powered by. */
export function FooterBar({ compact = false, className = '' }: Props) {
  const { name, stage, version, poweredBy, poweredByUrl } = PLATFORM_META;

  return (
    <footer
      className={`footer-bar${compact ? ' footer-bar--compact' : ''}${className ? ` ${className}` : ''}`}
      role="contentinfo"
    >
      <div className="footer-bar__start">
        <span className="footer-bar__platform">
          <strong>{name}</strong>
          <span className="footer-bar__badge">{stage}</span>
        </span>
        <span className="footer-bar__version" title={`Versão ${version}`}>
          v{version}
        </span>
      </div>

      <p className="footer-bar__powered">
        Powered by{' '}
        {poweredByUrl ? (
          <a href={poweredByUrl} target="_blank" rel="noopener noreferrer">
            {poweredBy}
          </a>
        ) : (
          <strong>{poweredBy}</strong>
        )}
      </p>
    </footer>
  );
}
