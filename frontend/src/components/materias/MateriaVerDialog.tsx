import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { VerDialog } from '../common/VerDialog';
import { MateriaAutorAvatar } from './MateriaAutorAvatar';
import { MateriaStatusBadge } from './MateriaStatusBadge';
import { materiasApi } from '../../api/legislative/materias.api';
import type { Materia, TramitacaoItem } from '../../api/legislative/materias.api';
import { MATERIA_STATUS, type MateriaStatus } from '../../types/legislative';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';
import {
    resolveMateriaAutores,
    resolveMateriaAutorPrincipal,
    resolveMateriaProtocoloLabel,
    resolveMateriaStatus,
    resolveMateriaTextoOriginalUrl,
    resolveMateriaTitulo,
} from '../../utils/materiaDisplay';

interface Props {
    materiaId: string;
    onClose: () => void;
}

function MetaItem({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="materia-detail-meta__item">
            <dt>{label}</dt>
            <dd>{value}</dd>
        </div>
    );
}

export function MateriaVerDialog({ materiaId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [materia, setMateria] = useState<Materia | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        materiasApi
            .getById(materiaId)
            .then(setMateria)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [materiaId, showApiError]);

    const tramitacaoLegado = materia?.tramitacaoHistorico ?? [];
    const tramitacaoWorkflow = (materia?.workflow?.tramitacao ?? []).map((item, index) => ({
        id: `workflow-${index}`,
        data: item.em ?? '',
        statusNovo: (item.status ?? resolveMateriaStatus(materia!.status)) as MateriaStatus,
        descricao: item.observacao,
    }));
    const tramitacao =
        tramitacaoLegado.length > 0 ? tramitacaoLegado : tramitacaoWorkflow;
    const autorPrincipal = materia ? resolveMateriaAutorPrincipal(materia) : null;
    const autores = materia ? resolveMateriaAutores(materia) : [];
    const protocoloLabel = materia ? resolveMateriaProtocoloLabel(materia) : null;

    const timelineContent = (item: TramitacaoItem) => (
        <div className="materia-detail-timeline__entry">
            <div className="materia-detail-timeline__header">
                <span className="materia-detail-timeline__status">
                    {MATERIA_STATUS[item.statusNovo] ?? item.statusNovo}
                </span>
                <span className="materia-detail-timeline__date">
                    {formatDatePt(item.data)}
                </span>
            </div>
            {item.descricao ? (
                <p className="materia-detail-timeline__note">{item.descricao}</p>
            ) : null}
            {item.responsavel ? (
                <p className="materia-detail-timeline__note">
                    Responsável: {item.responsavel}
                </p>
            ) : null}
        </div>
    );

    const timelineOpposite = (item: TramitacaoItem) =>
        item.statusAnterior ? (
            <span className="materia-detail-timeline__previous">
                {MATERIA_STATUS[item.statusAnterior] ?? item.statusAnterior}
            </span>
        ) : null;

    return (
        <VerDialog
            visible
            title="Detalhes da matéria"
            onClose={onClose}
            width="min(92vw, 52rem)"
            contentClassName="materia-ver-dialog"
        >
            {loading && (
                <p className="text-color-secondary m-0">Carregando…</p>
            )}

            {materia && !loading && (
                <div className="materia-detail">
                    <header className="materia-detail__hero">
                        <div className="materia-detail__author">
                            {autorPrincipal ? (
                                <>
                                    <div className="materia-detail__avatar" aria-hidden>
                                        <MateriaAutorAvatar autor={autorPrincipal} />
                                    </div>
                                    <div className="materia-detail__author-text">
                                        <p className="materia-detail__author-name">
                                            {autorPrincipal.nome}
                                        </p>
                                        {autorPrincipal.subtitulo ? (
                                            <p className="materia-detail__author-subtitle">
                                                {autorPrincipal.subtitulo}
                                            </p>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <p className="materia-detail__author-name">Sem autor informado</p>
                            )}
                        </div>
                        <MateriaStatusBadge status={resolveMateriaStatus(materia.status)} />
                    </header>

                    <h2 className="materia-detail__title">{resolveMateriaTitulo(materia)}</h2>

                    <dl className="materia-detail-meta">
                        <MetaItem
                            label="Data do protocolo"
                            value={formatDatePt(materia.dataProtocolo)}
                        />
                        <MetaItem label="Protocolo" value={protocoloLabel} />
                        <MetaItem
                            label="Unidade"
                            value={materia.unidadeTramitacao?.nome}
                        />
                        <MetaItem
                            label="Situação"
                            value={materia.statusTramitacao?.nome}
                        />
                    </dl>

                    <section className="materia-detail__ementa" aria-label="Ementa">
                        <p className="section-label">Ementa</p>
                        <p className="materia-detail__ementa-text">{materia.ementa}</p>
                    </section>

                    <div className="materia-detail__panels">
                        <section className="materia-detail-panel">
                            <p className="section-label">Status</p>
                            <MateriaStatusBadge status={resolveMateriaStatus(materia.status)} />
                        </section>
                        <section className="materia-detail-panel">
                            <p className="section-label">Última tramitação</p>
                            <p className="materia-detail-panel__value">
                                {materia.ultimaTramitacao?.data
                                    ? formatDatePt(materia.ultimaTramitacao.data)
                                    : '—'}
                            </p>
                            {materia.ultimaTramitacao?.observacao ? (
                                <p className="materia-detail-panel__hint">
                                    {materia.ultimaTramitacao.observacao}
                                </p>
                            ) : null}
                        </section>
                        <section className="materia-detail-panel">
                            <p className="section-label">Comprovante</p>
                            {materia.textoOriginalUrl ? (
                                <Button
                                    label="Ver documento"
                                    icon="pi pi-file-pdf"
                                    severity="secondary"
                                    outlined
                                    size="small"
                                    onClick={() =>
                                        window.open(
                                            resolveMateriaTextoOriginalUrl(
                                                materia.textoOriginalUrl!,
                                            ),
                                            '_blank',
                                            'noopener,noreferrer',
                                        )
                                    }
                                />
                            ) : (
                                <p className="materia-detail-panel__hint m-0">
                                    Nenhum arquivo anexado
                                </p>
                            )}
                        </section>
                    </div>

                    {autores.length > 0 && (
                        <section className="materia-detail__authors" aria-label="Autores">
                            <p className="section-label">
                                {autores.length} Autor(es)
                            </p>
                            <ul className="materia-detail-authors">
                                {autores.map((autor) => (
                                    <li key={autor.id} className="materia-detail-authors__item">
                                        <MateriaAutorAvatar autor={autor} size="normal" />
                                        <span className="materia-detail-authors__name">
                                            {autor.nome}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {materia.relatores && materia.relatores.length > 0 && (
                        <section className="materia-detail__relatores">
                            <p className="section-label">Relator(es)</p>
                            <p className="materia-detail-panel__value m-0">
                                {materia.relatores.map((r) => r.nome).join(', ')}
                            </p>
                        </section>
                    )}

                    {tramitacao.length > 0 && (
                        <>
                            <Divider />
                            <section aria-label="Histórico de tramitação">
                                <p className="section-label">Histórico de tramitação</p>
                                <Timeline
                                    value={tramitacao}
                                    content={timelineContent}
                                    opposite={timelineOpposite}
                                    className="materia-detail-timeline"
                                />
                            </section>
                        </>
                    )}
                </div>
            )}
        </VerDialog>
    );
}
