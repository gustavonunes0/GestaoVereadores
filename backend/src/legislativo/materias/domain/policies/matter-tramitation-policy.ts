import { MatterTramitationContext } from '../contracts/matter-tramitation-context';

/**
 * Política de tramitação no MVP — parecer de comissão é opcional e nunca bloqueia.
 * Ponto de extensão: substituir chamadas por MatterCommitteeOpinionGate injetável.
 */
export function assertTramitationNotBlockedByMissingOpinion(
    _context: MatterTramitationContext = {},
): void {
    // MVP: ausência de parecer não impede pauta, mudança de status ou demais fluxos.
}

export class MatterTramitationPolicy {
    assertTramitationAllowed(context: MatterTramitationContext = {}): void {
        assertTramitationNotBlockedByMissingOpinion(context);
    }
}
