import type { SvgIconComponent } from '@mui/icons-material';

export type SummaryCardProps = {
    icon: SvgIconComponent;
    title: string;
    description: string;
    onClick: () => void;
};

export function SummaryCard({ icon: Icon, title, description, onClick }: SummaryCardProps) {
    return (
        <button type="button" className="parlamentar-summary-card" onClick={onClick}>
            <div className="parlamentar-summary-card__icon-wrap">
                <Icon sx={{ fontSize: 18, color: '#2563a8' }} aria-hidden />
            </div>
            <h3 className="parlamentar-summary-card__title">{title}</h3>
            <p className="parlamentar-summary-card__description">{description}</p>
        </button>
    );
}
