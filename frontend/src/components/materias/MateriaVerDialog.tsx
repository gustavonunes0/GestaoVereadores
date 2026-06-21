import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Timeline } from 'primereact/timeline';
import { VerDialog } from '../common/VerDialog';
import { MateriaAutorAvatar } from './MateriaAutorAvatar';
import { MateriaStatusBadge } from './MateriaStatusBadge';
import { materiasApi } from '../../api/legislative/materias.api';
import type { Materia, TramitacaoItem } from '../../api/legislative/materias.api';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';
import {
    resolveMateriaAutores,
    resolveMateriaAutorPrincipal,
    resolveMateriaProtocoloLabel,
    resolveMateriaTextoOriginalUrl,
} from '../../utils/materiaDisplay';
import {
    formatarIdentificacaoCompleta,
} from '../../utils/materiaIdentificacao';
import { STATUS_MATERIA_LABELS } from '../../types/materias';

interface Props {
    materiaId: string;
    onClose: () => void;
    onEditar?: () => void;
}

function MetaItem({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="materia-detail-meta__item">
            <dt className="text-xs text-color-secondary">{label}</dt>
            <dd className="font-medium m-0">{value}</dd>
        </div>
    );
}

function EmentaTruncavel({ texto }: { texto: string }) {
    const [expandida, setExpandida] = useState(false);
    const [temOverflow, setTemOverflow] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setTemOverflow(el.scrollHeight > el.clientHeight + 2);
    }, [texto]);

    return (
        <div>
            <p
                ref={ref}
                className="m-0"
                style={{
                    display: '-webkit-box',
                    WebkitLineClamp: expandida ? undefined : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: expandida ? 'visible' : 'hidden',
                }}
            >
                {texto}
            </p>
            {(temOverflow || expandida) && (
                <Button
                    label={expandida ? 'Ver menos' : 'Ver mais'}
                    link
                    size="small"
                    className="p-0 mt-1"
                    onClick={() => setExpandida((v) => !v)}
                />
            )}
        </div>
    );
}

