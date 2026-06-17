import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    parlamentaresApi,
    type ParliamentarianProfile,
} from '../../api/legislative/parlamentares.api';
import { ROUTES } from '../../app/navigation';
import { PageHeader } from '../../components/PageHeader';
import { ParlamentarProfileCard } from '../../components/parlamentar/ParlamentarProfileCard';
import { SummaryCard } from '../../components/parlamentar/SummaryCard';
import { useAppToast } from '../../hooks/useAppToast';

export function ParlamentarPerfilPage() {
    const navigate = useNavigate();
    const { showApiError } = useAppToast();
    const [perfil, setPerfil] = useState<ParliamentarianProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        parlamentaresApi
            .meuPerfil()
            .then(setPerfil)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [showApiError]);

    if (loading) {
        return (
            <div className="flex justify-content-center p-5">
                <ProgressSpinner />
            </div>
        );
    }

    const comissoesDesc =
        perfil?.comissoes.length
            ? `${perfil.comissoes.length} comissão(ões) ativa(s)`
            : 'Acesse "Comissões" para ver sua participação.';

    return (
        <>
            <PageHeader
                icon={<BadgeOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
                title="Perfil Parlamentar"
            />

            <ParlamentarProfileCard perfil={perfil} />

            <div className="parlamentar-summary-grid">
                <SummaryCard
                    icon={DescriptionOutlined}
                    title="Minhas matérias"
                    description='Acesse "Minhas Matérias" para ver detalhes.'
                    onClick={() => navigate(ROUTES.parlamentar.materias)}
                />
                <SummaryCard
                    icon={CalendarMonthOutlined}
                    title="Próximas sessões"
                    description="Calendário legislativo em breve."
                    onClick={() => navigate(ROUTES.parlamentar.mandato)}
                />
                <SummaryCard
                    icon={PeopleOutlined}
                    title="Comissões"
                    description={comissoesDesc}
                    onClick={() => navigate(ROUTES.parlamentar.comissoes)}
                />
            </div>
        </>
    );
}
