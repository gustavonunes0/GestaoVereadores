import { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import {
    parlamentaresApi,
    type Parliamentarian,
    type ParlamentarMandato,
} from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';
import { formatCpf } from '../../utils/cpf';
import { formatDatePt } from '../../utils/formatDate';
import { ParlamentarEditDialog } from './ParlamentarEditDialog';

interface Props {
    parlamentarianId: string;
    onClose: () => void;
    onChanged?: () => void;
}

const ACCESS_LABEL: Record<string, string> = {
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    SUSPENDED: 'Suspenso',
};

const ACCESS_SEV: Record<string, 'success' | 'secondary' | 'warning'> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    SUSPENDED: 'warning',
};

function userDisplayName(p: Parliamentarian): string {
    if (!p.user) return p.parliamentaryName;
    return `${p.user.firstName} ${p.user.lastName}`.trim();
}

export function ParlamentarVerDialog({ parlamentarianId, onClose, onChanged }: Props) {
    const { showApiError } = useAppToast();
    const [loading, setLoading] = useState(true);
    const [parlamentar, setParlamentar] = useState<Parliamentarian | null>(null);
    const [mandatos, setMandatos] = useState<ParlamentarMandato[]>([]);
    const [showEdit, setShowEdit] = useState(false);

    const carregar = useCallback(() => {
        setLoading(true);
        Promise.all([
            parlamentaresApi.getById(parlamentarianId),
            parlamentaresApi.listMandatos(parlamentarianId),
        ])
            .then(([p, m]) => {
                setParlamentar(p);
                setMandatos(m.data);
            })
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [parlamentarianId, showApiError]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const accessStatus =
        parlamentar?.accessStatus ?? (parlamentar?.hasAccess ? 'ACTIVE' : 'INACTIVE');

    return (
        <>
            <Dialog
                header={parlamentar?.parliamentaryName ?? 'Parlamentar'}
                visible
                onHide={onClose}
                className="parlamentar-ver-dialog lex-dialog lex-dialog--view"
                style={{ width: 'min(96vw, 720px)' }}
                modal
                footer={
                    parlamentar ? (
                        <div className="flex justify-content-end gap-2">
                            <Button label="Fechar" severity="secondary" onClick={onClose} />
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                onClick={() => setShowEdit(true)}
                            />
                        </div>
                    ) : undefined
                }
            >
                {loading ? (
                    <div className="flex justify-content-center p-4">
                        <ProgressSpinner style={{ width: 40, height: 40 }} />
                    </div>
                ) : !parlamentar ? (
                    <p className="text-color-secondary text-center p-4 m-0">
                        Parlamentar não encontrado.
                    </p>
                ) : (
                    <div className="sigl-dialog-body sigl-dialog-body--dense parlamentar-ver-body">
                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-id-card" aria-hidden />
                                Identificação
                            </span>
                            <div className="parlamentar-ver-grid">
                                <div className="parlamentar-ver-field parlamentar-ver-field--wide">
                                    <span className="sigl-field-label">Nome parlamentar</span>
                                    <p className="parlamentar-ver-value">
                                        {parlamentar.parliamentaryName}
                                    </p>
                                </div>
                                <div className="parlamentar-ver-field">
                                    <span className="sigl-field-label">Status legislativo</span>
                                    <p className="parlamentar-ver-value">{parlamentar.status}</p>
                                </div>
                                {parlamentar.officeNumber ? (
                                    <div className="parlamentar-ver-field">
                                        <span className="sigl-field-label">Gabinete</span>
                                        <p className="parlamentar-ver-value">
                                            {parlamentar.officeNumber}
                                        </p>
                                    </div>
                                ) : null}
                                {parlamentar.user?.politicalParty ? (
                                    <div className="parlamentar-ver-field parlamentar-ver-field--wide">
                                        <span className="sigl-field-label">Partido</span>
                                        <p className="parlamentar-ver-value">
                                            {parlamentar.user.politicalParty.acronym} —{' '}
                                            {parlamentar.user.politicalParty.name}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-user" aria-hidden />
                                Conta de acesso
                            </span>
                            {parlamentar.user ? (
                                <div className="parlamentar-vinculo-card ativo parlamentar-ver-full">
                                    <div className="parlamentar-ver-acesso">
                                        <div className="parlamentar-ver-acesso__main">
                                            <strong className="parlamentar-ver-value">
                                                {userDisplayName(parlamentar)}
                                            </strong>
                                            <Tag
                                                value={ACCESS_LABEL[accessStatus] ?? accessStatus}
                                                severity={ACCESS_SEV[accessStatus] ?? 'secondary'}
                                            />
                                        </div>
                                        <div className="parlamentar-ver-acesso__meta">
                                            <div className="parlamentar-ver-field">
                                                <span className="sigl-field-label">CPF</span>
                                                <p className="parlamentar-ver-value">
                                                    {formatCpf(parlamentar.user.cpf)}
                                                </p>
                                            </div>
                                            <div className="parlamentar-ver-field parlamentar-ver-field--wide">
                                                <span className="sigl-field-label">E-mail</span>
                                                <p className="parlamentar-ver-value">
                                                    {parlamentar.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-color-secondary m-0 parlamentar-ver-full">
                                    Nenhum usuário vinculado — parlamentar sem acesso ao CâmaraGest.
                                </p>
                            )}
                        </div>

                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-calendar" aria-hidden />
                                Mandatos
                            </span>
                            {mandatos.length === 0 ? (
                                <p className="text-color-secondary m-0 parlamentar-ver-full">
                                    Nenhum mandato cadastrado.
                                </p>
                            ) : (
                                <ul className="parlamentar-ver-mandatos parlamentar-ver-full">
                                    {mandatos.map((m) => (
                                        <li key={m.id} className="parlamentar-ver-mandato">
                                            <div className="parlamentar-ver-mandato__head">
                                                <strong>
                                                    Legislatura {m.legislature.number}
                                                </strong>
                                                <div className="parlamentar-ver-mandato__tags">
                                                    {m.legislature.isCurrent ? (
                                                        <Tag value="Atual" severity="success" />
                                                    ) : null}
                                                    <Tag value={m.status} severity="info" />
                                                </div>
                                            </div>
                                            <div className="parlamentar-ver-acesso__meta">
                                                <div className="parlamentar-ver-field">
                                                    <span className="sigl-field-label">Início</span>
                                                    <p className="parlamentar-ver-value">
                                                        {formatDatePt(m.startedAt)}
                                                    </p>
                                                </div>
                                                <div className="parlamentar-ver-field">
                                                    <span className="sigl-field-label">Fim</span>
                                                    <p className="parlamentar-ver-value">
                                                        {m.endedAt
                                                            ? formatDatePt(m.endedAt)
                                                            : m.legislature.endDate
                                                              ? `Previsto ${formatDatePt(m.legislature.endDate)}`
                                                              : 'Em andamento'}
                                                    </p>
                                                </div>
                                                {(m.partyAcronym || m.partyName) && (
                                                    <div className="parlamentar-ver-field parlamentar-ver-field--wide">
                                                        <span className="sigl-field-label">
                                                            Partido no mandato
                                                        </span>
                                                        <p className="parlamentar-ver-value">
                                                            {[m.partyAcronym, m.partyName]
                                                                .filter(Boolean)
                                                                .join(' — ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            {showEdit && parlamentar && (
                <ParlamentarEditDialog
                    parliamentarianId={parlamentarianId}
                    parlamentar={parlamentar}
                    mandatos={mandatos}
                    onClose={() => setShowEdit(false)}
                    onSaved={() => {
                        setShowEdit(false);
                        carregar();
                        onChanged?.();
                    }}
                />
            )}
        </>
    );
}
