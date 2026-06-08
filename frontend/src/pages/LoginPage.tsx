import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FooterBar } from '../components/FooterBar';
import { SiglButton } from '../components/common/SiglButton';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { TabPanel, TabView } from 'primereact/tabview';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../utils/apiErrorMessage';

export function LoginPage() {
    const { user, loginSigl, loginCamara } = useAuth();
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [username, setUsername] = useState('admin');
    const [siglPassword, setSiglPassword] = useState('admin');

    const [email, setEmail] = useState('admin@camara.teste');
    const [camaraPassword, setCamaraPassword] = useState('camara123');
    const [tenantCnpj, setTenantCnpj] = useState('00.000.000/0001-91');

    if (user) return <Navigate to="/" replace />;

    async function handleSiglLogin() {
        setError('');
        setSubmitting(true);
        try {
            await loginSigl(username, siglPassword);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Falha no login'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCamaraLogin() {
        setError('');
        setSubmitting(true);
        try {
            await loginCamara(email, camaraPassword, tenantCnpj);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Falha no login'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-card login-card--wide">
                <h1>SIGL</h1>
                <p className="subtitle">
                    Sistema Integrado de Gestão Legislativa
                </p>

                {error && (
                    <Message
                        severity="error"
                        text={error}
                        className="login-message"
                    />
                )}

                <TabView
                    activeIndex={activeTab}
                    onTabChange={(e) => setActiveTab(e.index)}
                >
                    <TabPanel header="Plataforma SIGL">
                        <div className="login-form-fields">
                            <label htmlFor="username">Usuário</label>
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                className="w-full"
                            />
                            <label htmlFor="sigl-password">Senha</label>
                            <Password
                                id="sigl-password"
                                value={siglPassword}
                                onChange={(e) =>
                                    setSiglPassword(e.target.value)
                                }
                                feedback={false}
                                toggleMask
                                className="w-full"
                                inputClassName="w-full"
                                autoComplete="current-password"
                            />
                            <SiglButton
                                label={submitting ? 'Entrando…' : 'Entrar'}
                                icon="pi pi-sign-in"
                                className="w-full"
                                loading={submitting}
                                onClick={() => void handleSiglLogin()}
                            />
                            <p className="login-hint">
                                Master: <code>admin</code> / <code>admin</code>
                            </p>
                        </div>
                    </TabPanel>

                    <TabPanel header="Câmara Municipal">
                        <div className="login-form-fields">
                            <label htmlFor="email">E-mail</label>
                            <InputText
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full"
                            />
                            <label htmlFor="camara-password">Senha</label>
                            <Password
                                id="camara-password"
                                value={camaraPassword}
                                onChange={(e) =>
                                    setCamaraPassword(e.target.value)
                                }
                                feedback={false}
                                toggleMask
                                className="w-full"
                                inputClassName="w-full"
                                autoComplete="current-password"
                            />
                            <label htmlFor="tenant-cnpj">CNPJ da Câmara</label>
                            <InputText
                                id="tenant-cnpj"
                                value={tenantCnpj}
                                onChange={(e) => setTenantCnpj(e.target.value)}
                                placeholder="00.000.000/0001-91"
                                className="w-full"
                            />
                            <SiglButton
                                label={
                                    submitting
                                        ? 'Entrando…'
                                        : 'Entrar na câmara'
                                }
                                icon="pi pi-building"
                                className="w-full"
                                loading={submitting}
                                onClick={() => void handleCamaraLogin()}
                            />
                            <p className="login-hint">
                                Demo: <code>admin@camara.teste</code> /{' '}
                                <code>camara123</code> — CNPJ{' '}
                                <code>00.000.000/0001-91</code>
                            </p>
                            <p className="login-hint login-hint--info">
                                O tenant é definido pelo JWT após o login. Não
                                envie tenantId manualmente nas demais telas.
                            </p>
                        </div>
                    </TabPanel>
                </TabView>
            </div>

            <FooterBar compact className="login-page__footer" />
        </div>
    );
}
