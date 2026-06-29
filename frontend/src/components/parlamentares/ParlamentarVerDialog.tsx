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

    const accessStatus = parlamentar?.accessStatus ?? (parlamentar?.hasAccess ? 'ACTIVE' : 'INACTIVE');

    return (
        <>
            <Dialog
                header={parlamentar?.parliamentaryName ?? 'Parlamentar'}
                visible
                onHide={onClose}
                style={{ width: 'min(95vw, 620px)' }}
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
                    <div className="sigl-dialog-body sigl-dialog-body--dense">
                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-id-card" aria-hidden />
                                Identificação
                            </span>
                            <div className="sigl-dialog-grid sigl-dialog-grid-2">
                                <div className="sigl-filtro-campo">
                                    <span className="sigl-field-label">Nome parlamentar</span>
                                    <p className="font-medium m-0">{parlamentar.parliamentaryName}</p>
                                </div>
                                <div className="sigl-filtro-campo">
                                    <span className="sigl-field-label">Status legislativo</span>
                                    <p className="font-medium m-0">{parlamentar.status}</p>
                                </div>
                                {parlamentar.officeNumber && (
                                    <div className="sigl-filtro-campo">
                                        <span className="sigl-field-label">Gabinete</span>
                                        <p className="font-medium m-0">{parlamentar.officeNumber}</p>
                                    </div>
                                )}
                                {parlamentar.user?.politicalParty && (
                                    <div className="sigl-filtro-campo">
                                        <span className="sigl-field-label">Partido</span>
                                        <p className="font-medium m-0">
                                            {parlamentar.user.politicalParty.acronym} —{' '}
                                            {parlamentar.user.politicalParty.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-user" aria-hidden />
                                Conta de acesso
                            </span>
                            {parlamentar.user ? (
                                <div className="parlamentar-vinculo-card ativo">
                                    <div className="flex align-items-start justify-content-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex align-items-center gap-2 flex-wrap mb-1">
                                                <strong className="text-sm font-semibold">
                                                    {userDisplayName(parlamentar)}
                                                </strong>
                                                <Tag
                                                    value={ACCESS_LABEL[accessStatus] ?? accessStatus}
                                                    severity={ACCESS_SEV[accessStatus] ?? 'secondary'}
                                                />
                                            </div>
                                            <p className="m-0 text-sm text-color-secondary">
                                                CPF: {formatCpf(parlamentar.user.cpf)}
                                            </p>
                                            <p className="m-0 text-sm text-color-secondary mt-1">
                                                {parlamentar.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-color-secondary m-0">
                                    Nenhum usuário vinculado — parlamentar sem acesso ao SIGL.
                                </p>
                            )}
                        </div>

                        <div className="sigl-dialog-secao">
                            <span className="sigl-dialog-secao-titulo">
                                <i className="pi pi-calendar" aria-hidden />
                                Mandatos
                            </span>
                            {mandatos.length === 0 ? (
                                <p className="text-color-secondary m-0">Nenhum mandato cadastrado.</p>
                            ) : (
                                <ul className="list-none p-0 m-0 flex flex-column gap-2">
                                    {mandatos.map((m) => (
                                        <li
                                            key={m.id}
                                            className="border-1 border-round p-3 surface-border"
                                        >
                                            <div className="flex align-items-center gap-2 mb-1 flex-wrap">
                                                <strong>
                                                    Legislatura {m.legislature.number}
                                                </strong>
                                                {m.legislature.isCurrent && (
                                                    <Tag value="Atual" severity="success" />
                                                )}
                                                <Tag value={m.status} severity="info" />
                                            </div>
                                            <span className="text-sm text-color-secondary">
                                                Início: {formatDatePt(m.startedAt)}
                                                {m.endedAt
                                                    ? ` · Fim: ${formatDatePt(m.endedAt)}`
                                                    : m.legislature.endDate
                                                      ? ` · Previsto: ${formatDatePt(m.legislature.endDate)}`
                                                      : ''}
                                            </span>
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
                    parlamentarianId={parlamentarianId}
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
