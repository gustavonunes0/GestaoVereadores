import PersonOutlined from '@mui/icons-material/PersonOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import type { Materia } from '../../api/legislative/materias.api';
import { formatDatePt } from '../../utils/formatDate';
import {
    resolveMateriaAutores,
    resolveMateriaAutorPrincipal,
    resolveMateriaProtocoloLabel,
    resolveMateriaStatus,
    type MateriaAutorResumo,
} from '../../utils/materiaDisplay';
import {
    getMateriaStripeColor,
    resolveMateriaCardTitulo,
    resolveMateriaTipoSigla,
} from '../../utils/materiaCardDisplay';
import { MateriaStatusPill } from './MateriaStatusPill';

interface Props {
    materia: Materia;
    canEdit?: boolean;
    canDelete?: boolean;
    onVer?: () => void;
    onEditar?: () => void;
    onDeletar?: () => void;
}

function AuthorAvatar({
    nome,
    fotoUrl,
    className = '',
}: {
    nome: string;
    fotoUrl?: string | null;
    className?: string;
}) {
    const initial = nome.charAt(0).toUpperCase();

    if (fotoUrl) {
        return (
            <img
                src={fotoUrl}
                alt={nome}
                className={`w-6 h-6 rounded-full border-2 border-white object-cover flex-shrink-0 ${className}`}
            />
        );
    }

    return (
        <span
            className={`w-6 h-6 rounded-full bg-[#2563a8] border-2 border-white text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${className}`}
        >
            {initial}
        </span>
    );
}

function AuthorAvatarGroup({ autores }: { autores: MateriaAutorResumo[] }) {
    if (autores.length === 0) {
        return <span className="text-[12px] text-[#9aa3b2]">—</span>;
    }

    const visiveis = autores.slice(0, 3);
    const restantes = autores.length - visiveis.length;

    return (
        <div
            className="flex items-center"
            title={autores.map((a) => a.nome).join(', ')}
        >
            {visiveis.map((autor, index) => (
                <AuthorAvatar
                    key={autor.id}
                    nome={autor.nome}
                    fotoUrl={autor.photoUrl}
                    className={index > 0 ? '-ml-2' : ''}
                />
            ))}
            {restantes > 0 ? (
                <span className="-ml-2 w-6 h-6 rounded-full bg-[#e8edf5] border-2 border-white text-[#1c3557] text-[9px] font-bold flex items-center justify-center">
                    +{restantes}
                </span>
            ) : null}
        </div>
    );
}

function AuthorPhotoBox({ autor }: { autor: MateriaAutorResumo | null }) {
    if (!autor) {
        return (
            <div
                className="w-11 h-11 rounded-[9px] bg-[#e8edf5] flex items-center justify-center text-[#b0bac8]"
                aria-hidden
            >
                <PersonOutlined sx={{ fontSize: 22 }} />
            </div>
        );
    }

    if (autor.photoUrl) {
        return (
            <img
                src={autor.photoUrl}
                alt={autor.nome}
                className="w-11 h-11 rounded-[9px] object-cover bg-[#e8edf5]"
            />
        );
    }

    const initial = autor.nome.charAt(0).toUpperCase();
    return (
        <div className="w-11 h-11 rounded-[9px] bg-[#e8edf5] flex items-center justify-center overflow-hidden">
            {autor.tipo === 'externo' ? (
                <PersonOutlined sx={{ fontSize: 22, color: '#1c3557' }} aria-hidden />
            ) : (
                <span className="text-[18px] font-bold text-[#1c3557] leading-none">
                    {initial}
                </span>
            )}
        </div>
    );
}

