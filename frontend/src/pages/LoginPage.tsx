import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>SIGL</h1>
        <p className="subtitle">Sistema Integrado de Gestão Legislativa</p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label>
              Usuário
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted)' }}>
          Master: <code>admin</code> / <code>admin</code>
        </p>
      </div>
    </div>
  );
}
