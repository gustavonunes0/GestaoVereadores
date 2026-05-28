import { Outlet } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { TabNav } from '../components/TabNav';

const tabs = [
  { to: '/camara/parlamentares', label: 'Parlamentares' },
  { to: '/camara/comissoes', label: 'Comissões' },
  { to: '/camara/frentes', label: 'Frentes' },
  { to: '/camara/mesa-diretora', label: 'Mesa diretora' },
  { to: '/camara/autores', label: 'Autores' },
  { to: '/camara/legislaturas', label: 'Legislaturas' },
];

export function CamaraPage() {
  return (
    <div className="flow-page">
      <PageHeader
        title="Estrutura da Câmara"
        subtitle="Parlamentares, colegiados e legislatura — base para matérias, sessões e publicação."
      />
      <TabNav tabs={tabs} />
      <div className="tab-panel">
        <Outlet />
      </div>
    </div>
  );
}