export function MateriaListCard({
    materia,
    canEdit = false,
    canDelete = false,
    onVer,
    onEditar,
    onDeletar,
}: Props) {
    const tipoSigla = resolveMateriaTipoSigla(materia.sigla, materia.tipo);
    const cardTitulo = resolveMateriaCardTitulo(materia);
    const autorPrincipal = resolveMateriaAutorPrincipal(materia);
    const autores = resolveMateriaAutores(materia);
    const protocoloLabel = resolveMateriaProtocoloLabel(materia);
    const dataExibicao = formatDatePt(materia.dataProtocolo);
    const ultimaTramitacao = materia.ultimaTramitacao?.data
        ? formatDatePt(materia.ultimaTramitacao.data)
        : '—';
    const status = resolveMateriaStatus(materia.status);

    return (
        <article
            className="flex gap-4 p-4 bg-white border border-[#e2e5eb] rounded-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow"
            aria-label={cardTitulo}
        >
            <div
                className="w-1 rounded-full flex-shrink-0 self-stretch"
                style={{ background: getMateriaStripeColor(tipoSigla) }}
                aria-hidden
            />

            <div className="flex flex-col items-center gap-1.5 w-14 flex-shrink-0">
                <AuthorPhotoBox autor={autorPrincipal} />
                <span className="text-[9px] font-semibold text-[#374151] text-center leading-tight line-clamp-2">
                    {autorPrincipal?.nome ?? 'Sem autor'}
                </span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[14.5px] font-semibold text-[#1c2f4a] leading-snug m-0">
                        {cardTitulo}
                    </h3>
                    <div className="flex gap-0.5 flex-shrink-0">
                        {onVer ? (
                            <button
                                type="button"
                                onClick={onVer}
                                className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f0f4fa] hover:text-[#2563a8] transition-colors"
                                aria-label="Ver matéria"
                            >
                                <VisibilityOutlined sx={{ fontSize: 17 }} aria-hidden />
                            </button>
                        ) : null}
                        {canEdit && onEditar ? (
                            <button
                                type="button"
                                onClick={onEditar}
                                className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-[#f0f4fa] hover:text-[#2563a8] transition-colors"
                                aria-label="Editar matéria"
                            >
                                <EditOutlined sx={{ fontSize: 17 }} aria-hidden />
                            </button>
                        ) : null}
                        {canDelete && onDeletar ? (
                            <button
                                type="button"
                                onClick={onDeletar}
                                className="w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-[#8492a6] hover:bg-red-50 hover:text-red-600 transition-colors"
                                aria-label="Excluir matéria"
                            >
                                <DeleteOutlined sx={{ fontSize: 17 }} aria-hidden />
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {protocoloLabel ? (
                        <span className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#e8edf5] text-[#1c3557]">
                            Prot. {protocoloLabel}
                        </span>
                    ) : null}
                    {tipoSigla !== 'MAT' ? (
                        <span className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#f0f2f7] text-[#4b5563]">
                            {tipoSigla}
                        </span>
                    ) : null}
                    {dataExibicao !== '—' ? (
                        <span className="flex items-center gap-1 text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#f0f2f7] text-[#4b5563]">
                            <CalendarMonthOutlined sx={{ fontSize: 12 }} aria-hidden />
                            {dataExibicao}
                        </span>
                    ) : null}
                    <MateriaStatusPill status={status} />
                    {materia.unidadeTramitacao?.nome ? (
                        <span className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#f0f2f7] text-[#4b5563]">
                            {materia.unidadeTramitacao.nome}
                        </span>
                    ) : null}
                    {materia.statusTramitacao?.nome ? (
                        <span className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px] bg-[#eef2ff] text-[#4338ca]">
                            {materia.statusTramitacao.nome}
                        </span>
                    ) : null}
                </div>

                <p className="text-[12.5px] text-[#6b7280] leading-relaxed line-clamp-2 m-0">
                    {materia.ementa}
                </p>

                <div className="border-t border-[#f0f2f5] my-1" />

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">
                            Autoria
                        </span>
                        {autorPrincipal ? (
                            <span className="text-[12px] text-[#374151] font-medium truncate">
                                {autorPrincipal.nome}
                                {autorPrincipal.subtitulo
                                    ? ` · ${autorPrincipal.subtitulo}`
                                    : ''}
                            </span>
                        ) : (
                            <span className="text-[12px] text-[#9aa3b2]">—</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">
                            Última tramitação
                        </span>
                        <span className="text-[12px] text-[#374151] font-medium">
                            {ultimaTramitacao}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[9.5px] font-semibold text-[#9aa3b2] uppercase tracking-wide">
                            Autor(es)
                        </span>
                        <AuthorAvatarGroup autores={autores} />
                    </div>
                </div>
            </div>
        </article>
    );
}
