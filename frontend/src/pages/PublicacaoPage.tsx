import { Outlet } from 'react-router-dom';
import { ContextBanner } from '../components/ContextBanner';
import { PageHeader } from '../components/PageHeader';
import { TabNav } from '../components/TabNav';

const tabs = [
  { to: '/publicacao/normas', label: 'Normas jurídicas', end: true },
  { to: '/publicacao/atos', label: 'Atos' },
];

export function PublicacaoPage() {
  return (
    <div className="flow-page">
      <PageHeader
        title="Publicação"
        subtitle="Efetivação do resultado legislativo — normas e atos após tramitação e votação."
      />
      <ContextBanner
        step="Etapa 4"
        hint="Matérias aprovadas podem gerar normas vinculadas à legislatura em exercício."
      />
      <TabNav tabs={tabs} />
      <div className="tab-panel">
        <Outlet />
      </div>
    </div>
  );
}
