import { Timeline } from 'primereact/timeline';
import { VerDialog } from '../common/VerDialog';
import { MateriaStatusBadge } from './MateriaStatusBadge';
import type { Materia, TramitacaoItem } from '../../api/legislative/materias.api';
import { MATERIA_STATUS } from '../../types/legislative';
import { formatDatePt } from '../../utils/formatDate';

interface Props {
    materia: Materia;
    onClose: () => void;
}

function nomeAutor(materia: Materia): string {
    if (materia.autor) return materia.autor.nome;
    return '—';
}

export function MateriaVerDialog({ materia, onClose }: Props) {
    const tramitacao = materia.tramitacaoHistorico ?? [];

    const timelineContent = (item: TramitacaoItem) => (
        <div className="mb-2">
            <div className="flex align-items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                    {MATERIA_STATUS[item.statusNovo] ?? item.statusNovo}
                </span>
                <span className="text-color-secondary text-xs">
                    {formatDatePt(item.data)}
                </span>
            </div>
            {item.descricao && (
                <p className="text-sm m-0 text-color-secondary">{item.descricao}</p>
            )}
            {item.responsavel && (
                <p className="text-xs m-0 text-color-secondary">
                    Responsável: {item.responsavel}
                </p>
            )}
        </div>
    );

    const timelineOpposite = (item: TramitacaoItem) =>
        item.statusAnterior ? (
            <span className="text-xs text-color-secondary">
                {MATERIA_STATUS[item.statusAnterior] ?? item.statusAnterior}
            </span>
        ) : null;

    return (
        <VerDialog
            visible
            title={materia.identificacao}
            onClose={onClose}
        >
            <div className="grid">
                <div className="col-12 md:col-6">
                    <p className="text-xs text-color-secondary mb-1">Identificação</p>
                    <p className="font-semibold">{materia.identificacao}</p>
                </div>
                <div className="col-12 md:col-6">
                    <p className="text-xs text-color-secondary mb-1">Status</p>
                    <MateriaStatusBadge status={materia.status} />
                </div>
                <div className="col-12">
                    <p className="text-xs text-color-secondary mb-1">Ementa</p>
                    <p className="m-0">{materia.ementa}</p>
                </div>

                <div className="col-12 md:col-4">
                    <p className="text-xs text-color-secondary mb-1">Data Protocolo</p>
                    <p className="m-0">{formatDatePt(materia.dataProtocolo)}</p>
                </div>
                <div className="col-12 md:col-4">
                    <p className="text-xs text-color-secondary mb-1">Autor</p>
                    <p className="m-0">{nomeAutor(materia)}</p>
                </div>
                {materia.autoresAdicionais && materia.autoresAdicionais.length > 0 && (
                    <div className="col-12 md:col-4">
                        <p className="text-xs text-color-secondary mb-1">Coautores</p>
                        <p className="m-0">
                            {materia.autoresAdicionais.map((a) => a.nome).join(', ')}
                        </p>
                    </div>
                )}
                {materia.relatores && materia.relatores.length > 0 && (
                    <div className="col-12 md:col-4">
                        <p className="text-xs text-color-secondary mb-1">Relator(es)</p>
                        <p className="m-0">
                            {materia.relatores.map((r) => r.nome).join(', ')}
                        </p>
                    </div>
                )}
                {materia.textoOriginalUrl && (
                    <div className="col-12">
                        <p className="text-xs text-color-secondary mb-1">Texto Original</p>
                        <a
                            href={materia.textoOriginalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Abrir texto original da matéria"
                        >
                            Abrir PDF / Documento
                        </a>
                    </div>
                )}

                {tramitacao.length > 0 && (
                    <div className="col-12">
                        <p className="text-xs text-color-secondary mb-2 mt-3 font-semibold">
                            Histórico de Tramitação
                        </p>
                        <Timeline
                            value={tramitacao}
                            content={timelineContent}
                            opposite={timelineOpposite}
                        />
                    </div>
                )}
            </div>
        </VerDialog>
    );
}
