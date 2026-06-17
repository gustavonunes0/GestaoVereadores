import { Avatar } from 'primereact/avatar';
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
};

const EMPTY = '—';

function formatPartyLabel(acronym: string, name: string): string {
    const sigla = acronym.trim();
    const nome = name.trim();
    if (!sigla && !nome) return EMPTY;
    if (!sigla) return nome;
    if (!nome) return sigla;
    if (sigla.toUpperCase() === nome.toUpperCase()) return sigla;
    return `${sigla} — ${nome}`;
}

/** Coluna principal — foto e identificação do parlamentar (listagem). */
export function ParlamentarListCard({ row }: Props) {
    const displayName = row.parliamentaryName?.trim() || 'Sem nome';
    const email = row.user?.email?.trim() || null;
    const party = row.user?.politicalParty;
    const partyLabel = party
        ? formatPartyLabel(party.acronym, party.name)
        : null;
    const mandateBadge = row.activeMandate?.status
        ? MANDATE_STATUS_LABEL[row.activeMandate.status] ?? row.activeMandate.status
        : row.activeMandatesCount
          ? 'Com mandato'
          : null;
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="parlamentar-list-card">
            <div className="parlamentar-list-card__avatar" aria-hidden>
                {row.photoUrl ? (
                    <Avatar image={row.photoUrl} shape="circle" />
                ) : (
                    <Avatar label={initial} shape="circle" />
                )}
            </div>
            <div className="parlamentar-list-card__identity">
                <div className="parlamentar-list-card__name-row">
                    <strong className="parlamentar-list-card__name">
                        {displayName}
                    </strong>
                    <div className="parlamentar-list-card__badges">
                        {mandateBadge ? (
                            <Tag value={mandateBadge} severity="info" className="text-xs" />
                        ) : null}
                        <Tag
                            value={STATUS_LABEL[row.status] ?? row.status}
                            severity={row.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className="text-xs"
                        />
                    </div>
                </div>
                <p className="parlamentar-list-card__line">
                    {email ?? EMPTY}
                </p>
                {partyLabel ? (
                    <p className="parlamentar-list-card__line parlamentar-list-card__party">
                        {party?.flagUrl ? (
                            <img
                                src={party.flagUrl}
                                alt=""
                                className="parlamentar-list-card__party-flag"
                            />
                        ) : (
                            <span
                                className="parlamentar-list-card__party-flag parlamentar-list-card__party-flag--placeholder"
                                aria-hidden
                            >
                                {party?.acronym?.slice(0, 2).toUpperCase() || '—'}
                            </span>
                        )}
                        <span>{partyLabel}</span>
                    </p>
                ) : null}
            </div>
        </div>
    );
}

type StatCellProps = {
    value: number;
};

export function ParlamentarTableStatCell({ value }: StatCellProps) {
    return (
        <div className="parlamentar-table-stat">
            <strong className="parlamentar-table-stat__value">{value}</strong>
        </div>
    );
}

type LinkCellProps = {
    count: number;
    label: string;
    onVer: () => void;
};

export function ParlamentarTableLinkCell({ count, label, onVer }: LinkCellProps) {
    return (
        <div className="parlamentar-table-link">
            <span className="parlamentar-table-link__count">{count}</span>
            <span className="parlamentar-table-link__label">{label}</span>
            <button
                type="button"
                className="parlamentar-table-link__btn"
                onClick={onVer}
                disabled={count === 0}
            >
                Ver
            </button>
        </div>
    );
}
