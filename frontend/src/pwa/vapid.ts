/**
 * Chave pública VAPID da PWA (a mesma do backend).
 * Fallback quando o .env do frontend não define VITE_VAPID_PUBLIC_KEY.
 * A chave privada permanece apenas no servidor.
 */
export const DEFAULT_VAPID_PUBLIC_KEY =
    'BHZh5G2yLl4cWEw8m5XTLbTxMcVdjLbHVYtmewxRqh5Q94OQTu9m1tkOaUMywY_oVgmZ0MIRdh4k-6OdnPLTLIw';
