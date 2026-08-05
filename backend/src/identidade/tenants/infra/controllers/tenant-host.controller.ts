import { Controller, Get, Headers, NotFoundException, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../auth/decorators/public.decorator';
import { SkipTenant } from '../../../../common/decorators/skip-tenant.decorator';
import { extractTenantHost } from '../../../../common/tenant-host';
import { ResolveTenantByHostUseCase } from '../../application/use-cases/resolve-tenant-by-host.use-case';

@ApiTags('tenants')
@SkipTenant()
@Controller('tenants')
export class TenantHostController {
    constructor(private readonly resolveByHost: ResolveTenantByHostUseCase) {}

    /**
     * Resolve o tenant (ou plataforma) a partir do hostname do front.
     * Usado no bootstrap multi-tenant (mesmo padrão do SistemaSindicatos).
     */
    @Public()
    @Get('current')
    async current(
        @Headers() headers: Record<string, string | string[] | undefined>,
        @Req() req: { headers: Record<string, string | string[] | undefined> },
    ) {
        const host = extractTenantHost(headers ?? req.headers);
        const resolved = await this.resolveByHost.execute(host);

        if (resolved.kind === 'platform') {
            return {
                kind: 'platform' as const,
                host: resolved.host,
                name: 'CâmaraGest',
            };
        }

        if (resolved.kind === 'tenant') {
            return {
                kind: 'tenant' as const,
                host: resolved.host,
                id: resolved.id,
                name: resolved.name,
                logo: resolved.logo,
                cnpj: resolved.cnpj,
            };
        }

        throw new NotFoundException(
            host
                ? `Domínio não encontrado: ${host}`
                : 'Não foi possível determinar o domínio do tenant',
        );
    }
}
