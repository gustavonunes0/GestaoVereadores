export enum SessionLifecycleAction {
    INICIAR = 'INICIAR',
    ENCERRAR = 'ENCERRAR',
    CANCELAR = 'CANCELAR',
}

export const SESSION_LIFECYCLE_ACTION_LABELS: Record<
    SessionLifecycleAction,
    string
> = {
    [SessionLifecycleAction.INICIAR]: 'Iniciar sessão',
    [SessionLifecycleAction.ENCERRAR]: 'Encerrar sessão',
    [SessionLifecycleAction.CANCELAR]: 'Cancelar sessão',
};
