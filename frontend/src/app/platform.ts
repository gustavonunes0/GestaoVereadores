/** Metadados da plataforma SIGL (versão, estágio, powered by). */
export const PLATFORM_META = {
    name: 'SGL',
    fullName: 'Consenso SGL',
    stage: 'Beta',
    version: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
    poweredBy: import.meta.env.VITE_POWERED_BY ?? 'Stash Software',
    poweredByUrl: import.meta.env.VITE_POWERED_BY_URL,
} as const;
