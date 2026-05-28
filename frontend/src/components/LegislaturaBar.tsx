import { Link } from 'react-router-dom';
import { useLegislatura } from '../contexts/LegislaturaContext';

export function LegislaturaBar() {
  const {
    legislaturas,
    legislaturaId,
    sessaoLegislativaId,
    legislaturaAtiva,
    loading,
    setLegislaturaId,
    setSessaoLegislativaId,
  } = useLegislatura();

  if (loading) {
    return <span className="legislatura-bar muted">Carregando legislatura…</span>;
  }

  if (!legislaturas.length) {
    return (
      <Link to="/camara/legislaturas" className="legislatura-bar link">
        Cadastrar legislatura
      </Link>
    );
  }

  const sessoes = legislaturaAtiva?.sessoesLegislativas ?? [];

  return (
    <div className="legislatura-bar">
      <label className="legislatura-bar-field">
        <span className="sr-only">Legislatura</span>
        <select
          value={legislaturaId}
          onChange={(e) => setLegislaturaId(e.target.value)}
          aria-label="Legislatura em exercício"
        >
          {legislaturas.map((l) => (
            <option key={l.id} value={l.id}>
              Legislatura {l.numero}
            </option>
          ))}
        </select>
      </label>
      {sessoes.length > 0 && (
        <label className="legislatura-bar-field">
          <span className="sr-only">Sessão legislativa</span>
          <select
            value={sessaoLegislativaId}
            onChange={(e) => setSessaoLegislativaId(e.target.value)}
            aria-label="Sessão legislativa"
          >
            {sessoes.map((s) => (
              <option key={s.id} value={s.id}>
                Sessão leg. {s.numero}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
