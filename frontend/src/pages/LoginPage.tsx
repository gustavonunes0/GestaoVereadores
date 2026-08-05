import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { FooterBar } from '../components/FooterBar';
import { isParlamentarianUser, isPlatformUser } from '../types/auth';
import { isPlatformHostname, currentHostname } from '../utils/tenantHost';
import logoSrc from '../../assets/camara-gest-logo.png';

export function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const platformHost = isPlatformHostname();
    const host = currentHostname();
    /** Em camaragest (ou localhost p/ teste) o super admin entra com e-mail. */
    const useEmailLogin =
        platformHost || host === 'localhost' || host === '127.0.0.1';

    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        if (isPlatformUser(user)) {
            return <Navigate to={ROUTES.platform.tenants} replace />;
        }
        return (
            <Navigate
                to={isParlamentarianUser(user) ? ROUTES.parlamentar.perfil : ROUTES.dashboard}
                replace
            />
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Informe a senha.');
            return;
        }

        let identifier: string;
        if (useEmailLogin) {
            const eTrim = email.trim();
            if (!eTrim.includes('@')) {
                setError('Informe um e-mail válido.');
                return;
            }
            identifier = eTrim;
        } else {
            const cpfLimpo = cpf.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                setError('CPF inválido. Informe os 11 dígitos.');
                return;
            }
            identifier = cpf;
        }

        setLoading(true);
        try {
            await login(identifier, password);
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored) as { sessionType?: string };
                if (parsed.sessionType === 'platform') {
                    navigate(ROUTES.platform.tenants, { replace: true });
                } else if (parsed.sessionType === 'parliamentarian') {
                    navigate(ROUTES.parlamentar.perfil, { replace: true });
                } else {
                    navigate(ROUTES.dashboard, { replace: true });
                }
            }
        } catch (err) {
            setError(
                getApiErrorMessage(err) ||
                    (useEmailLogin
                        ? 'E-mail ou senha incorretos.'
                        : 'CPF ou senha incorretos.'),
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-card">
                <div className="text-center login-card__brand">
                    <img
                        src={logoSrc}
                        alt={
                            platformHost
                                ? 'CâmaraGest — painel da plataforma'
                                : 'CâmaraGest — Gestão de Mandatos, Poder Legislativo'
                        }
                        className="login-card__logo"
                        width={280}
                        height={200}
                    />
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                    {useEmailLogin ? (
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                autoFocus
                                autoComplete="username"
                                className="w-full"
                            />
                        </div>
                    ) : (
                        <div className="field">
                            <label htmlFor="cpf">CPF</label>
                            <InputMask
                                id="cpf"
                                mask="999.999.999-99"
                                value={cpf}
                                onChange={(e) => setCpf(e.value ?? '')}
                                placeholder="000.000.000-00"
                                autoFocus
                                className="w-full"
                            />
                        </div>
                    )}
                    <div className="field mt-3">
                        <label htmlFor="senha">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full"
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <Message severity="error" text={error} className="w-full mb-3" />
                    )}

                    <Button
                        type="submit"
                        label="Entrar"
                        icon="pi pi-sign-in"
                        loading={loading}
                        className="w-full mt-4"
                    />
                </form>
            </div>

            <FooterBar compact className="login-page__footer" />
        </main>
    );
}
