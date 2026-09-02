import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { addLocale, locale, PrimeReactProvider } from 'primereact/api';
import { PRIME_LOCALE_PT } from './config/prime-locale-pt';

// Lato self-hosted: entra no precache do service worker (offline) e remove
// duas conexões externas do caminho crítico de render.
import '@fontsource/lato/400.css';
import '@fontsource/lato/400-italic.css';
import '@fontsource/lato/700.css';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './styles/prime-theme-tokens.css';
import './styles/typography.css';
import './styles/spacing-layout.css';
import './styles/prime-overrides.css';
import './styles/lex-dialog.css';
import './styles/sigl-form-controls.css';
import './styles/sigl-ui-patterns.css';
import './styles/pwa-mobile.css';
import './index.css';
import './styles/lex-sessao.css';
import './styles/lex-presenca.css';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { listenForInstallPrompt } from './pwa/installPrompt';
import { registerPwa } from './pwa/registerPwa';

addLocale('pt', PRIME_LOCALE_PT);
locale('pt');
registerPwa();
listenForInstallPrompt();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PrimeReactProvider value={{ ripple: true, locale: 'pt' }}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </PrimeReactProvider>
    </StrictMode>,
);
