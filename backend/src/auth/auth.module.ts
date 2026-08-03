import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../identidade/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './application/controllers/auth.controller';
import { ChangeCamaraUserPasswordUseCase } from './application/use-cases/change-camara-user-password.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { LoginCamaraUseCase } from './application/use-cases/login-camara.use-case';
import { TokenIssuer } from './domain/contracts/token-issuer';
import { CamaraAuthRepository } from './domain/repositories/camara-auth.repository';
import { TenantAuthRepository } from './domain/repositories/tenant-auth.repository';
import { JwtStrategy } from './infra/passport/jwt.strategy';
import { PrismaCamaraAuthRepository } from './infra/prisma/prisma-camara-auth.repository';
import { PrismaTenantAuthRepository } from './infra/prisma/prisma-tenant-auth.repository';
import { JwtTokenIssuer } from './infra/security/jwt-token.issuer';

@Module({
    imports: [
        PrismaModule,
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        LoginCamaraUseCase,
        GetCurrentUserUseCase,
        ChangeCamaraUserPasswordUseCase,
        JwtStrategy,
        PrismaCamaraAuthRepository,
        PrismaTenantAuthRepository,
        JwtTokenIssuer,
        {
            provide: CamaraAuthRepository,
            useExisting: PrismaCamaraAuthRepository,
        },
        {
            provide: TenantAuthRepository,
            useExisting: PrismaTenantAuthRepository,
        },
        {
            provide: TokenIssuer,
            useExisting: JwtTokenIssuer,
        },
    ],
    exports: [CamaraAuthRepository, JwtModule],
})
export class AuthModule {}
