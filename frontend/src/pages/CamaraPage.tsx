import { Outlet } from 'react-router-dom';

/** Agrupa rotas /camara/* sem layout extra (navegação só na sidebar). */
export function CamaraPage() {
  return (
    <div className="page">
      <Outlet />
    </div>
  );
}
