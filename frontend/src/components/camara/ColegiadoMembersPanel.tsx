import { MesaComposicaoTable } from '../mesa-diretora/MesaComposicaoTable';
import type { BoardMember } from '../../api/legislative/mesa-diretora.api';

export type MembroLinha = {
    id: string;
    parliamentarian?: {
        id?: string;
        parliamentaryName?: string;
        photoUrl?: string | null;
        politicalParty?: BoardMember['parliamentarian']['politicalParty'];
    };
    boardRole?: { id?: string; name: string };
};

type Props = {
    entityLabel: string;
    membros: MembroLinha[] | BoardMember[];
    boardId: string;
    onChanged: () => void;
};

/** Encaminha para MesaComposicaoTable (layout padrão da mesa). */
export function ColegiadoMembersPanel({
    entityLabel,
    membros,
    boardId,
    onChanged,
}: Props) {
    return (
        <MesaComposicaoTable
            entityLabel={entityLabel}
            membros={membros as BoardMember[]}
            boardId={boardId}
            onChanged={onChanged}
        />
    );
}
