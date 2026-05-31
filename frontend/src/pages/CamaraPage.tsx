import { Outlet } from 'react-router-dom';
import { CAMARA_TABS } from '../app/navigation';
import { PageHeader } from '../components/PageHeader';
import { TabNav } from '../components/TabNav';

export function CamaraPage() {
  return (
    <div className="flow-page">
      <PageHeader
        title="Estrutura da Câmara"
        subtitle="Parlamentares, colegiados e legislatura — base para matérias, sessões e publicação."
      />
      <TabNav tabs={[...CAMARA_TABS]} />
      <div className="tab-panel">
        <Outlet />
      </div>
    </div>
  );
}
