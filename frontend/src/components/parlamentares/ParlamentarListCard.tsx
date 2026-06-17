import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import type { Parliamentarian } from '../../api/legislative/parlamentares.api';

const STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    LICENSED: 'Licenciado',
    REMOVED: 'Removido',
};

const MANDATE_STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Titular',
    FINISHED: 'Encerrado',
    INTERRUPTED: 'Interrompido',
    LICENSED: 'Licenciado',
};

type Props = {
    row: Parliamentarian;
    onVerMandatos?: (row: Parliamentarian) => void;
    onVerComissoes?: (row: Parliamentarian) => void;
};

function truncate(text: string | undefined, max = 120) {
    if (!text?.trim()) return null;
    const t = text.trim();
    return t.length > max ? `${t.slice(0, max)}…` : t;
}

export function ParlamentarListCard({ row, onVerMandatos, onVerComissoes }: Props) {
    const email = row.user?.email;
    const partyLabel = row.politicalParty
        ? `${row.politicalParty.acronym} — ${row.politicalParty.name}`
        : null;
    const mandateBadge = row.activeMandate?.status
        ? MANDATE_STATUS_LABEL[row.activeMandate.status] ?? row.activeMandate.status
        : row.activeMandatesCount
          ? 'Com mandato'
          : null;
    const stats = row.stats;

    return (
        <div className="parlamentar-list-card">
            <div className="parlamentar-list-card__header">
                {row.photoUrl ? (
                    <Avatar image={row.photoUrl} size="xlarge" shape="circle" />
                ) : (
                    <Avatar
                        label={row.parliamentaryName.charAt(0).toUpperCase()}
                        size="xlarge"
                        shape="circle"
                    />
                )}
                <div className="parlamentar-list-card__identity">
                    <div className="parlamentar-list-card__name-row">
                        <strong className="parlamentar-list-card__name">
                            {row.parliamentaryName}
                        </strong>
                        {mandateBadge && (
                            <Tag value={mandateBadge} severity="info" className="text-xs" />
                        )}
                        <Tag
                            value={STATUS_LABEL[row.status] ?? row.status}
                            severity={row.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className="text-xs"
                        />
                    </div>
                    <p className="parlamentar-list-card__email">
                        {email ?? 'E-mail não informado'}
                    </p>
                    {partyLabel && (
                        <p className="parlamentar-list-card__party">{partyLabel}</p>
                    )}
                    <p className="parlamentar-list-card__meta">
                        <span>
                            Núm. de Gabinete:{' '}
                            {row.officeNumber?.trim() ? row.officeNumber : 'Não informado'}
                        </span>
                    </p>
                    <p className="parlamentar-list-card__bio">
                        {truncate(row.biography) ?? 'Biografia não informada'}
                    </p>
                </div>
            </div>

            {stats && (
                <div className="parlamentar-list-card__stats">
                    <div className="parlamentar-list-card__stat">
                        <span className="parlamentar-list-card__stat-label">
                            Proposições própria autoria
                        </span>
                        <strong>{stats.authoredMattersCount}</strong>
                    </div>
                    <div className="parlamentar-list-card__stat">
                        <span className="parlamentar-list-card__stat-label">
                            Participação em proposições
                        </span>
                        <strong>{stats.coauthoredMattersCount}</strong>
                    </div>
                    <div className="parlamentar-list-card__stat">
                        <span className="parlamentar-list-card__stat-label">
                            Participação em sessões
                        </span>
                        <strong>{stats.sessionVotesCount}</strong>
                    </div>
                </div>
            )}

            <div className="parlamentar-list-card__links">
                <div className="parlamentar-list-card__link-item">
                    <span>{row.activeMandatesCount ?? 0} Mandato(s)</span>
                    <Button
                        label="Ver"
                        link
                        size="small"
                        onClick={() => onVerMandatos?.(row)}
                        disabled={!row.activeMandatesCount}
                    />
                </div>
                <div className="parlamentar-list-card__link-item">
                    <span>{stats?.committeeMembersCount ?? 0} Comissão(ões)</span>
                    <Button
                        label="Ver"
                        link
                        size="small"
                        onClick={() => onVerComissoes?.(row)}
                        disabled={!stats?.committeeMembersCount}
                    />
                </div>
            </div>
        </div>
    );
}
