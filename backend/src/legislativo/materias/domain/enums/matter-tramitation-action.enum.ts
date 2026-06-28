export enum MatterTramitationAction {
    PROTOCOLAR = 'PROTOCOLAR',
    INICIAR_TRAMITACAO = 'INICIAR_TRAMITACAO',
    COLOCAR_EM_PAUTA = 'COLOCAR_EM_PAUTA',
    INICIAR_VOTACAO = 'INICIAR_VOTACAO',
    RETIRAR_DA_PAUTA = 'RETIRAR_DA_PAUTA',
    APROVAR = 'APROVAR',
    REJEITAR = 'REJEITAR',
    ARQUIVAR = 'ARQUIVAR',
    RETIRAR = 'RETIRAR',
    REINICIAR_TRAMITACAO = 'REINICIAR_TRAMITACAO',
    TRANSFORMAR_EM_NORMA = 'TRANSFORMAR_EM_NORMA',
}

export const MATTER_TRAMITATION_ACTION_LABELS: Record<
    MatterTramitationAction,
    string
> = {
    [MatterTramitationAction.PROTOCOLAR]: 'Protocolar',
    [MatterTramitationAction.INICIAR_TRAMITACAO]: 'Iniciar tramitação',
    [MatterTramitationAction.COLOCAR_EM_PAUTA]: 'Colocar em pauta',
    [MatterTramitationAction.INICIAR_VOTACAO]: 'Iniciar votação',
    [MatterTramitationAction.RETIRAR_DA_PAUTA]: 'Retirar da pauta',
    [MatterTramitationAction.APROVAR]: 'Aprovar',
    [MatterTramitationAction.REJEITAR]: 'Rejeitar',
    [MatterTramitationAction.ARQUIVAR]: 'Arquivar',
    [MatterTramitationAction.RETIRAR]: 'Retirar',
    [MatterTramitationAction.REINICIAR_TRAMITACAO]: 'Reiniciar tramitação',
    [MatterTramitationAction.TRANSFORMAR_EM_NORMA]: 'Transformar em norma',
};
