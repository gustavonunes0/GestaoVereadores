import { Outlet } from 'react-router-dom';
import { PUBLICACAO_TABS } from '../app/navigation';
import { ContextBanner } from '../components/ContextBanner';
import { PageHeader } from '../components/PageHeader';
import { TabNav } from '../components/TabNav';

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
      <TabNav tabs={[...PUBLICACAO_TABS]} />
      <div className="tab-panel">
        <Outlet />
      </div>
    </div>
  );
}
