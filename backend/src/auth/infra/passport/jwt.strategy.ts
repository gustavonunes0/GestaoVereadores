import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
    AuthenticatedUser,
} from '../../../common/types/authenticated-request';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import {
    JwtPayload,
    isStaffSession,
    isParlamentarianSession,
} from '../../domain/types/jwt-payload.type';

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
        if ('sessionType' in payload) {
            return this.validateCamaraUserBySession(payload);
        }
        // Legacy sigl path
        return this.validateSiglUser(payload as unknown as { sub: string; authType?: string; tid?: string });
    }

    private async validateCamaraUserBySession(
        payload: JwtPayload,
    ): Promise<AuthenticatedUser> {
        const user = await this.camaraAuth.findProfileById(payload.sub);
        if (!user) throw new UnauthorizedException();

        if (isStaffSession(payload)) {
            return {
                id: user.id,
                authType: 'camara',
                sessionType: 'staff',
                tenantId: payload.tenantId,
                tenantUserId: payload.tenantUserId,
                role: payload.role,
                email: user.email,
                nome: `${user.firstName} ${user.lastName}`.trim(),
            };
        }

        if (isParlamentarianSession(payload)) {
            return {
                id: user.id,
                authType: 'camara',
                sessionType: 'parliamentarian',
                tenantId: payload.tenantId,
                parliamentarianUserId: payload.parliamentarianUserId,
                parliamentarianId: payload.parliamentarianId,
                parliamentaryName: payload.parliamentaryName,
                email: user.email,
                nome: `${user.firstName} ${user.lastName}`.trim(),
            };
        }

        throw new UnauthorizedException();
    }

    private async validateSiglUser(
        payload: { sub: string; authType?: string; tid?: string },
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
}
