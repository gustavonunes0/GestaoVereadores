import { useLocation } from 'react-router-dom';

/** Página renderizada dentro de /camara ou /publicacao (sem título duplicado). */
export function useEmbeddedPage() {
  const { pathname } = useLocation();
  return pathname.startsWith('/camara') || pathname.startsWith('/publicacao');
}
