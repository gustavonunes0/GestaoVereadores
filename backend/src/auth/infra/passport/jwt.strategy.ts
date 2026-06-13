import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../../../common/types/authenticated-request';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { JwtPayload } from '../../domain/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly siglUsers: SiglUserRepository,
        private readonly camaraAuth: CamaraAuthRepository,
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
        const user = await this.siglUsers.findById(payload.sub);
        if (!user || !user.isActive()) {
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
        const user = await this.camaraAuth.findProfileById(payload.sub);
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
