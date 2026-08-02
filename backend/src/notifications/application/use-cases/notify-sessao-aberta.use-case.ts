import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PushSubscriptionRepository } from '../../domain/repositories/push-subscription.repository';
import { WebPushSender } from '../../infra/web-push.sender';

@Injectable()
export class NotifySessaoAbertaUseCase {
    private readonly logger = new Logger(NotifySessaoAbertaUseCase.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly subscriptions: PushSubscriptionRepository,
        private readonly webPush: WebPushSender,
    ) {}

    async execute(tenantId: string, sessaoId: string): Promise<void> {
        if (!this.webPush.isConfigured()) {
            this.logger.debug('Push desabilitado — pulando notificação de sessão aberta');
            return;
        }

        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, tenantId, isRemoved: false },
            include: {
                tipoSessao: { select: { nome: true, codigo: true } },
            },
        });

        if (!sessao) {
            this.logger.warn(`Sessão ${sessaoId} não encontrada para push`);
            return;
        }

        const dataLabel = sessao.dataInicio.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        const tipo = sessao.tipoSessao?.nome ?? 'Sessão plenária';
        const titulo = 'Sessão iniciada';
        const body = `${tipo} começou agora (${dataLabel}). Entre para marcar presença.`;
        const url = `/parlamentar/sessoes/${sessaoId}`;

        const targets = await this.subscriptions.findActiveByTenantForParliamentarians(
            tenantId,
        );

        if (targets.length === 0) {
            this.logger.debug(`Nenhuma subscription ativa para tenant ${tenantId}`);
            return;
        }

        const result = await this.webPush.sendToMany(targets, {
            title: titulo,
            body,
            url,
            tag: `sessao-aberta-${sessaoId}`,
            data: {
                type: 'SESSAO_ABERTA',
                sessaoId,
                tenantId,
            },
        });

        this.logger.log(
            `Push sessão aberta ${sessaoId}: ${result.sent} enviados, ${result.failed} falhas`,
        );
    }
}
