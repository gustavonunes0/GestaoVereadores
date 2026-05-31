import { Outlet } from 'react-router-dom';
import { CAMARA_TABS, MODULE_ICONS } from '../app/navigation';
import { PageHeader } from '../components/PageHeader';
import { TabNav } from '../components/TabNav';

export function CamaraPage() {
  return (
    <div className="flow-page">
      <PageHeader
        icon={MODULE_ICONS.camara}
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
