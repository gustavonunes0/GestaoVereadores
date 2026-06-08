import { MatterTramitationContext } from './matter-tramitation-context';

/**
 * Porta de integração matéria ↔ parecer de comissão.
 * MVP usa implementação permissiva; versão futura pode consultar CommitteeOpinionRepository.
 */
export abstract class MatterCommitteeOpinionGate {
    abstract assertTramitationAllowed(
        context: MatterTramitationContext,
    ): Promise<void>;
}
