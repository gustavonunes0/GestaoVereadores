import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import {
    PushSubscriptionRecord,
    PushSubscriptionRepository,
} from '../domain/repositories/push-subscription.repository';
import {
    DEFAULT_VAPID_PRIVATE_KEY,
    DEFAULT_VAPID_PUBLIC_KEY,
    DEFAULT_VAPID_SUBJECT,
} from './vapid.defaults';

export type WebPushPayload = {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    data?: Record<string, unknown>;
};

@Injectable()
export class WebPushSender implements OnModuleInit {
    private readonly logger = new Logger(WebPushSender.name);
    private configured = false;

    constructor(
        private readonly config: ConfigService,
        private readonly subscriptions: PushSubscriptionRepository,
    ) {}

    onModuleInit() {
        const publicKey = this.resolvePublicKey();
        const privateKey = this.resolvePrivateKey();
        const subject =
            this.config.get<string>('VAPID_SUBJECT')?.trim() || DEFAULT_VAPID_SUBJECT;

        webpush.setVapidDetails(subject, publicKey, privateKey);
        this.configured = true;
        this.logger.log('Web Push (VAPID) configurado');
    }

    isConfigured(): boolean {
        return this.configured;
    }

    getPublicKey(): string | null {
        return this.resolvePublicKey();
    }

    private resolvePublicKey(): string {
        return this.cleanKey(
            this.config.get<string>('VAPID_PUBLIC_KEY'),
            DEFAULT_VAPID_PUBLIC_KEY,
        );
    }

    private resolvePrivateKey(): string {
        return this.cleanKey(
            this.config.get<string>('VAPID_PRIVATE_KEY'),
            DEFAULT_VAPID_PRIVATE_KEY,
        );
    }

    private cleanKey(value: string | undefined, fallback: string): string {
        const cleaned = value?.trim().replace(/^["']|["']$/g, '') ?? '';
        return cleaned || fallback;
    }

    async sendToMany(
        records: PushSubscriptionRecord[],
        payload: WebPushPayload,
    ): Promise<{ sent: number; failed: number }> {
        if (!this.configured || records.length === 0) {
            return { sent: 0, failed: 0 };
        }

        const body = JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.url ?? '/',
            tag: payload.tag,
            data: payload.data ?? {},
        });

        let sent = 0;
        let failed = 0;

        await Promise.all(
            records.map(async (sub) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: sub.endpoint,
                            keys: { p256dh: sub.p256dh, auth: sub.auth },
                        },
                        body,
                        { TTL: 60 * 60 },
                    );
                    sent += 1;
                } catch (err) {
                    failed += 1;
                    const statusCode =
                        err && typeof err === 'object' && 'statusCode' in err
                            ? Number((err as { statusCode: number }).statusCode)
                            : undefined;

                    if (statusCode === 404 || statusCode === 410) {
                        await this.subscriptions.softDeleteById(sub.id);
                        this.logger.debug(`Subscription inválida removida: ${sub.id}`);
                    } else {
                        this.logger.warn(
                            `Falha ao enviar push (${sub.id}): ${String(err)}`,
                        );
                    }
                }
            }),
        );

        return { sent, failed };
    }
}
