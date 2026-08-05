import { Injectable } from '@nestjs/common';
import { TenantStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    isPlatformHost,
    normalizeHost,
} from '../../../../common/tenant-host';

export type TenantHostResolution =
    | { kind: 'platform'; host: string }
    | {
          kind: 'tenant';
          host: string;
          id: string;
          name: string;
          logo: string | null;
          cnpj: string;
      }
    | { kind: 'unknown'; host: string };

@Injectable()
export class ResolveTenantByHostUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(hostBruto: string | undefined | null): Promise<TenantHostResolution> {
        const host = hostBruto ? normalizeHost(hostBruto) : '';
        if (!host) {
            return { kind: 'unknown', host: '' };
        }

        if (isPlatformHost(host)) {
            return { kind: 'platform', host };
        }

        const domain = await this.prisma.tenantDomain.findUnique({
            where: { host },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        cnpj: true,
                        status: true,
                        isRemoved: true,
                    },
                },
            },
        });

        const tenant = domain?.tenant;
        if (
            tenant &&
            !tenant.isRemoved &&
            tenant.status === TenantStatus.ACTIVE
        ) {
            return {
                kind: 'tenant',
                host,
                id: tenant.id,
                name: tenant.name,
                logo: tenant.logo,
                cnpj: tenant.cnpj,
            };
        }

        return { kind: 'unknown', host };
    }
}
