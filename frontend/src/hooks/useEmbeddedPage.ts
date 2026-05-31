import { useLocation } from 'react-router-dom';

/** Página renderizada dentro de /camara (sem título duplicado do layout pai). */
export function useEmbeddedPage() {
  const { pathname } = useLocation();
  return pathname.startsWith('/camara');
}
