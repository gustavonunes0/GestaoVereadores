import { Link } from 'react-router-dom';
import { useLegislatura } from '../contexts/LegislaturaContext';

type Props = {
  step?: string;
  hint?: string;
};

export function ContextBanner({ step, hint }: Props) {
  const { legislaturaAtiva, sessaoLegislativaAtiva, loading } = useLegislatura();

  if (loading || !legislaturaAtiva) return null;

  return (
    <div className="context-banner">
      <div className="context-banner-main">
        {step && <span className="context-step">{step}</span>}
        <span>
          <strong>Legislatura {legislaturaAtiva.numero}</strong>
          {sessaoLegislativaAtiva && (
            <> · Sessão legislativa {sessaoLegislativaAtiva.numero}</>
          )}
        </span>
        {hint && <span className="context-hint">{hint}</span>}
      </div>
      <Link to="/camara/legislaturas" className="context-link">
        Ajustar estrutura
      </Link>
    </div>
  );
}
