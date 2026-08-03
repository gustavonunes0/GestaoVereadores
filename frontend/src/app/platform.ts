/** Metadados da plataforma CâmaraGest (versão, estágio, powered by). */
export const PLATFORM_META = {
    name: 'CâmaraGest',
    fullName: 'CâmaraGest — Gestão Legislativa',
    stage: 'Beta',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    poweredBy: import.meta.env.VITE_POWERED_BY ?? 'Stellar',
    poweredByUrl: import.meta.env.VITE_POWERED_BY_URL ?? 'https://stellarsolucoes.com.br',
} as const;
