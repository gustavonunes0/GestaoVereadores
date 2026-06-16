import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../utils/apiErrorMessage';
import { FooterBar } from '../components/FooterBar';
import type { AuthUser } from '../types/auth';

export function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [cpf, setCpf] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (user) {
        return (
            <Navigate
                to={user.role === 'PARLIAMENTARIAN' ? ROUTES.parlamentar.perfil : ROUTES.dashboard}
                replace
            />
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            setError('CPF inválido. Informe os 11 dígitos.');
            return;
        }
        if (!password) {
            setError('Informe a senha.');
            return;
        }

        setLoading(true);
        try {
            await login(cpf, password);
            const stored = localStorage.getItem('user');
            const u: AuthUser | null = stored ? (JSON.parse(stored) as AuthUser) : null;
            if (u?.role === 'PARLIAMENTARIAN') {
                navigate(ROUTES.parlamentar.perfil, { replace: true });
            } else {
                navigate(ROUTES.dashboard, { replace: true });
            }
        } catch (err) {
            setError(getApiErrorMessage(err) || 'CPF ou senha incorretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <div className="login-card">
                <div className="login-card__header">
                    <h1>SIGL</h1>
                    <p className="subtitle">Sistema de Gestão Legislativa</p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} noValidate>
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
                    <div className="field" >
                        <label htmlFor="senha">Senha</label>
                        <input
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
