import {
    MATTER_AUTHOR_TYPE_LABELS,
    MatterAuthorType,
} from '../../domain/enums/matter-author-type.enum';
import { MateriaPrismaPayload } from './matter.view-model';

type UserNameParts = { firstName?: string | null; lastName?: string | null };

function formatLinkedUserName(user?: UserNameParts | null): string | null {
    if (!user) return null;
    const nome = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return nome || null;
}

type ParliamentarianAuthorshipSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    parliamentarianUser?: {
        politicalParty?: { id: string; name: string; acronym: string } | null;
    } | null;
};

function mapParliamentarian(
    row: ParliamentarianAuthorshipSummary | null | undefined,
) {
    if (!row) return null;
    const politicalParty = row.parliamentarianUser?.politicalParty ?? null;
    return {
        id: row.id,
        parliamentaryName: row.parliamentaryName,
        officeNumber: row.officeNumber,
        ...(politicalParty ? { politicalParty } : {}),
    };
}

export type MatterAuthorshipPayload = Omit<
    MateriaPrismaPayload,
    'matterCoauthors'
> & {
    authorParliamentarian?: ParliamentarianAuthorshipSummary | null;
    rapporteurParliamentarian?: ParliamentarianAuthorshipSummary | null;
    matterCoauthors?: Array<{
        id: string;
        ordem: number;
        parliamentarian?: ParliamentarianAuthorshipSummary | null;
        tenantPartner?: {
            id: string;
            nome: string;
            tipoAutorId: string;
            tenantPartnerUser?: {
                user?: UserNameParts | null;
            } | null;
        } | null;
    }>;
    autor?: {
        id: string;
        nome: string;
        tenantPartner?: {
            id: string;
            nome: string;
            tipoAutorId: string;
        } | null;
        parliamentarian?: ParliamentarianAuthorshipSummary | null;
    } | null;
};

function buildTenantPartnerAuthor(
    autor: NonNullable<MatterAuthorshipPayload['autor']>,
) {
    if (autor.tenantPartner) {
        return {
            type: MatterAuthorType.TENANT_PARTNER,
            label: MATTER_AUTHOR_TYPE_LABELS[MatterAuthorType.TENANT_PARTNER],
            autorId: autor.id,
            tenantPartner: {
                id: autor.tenantPartner.id,
                nome: autor.tenantPartner.nome,
                tipoAutorId: autor.tenantPartner.tipoAutorId,
            },
        };
    }

    return null;
}

export class MatterAuthorshipViewModel {
    static toHttp(data: MatterAuthorshipPayload) {
        const parliamentaryAuthor = mapParliamentarian(
            data.authorParliamentarian,
        );
        const tenantPartnerAuthor = data.autor
            ? buildTenantPartnerAuthor(data.autor)
            : null;

        const primaryAuthor = parliamentaryAuthor
            ? {
                  type: MatterAuthorType.PARLIAMENTARIAN,
                  label: MATTER_AUTHOR_TYPE_LABELS[
                      MatterAuthorType.PARLIAMENTARIAN
                  ],
                  parliamentarian: parliamentaryAuthor,
              }
            : tenantPartnerAuthor;

        return {
            matterId: data.id,
            primaryAuthor,
            coauthors: (data.matterCoauthors ?? [])
                .sort((a, b) => a.ordem - b.ordem)
                .map((item) => {
                    const parliamentarian = mapParliamentarian(
                        item.parliamentarian,
                    );
                    if (parliamentarian) {
                        return {
                            id: item.id,
                            ordem: item.ordem,
                            type: MatterAuthorType.PARLIAMENTARIAN,
                            parliamentarian,
                        };
                    }
                    const partner = item.tenantPartner;
                    if (partner) {
                        return {
                            id: item.id,
                            ordem: item.ordem,
                            type: MatterAuthorType.TENANT_PARTNER,
                            tenantPartner: {
                                id: partner.id,
                                nome: partner.nome,
                                tipoAutorId: partner.tipoAutorId,
                            },
                            label:
                                formatLinkedUserName(
                                    partner.tenantPartnerUser?.user,
                                ) ?? partner.nome,
                        };
                    }
                    return {
                        id: item.id,
                        ordem: item.ordem,
                        type: MatterAuthorType.TENANT_PARTNER,
                        label: 'Coautor',
                    };
                }),
            rapporteur: mapParliamentarian(data.rapporteurParliamentarian),
            legacy: {
                autorId: data.autorId,
                primeiroAutorId: data.primeiroAutorId ?? null,
                relatorId: data.relatorId,
            },
        };
    }
}
