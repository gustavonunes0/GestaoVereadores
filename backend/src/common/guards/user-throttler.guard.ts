import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthenticatedUser } from '../types/authenticated-request';

/**
 * Rate limit contado por usuário autenticado em vez de por IP.
 *
 * Numa câmara os vereadores e a secretaria saem todos pelo mesmo IP público (NAT),
 * então a chave por IP faz um usuário consumir a cota dos outros. O `id` vem do JWT
 * já validado pelo `JwtAuthGuard` (registrado antes deste no `app.module.ts`), logo
 * não é forjável. Rotas `@Public()` não têm usuário e continuam contando por IP.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, unknown>): Promise<string> {
        const user = req.user as AuthenticatedUser | undefined;
        if (user?.id) return `user:${user.id}`;

        const ips = req.ips as string[] | undefined;
        const ip = (ips?.length ? ips[0] : (req.ip as string | undefined)) ?? 'desconhecido';
        return `ip:${ip}`;
    }
}
