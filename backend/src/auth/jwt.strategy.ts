import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        if (payload.authType === 'camara') {
            return this.validateCamaraUser(payload);
        }
        return this.validateSiglUser({
            ...payload,
            authType: payload.authType ?? 'sigl',
        });
    }

    private async validateSiglUser(
        payload: JwtPayload,
    ): Promise<AuthenticatedUser> {
        const user = await this.prisma.usuario.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.ativo) {
            throw new UnauthorizedException();
        }
        return {
            id: user.id,
            authType: 'sigl',
            tenantId: payload.tid,
            username: user.username,
            nome: user.nome,
            role: user.role,
        };
    }

    private async validateCamaraUser(
        payload: JwtPayload,
    ): Promise<AuthenticatedUser> {
        const user = await this.prisma.user.findFirst({
            where: { id: payload.sub, isRemoved: false },
        });
        if (!user) {
            throw new UnauthorizedException();
        }
        return {
            id: user.id,
            authType: 'camara',
            tenantId: payload.tid,
            isTenantAdmin: payload.isTenantAdmin ?? payload.isAdmin,
            isTenantStaff: payload.isTenantStaff,
            isParliamentarian: payload.isParliamentarian,
            isAdmin: payload.isTenantAdmin ?? payload.isAdmin,
            email: user.email,
            nome: `${user.firstName} ${user.lastName}`.trim(),
        };
    }
}
