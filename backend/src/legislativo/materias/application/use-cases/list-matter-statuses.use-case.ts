import { Injectable } from '@nestjs/common';
import {
    MATTER_STATUS_LABELS,
    MatterStatus,
} from '../../domain/enums/matter-status.enum';
import { LegislativeMatterDomainService } from '../../domain/services/legislative-matter-domain.service';

@Injectable()
export class ListMatterStatusesUseCase {
    private readonly domainService = new LegislativeMatterDomainService();

    execute() {
        const actionRules = this.domainService.getAllStatusTransitions();

        const targetsByStatus = new Map<MatterStatus, Set<MatterStatus>>();
        for (const status of Object.values(MatterStatus)) {
            targetsByStatus.set(status, new Set());
        }
        for (const rule of actionRules) {
            for (const from of rule.from) {
                targetsByStatus.get(from)?.add(rule.to);
            }
        }

        return {
            statuses: Object.values(MatterStatus).map((value) => ({
                value,
                label: MATTER_STATUS_LABELS[value],
                allowedTransitions: [...(targetsByStatus.get(value) ?? [])].map(
                    (to) => ({
                        value: to,
                        label: MATTER_STATUS_LABELS[to],
                    }),
                ),
            })),
            transitions: actionRules.flatMap((item) =>
                item.from.map((from) => ({
                    action: item.action,
                    from: {
                        value: from,
                        label: MATTER_STATUS_LABELS[from],
                    },
                    to: {
                        value: item.to,
                        label: MATTER_STATUS_LABELS[item.to],
                    },
                })),
            ),
        };
    }
}