export function MateriaVerDialog({ materiaId, onClose, onEditar }: Props) {
    const { showApiError } = useAppToast();
    const [materia, setMateria] = useState<Materia | null>(null);
    const [loading, setLoading] = useState(true);
    const [historicoExpandido, setHistoricoExpandido] = useState(false);

    useEffect(() => {
        setLoading(true);
        materiasApi
            .getById(materiaId)
            .then(setMateria)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [materiaId, showApiError]);

    const resolvedStatus = materia
        ? typeof materia.status === 'string' ? materia.status : materia.status.value
        : '';

    const autorPrincipal = materia ? resolveMateriaAutorPrincipal(materia) : null;
    const autores = materia ? resolveMateriaAutores(materia) : [];
    const protocoloLabel = materia ? resolveMateriaProtocoloLabel(materia) : null;

    const tramitacaoLegado = materia?.tramitacaoHistorico ?? [];
    const tramitacaoWorkflow = (materia?.workflow?.tramitacao ?? []).map((item, i) => ({
        id: `w-${i}`,
        data: item.em ?? '',
        statusAnterior: undefined,
        statusNovo: (item.status ?? '') as import('../../types/legislative').MateriaStatus,
        descricao: item.observacao,
    }));
    const tramitacao: TramitacaoItem[] =
        tramitacaoLegado.length > 0 ? tramitacaoLegado : tramitacaoWorkflow;

    const ultimaTramitacao = tramitacao[tramitacao.length - 1];

    const identificacaoCompleta = materia
        ? formatarIdentificacaoCompleta({
              tipo: materia.tipo,
              sigla: materia.sigla,
              numero: materia.numero,
              ano: materia.ano,
          })
        : '';

    const title = materia ? identificacaoCompleta : 'Detalhes da Matéria';

    const timelineContent = (item: TramitacaoItem) => {
        const labelStatus =
            STATUS_MATERIA_LABELS[item.statusNovo as keyof typeof STATUS_MATERIA_LABELS] ??
            String(item.statusNovo);
        return (
            <div className="materia-detail-timeline__entry">
                <div className="materia-detail-timeline__header">
                    <span className="materia-detail-timeline__status">{labelStatus}</span>
                    <span className="materia-detail-timeline__date">{formatDatePt(item.data)}</span>
                </div>
                {item.descricao ? (
                    <p className="materia-detail-timeline__note">{item.descricao}</p>
                ) : null}
                {item.responsavel ? (
                    <p className="materia-detail-timeline__note">Responsável: {item.responsavel}</p>
                ) : null}
            </div>
        );
    };

    return (
        <VerDialog
            visible
            title={title}
            onClose={onClose}
            width="min(92vw, 52rem)"
            contentClassName="materia-ver-dialog"
        >
            {loading && <p className="text-color-secondary m-0">Carregando…</p>}

            {materia && !loading && (
                <div className="materia-detail">
                    {/* Header: identificação + badge */}
                    <header className="flex align-items-center justify-content-between gap-2 mb-3">
                        <div className="flex align-items-center gap-2">
                            {autorPrincipal && (
                                <MateriaAutorAvatar autor={autorPrincipal} />
                            )}
                            {autorPrincipal && (
                                <span className="font-medium">{autorPrincipal.nome}</span>
                            )}
                        </div>
                        <MateriaStatusBadge status={resolvedStatus} />
                    </header>

                    {/* Metadados */}
                    <dl className="materia-detail-meta flex flex-column gap-2 mb-3">
                        <MetaItem label="Data do protocolo" value={formatDatePt(materia.dataProtocolo)} />
                        <MetaItem label="Protocolo" value={protocoloLabel} />
                        <MetaItem label="Unidade" value={materia.unidadeTramitacao?.nome} />
                        <MetaItem label="Situação" value={materia.statusTramitacao?.nome} />
                    </dl>

                    <Divider className="my-2" />

                    {/* Ementa */}
                    <section aria-label="Ementa" className="mb-3">
                        <p className="section-label text-xs text-color-secondary mb-1">Ementa</p>
                        <EmentaTruncavel texto={materia.ementa} />
                    </section>

                    <Divider className="my-2" />

                    {/* Autoria */}
                    {autores.length > 0 && (
                        <section aria-label="Autores" className="mb-3">
                            <p className="section-label text-xs text-color-secondary mb-1">
                                Autoria ({autores.length})
                            </p>
                            <ul className="list-none p-0 m-0 flex flex-column gap-1">
                                {autores.map((autor) => (
                                    <li key={autor.id} className="flex align-items-center gap-2">
                                        <MateriaAutorAvatar autor={autor} size="normal" />
                                        <span className="font-medium text-sm">{autor.nome}</span>
                                        {autor.subtitulo && (
                                            <span className="text-color-secondary text-xs">{autor.subtitulo}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Última tramitação */}
                    {ultimaTramitacao && (
                        <section className="mb-3">
                            <p className="section-label text-xs text-color-secondary mb-1">Última tramitação</p>
                            <p className="m-0 text-sm">
                                {formatDatePt(ultimaTramitacao.data)} ·{' '}
                                {STATUS_MATERIA_LABELS[ultimaTramitacao.statusNovo as keyof typeof STATUS_MATERIA_LABELS] ??
                                    String(ultimaTramitacao.statusNovo)}
                            </p>
                        </section>
                    )}

                    {/* Histórico colapsável */}
                    {tramitacao.length > 0 && (
                        <section className="mb-3">
                            <Button
                                label={historicoExpandido ? 'Ocultar histórico ▴' : 'Ver histórico completo ▾'}
                                link
                                size="small"
                                className="p-0"
                                onClick={() => setHistoricoExpandido((v) => !v)}
                            />
                            {historicoExpandido && (
                                <Timeline
                                    value={tramitacao}
                                    content={timelineContent}
                                    className="materia-detail-timeline mt-2"
                                />
                            )}
                        </section>
                    )}

                    <Divider className="my-2" />

                    {/* Ações */}
                    <div className="flex gap-2 flex-wrap">
                        {materia.textoOriginalUrl && (
                            <Button
                                label="Baixar texto"
                                icon="pi pi-download"
                                severity="secondary"
                                outlined
                                size="small"
                                onClick={() =>
                                    window.open(
                                        resolveMateriaTextoOriginalUrl(materia.textoOriginalUrl!),
                                        '_blank',
                                        'noopener,noreferrer',
                                    )
                                }
                            />
                        )}
                        {onEditar && (
                            <Button
                                label="Editar"
                                icon="pi pi-pencil"
                                size="small"
                                onClick={onEditar}
                            />
                        )}
                    </div>
                </div>
            )}
        </VerDialog>
    );
}
