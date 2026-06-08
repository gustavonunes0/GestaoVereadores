import { Inject, Injectable } from '@nestjs/common';
import {
    SESSION_LIFECYCLE_ACTION_LABELS,
    SessionLifecycleAction,
} from '../../domain/enums/session-lifecycle-action.enum';
import {
    SESSION_STATUS_LABELS,
    SessionStatus,
} from '../../domain/enums/session-status.enum';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { PlenarySessionDomainService } from '../../domain/services/plenary-session-domain.service';
import { SessionLifecycleDomainService } from '../../domain/services/session-lifecycle-domain.service';
import { resolveSessionStatus } from '../../domain/services/sessao-workflow';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { ExecutarCicloVidaSessaoDto } from '../dto/session-lifecycle.dto';
import {
    SessaoLifecycleActionNotAllowedError,
    SessaoPlenariaNotFoundError,
} from '../errors/sessao.errors';
import {
    SessaoPlenariaPrismaPayload,
    SessaoPlenariaViewModel,
} from '../view-models/sessao-plenaria.view-model';

@Injectable()
export class ExecuteSessionLifecycleUseCase {
    private readonly lifecycleService = new SessionLifecycleDomainService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessionId: string,
        dto: ExecutarCicloVidaSessaoDto,
    ) {
        let current: SessaoPlenariaPrismaPayload;
        try {
            current = (await this.repository.findOne(
                tenantId,
                sessionId,
            )) as SessaoPlenariaPrismaPayload;
        } catch {
            throw new SessaoPlenariaNotFoundError();
        }

        const status = resolveSessionStatus(current.situacao);
        if (!status) {
            throw new SessaoLifecycleActionNotAllowedError(
                dto.action,
                'DESCONHECIDO',
            );
        }

        const available = this.lifecycleService.getAvailableActions(status);
        if (!available.includes(dto.action)) {
            throw new SessaoLifecycleActionNotAllowedError(
                dto.action,
                status,
            );
        }

        const updated = await this.repository.executarCicloVida(
            tenantId,
            sessionId,
            dto,
        );
        return SessaoPlenariaViewModel.toHttp(
            updated as SessaoPlenariaPrismaPayload,
        );
    }
}

@Injectable()
export class ListSessionLifecycleActionsUseCase {
    private readonly lifecycleService = new SessionLifecycleDomainService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessionId: string) {
        let current: SessaoPlenariaPrismaPayload;
        try {
            current = (await this.repository.findOne(
                tenantId,
                sessionId,
            )) as SessaoPlenariaPrismaPayload;
        } catch {
            throw new SessaoPlenariaNotFoundError();
        }

        const status = resolveSessionStatus(current.situacao);
        if (!status) {
            return {
                sessionId,
                status: null,
                actions: [],
            };
        }

        const actions = this.lifecycleService.getAvailableActions(status);

        return {
            sessionId,
            status: {
                value: status,
                label: SESSION_STATUS_LABELS[status],
            },
            actions: actions.map((action: SessionLifecycleAction) => {
                const target = this.lifecycleService.resolveTransition(
                    status,
                    action,
                );
                return {
                    action,
                    label: SESSION_LIFECYCLE_ACTION_LABELS[action],
                    targetStatus: {
                        value: target,
                        label: SESSION_STATUS_LABELS[target],
                    },
                };
            }),
        };
    }
}

@Injectable()
export class GetSessionWorkflowUseCase {
    private readonly domainService = new PlenarySessionDomainService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(tenantId: string, sessionId: string) {
        let current: SessaoPlenariaPrismaPayload;
        try {
            current = (await this.repository.findOne(
                tenantId,
                sessionId,
            )) as SessaoPlenariaPrismaPayload;
        } catch {
            throw new SessaoPlenariaNotFoundError();
        }

        const status = resolveSessionStatus(current.situacao);
        const http = SessaoPlenariaViewModel.toHttp(current);

        return {
            ...http.workflow,
            allowedTransitions: status
                ? this.domainService.getAllowedTransitions(status).map(
                      (value: SessionStatus) => ({
                          value,
                          label: SESSION_STATUS_LABELS[value],
                      }),
                  )
                : [],
        };
    }
}

@Injectable()
export class ListSessionStatusesUseCase {
    private readonly domainService = new PlenarySessionDomainService();

    execute() {
        const actionRules = this.domainService.getAllStatusTransitions();

        const targetsByStatus = new Map<SessionStatus, Set<SessionStatus>>();
        for (const value of Object.values(SessionStatus)) {
            targetsByStatus.set(value, new Set());
        }
        for (const rule of actionRules) {
            for (const from of rule.from) {
                targetsByStatus.get(from)?.add(rule.to);
            }
        }

        return {
            statuses: Object.values(SessionStatus).map((value) => ({
                value,
                label: SESSION_STATUS_LABELS[value],
                allowedTransitions: [...(targetsByStatus.get(value) ?? [])].map(
                    (to) => ({
                        value: to,
                        label: SESSION_STATUS_LABELS[to],
                    }),
                ),
            })),
            transitions: actionRules.flatMap((item) =>
                item.from.map((from) => ({
                    action: item.action,
                    from: {
                        value: from,
                        label: SESSION_STATUS_LABELS[from],
                    },
                    to: {
                        value: item.to,
                        label: SESSION_STATUS_LABELS[item.to],
                    },
                })),
            ),
        };
    }
}
