/**
 * Política de pareceres no MVP: opcional e nunca bloqueante.
 */
export class CommitteeOpinionPolicy {
    /** Parecer formal não é pré-requisito para composição ou tramitação no MVP. */
    isRequiredForMatterTramitation(): boolean {
        return false;
    }

    /** Parecer ausente não impede ações sobre a comissão ou a matéria. */
    shouldBlockTramitationWhenMissing(): boolean {
        return false;
    }
}
