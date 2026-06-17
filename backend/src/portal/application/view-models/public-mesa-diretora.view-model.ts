import { BoardWithRelations } from '../../../legislativo/mesa-diretora/domain/repositories/board.repository';

export type PublicMesaMembroHttp = {
    id: string;
    cargo: string;
    parlamentar: {
        id: string;
        parliamentaryName: string;
        photoUrl?: string;
        partido?: {
            sigla: string;
            nome: string;
            flagUrl?: string;
        };
    };
};

export type PublicMesaDiretoraHttp = {
    id: string;
    name: string;
    legislaturaNumero: number;
    members: PublicMesaMembroHttp[];
};

export class PublicMesaDiretoraViewModel {
    static toHttp(data: BoardWithRelations): PublicMesaDiretoraHttp {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            name: p.name,
            legislaturaNumero: data.legislature.number,
            members: data.members.map((member) => {
                const party = member.parliamentarian.politicalParty;
                return {
                    id: member.id,
                    cargo: member.boardRole.name,
                    parlamentar: {
                        id: member.parliamentarian.id,
                        parliamentaryName: member.parliamentarian.parliamentaryName,
                        ...(member.parliamentarian.photoUrl
                            ? { photoUrl: member.parliamentarian.photoUrl }
                            : {}),
                        ...(party
                            ? {
                                  partido: {
                                      sigla: party.acronym,
                                      nome: party.name,
                                      ...(party.flagUrl
                                          ? { flagUrl: party.flagUrl }
                                          : {}),
                                  },
                              }
                            : {}),
                    },
                };
            }),
        };
    }
}
