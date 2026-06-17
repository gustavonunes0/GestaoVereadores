import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import { PageHeader } from '../../components/PageHeader';

export function ParlamentarDashboardPage() {
    return (
        <>
            <PageHeader
                title="Dashboard Parlamentar"
                icon={<DashboardOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
            />
            <p className="text-color-secondary">Em desenvolvimento.</p>
        </>
    );
}
