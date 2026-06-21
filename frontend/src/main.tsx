import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { addLocale, locale, PrimeReactProvider } from 'primereact/api';
import { PRIME_LOCALE_PT } from './config/prime-locale-pt';

import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import './styles/prime-theme-tokens.css';
import './styles/typography.css';
import './styles/spacing-layout.css';
import './styles/prime-overrides.css';
import './styles/sigl-ui-patterns.css';
import './index.css';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';

addLocale('pt', PRIME_LOCALE_PT);
locale('pt');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PrimeReactProvider value={{ ripple: true, locale: 'pt' }}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </PrimeReactProvider>
    </StrictMode>,
);
