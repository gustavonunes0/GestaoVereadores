import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import { PageHeader } from '../../components/PageHeader';

export function ParlamentarBiografiaPage() {
    return (
        <>
            <PageHeader
                title="Biografia"
                icon={<ArticleOutlined sx={{ fontSize: 24, color: '#4a7ab5' }} />}
            />
            <p className="text-color-secondary">Em desenvolvimento.</p>
        </>
    );
}
