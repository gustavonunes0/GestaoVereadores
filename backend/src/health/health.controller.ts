import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { SkipTenant } from '../common/decorators/skip-tenant.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@SkipTenant()
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @SkipThrottle()
    @Public()
    @Get()
    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                database: 'up',
                timestamp: new Date().toISOString(),
            };
        } catch {
            return {
                status: 'degraded',
                database: 'down',
                timestamp: new Date().toISOString(),
            };
        }
    }
}
