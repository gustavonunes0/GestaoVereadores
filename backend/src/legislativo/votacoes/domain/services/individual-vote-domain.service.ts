import { Voto } from '@prisma/client';

/**
 * Regras de voto individual parlamentar (task 26).
 */
export class IndividualVoteDomainService {
    assertNoDuplicateVote(alreadyRegistered: boolean) {
        if (alreadyRegistered) {
            throw new Error(
                'Parlamentar já registrou voto nesta votação',
            );
        }
    }

    assertPresenceWhenRequired(
        exigePresenca: boolean,
        estaPresente: boolean,
    ) {
        if (exigePresenca && !estaPresente) {
            throw new Error(
                'Somente parlamentares presentes podem registrar voto',
            );
        }
    }

    isPresentForVoting(
        presenca: { presente: boolean; situacao: string } | null,
        countsForQuorum: (situacao: string, presente: boolean) => boolean,
    ): boolean {
        if (!presenca) return false;
        return countsForQuorum(presenca.situacao, presenca.presente);
    }

    normalizeVoteValue(voto: Voto): Voto {
        return voto;
    }
}
