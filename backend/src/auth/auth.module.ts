import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../identidade/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './application/controllers/auth.controller';
import { UsuariosController } from './application/controllers/usuarios.controller';
import { ChangeSiglUserPasswordUseCase } from './application/use-cases/change-sigl-user-password.use-case';
import { CreateSiglUserUseCase } from './application/use-cases/create-sigl-user.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { ListSiglUsersUseCase } from './application/use-cases/list-sigl-users.use-case';
import { LoginCamaraUseCase } from './application/use-cases/login-camara.use-case';
import { LoginSiglUseCase } from './application/use-cases/login-sigl.use-case';
import { UpdateSiglUserUseCase } from './application/use-cases/update-sigl-user.use-case';
import { TokenIssuer } from './domain/contracts/token-issuer';
import { SiglPasswordHasher } from './domain/contracts/sigl-password.hasher';
import { CamaraAuthRepository } from './domain/repositories/camara-auth.repository';
import { SiglUserRepository } from './domain/repositories/sigl-user.repository';
import { TenantAuthRepository } from './domain/repositories/tenant-auth.repository';
import { JwtStrategy } from './infra/passport/jwt.strategy';
import { PrismaCamaraAuthRepository } from './infra/prisma/prisma-camara-auth.repository';
import { PrismaSiglUserRepository } from './infra/prisma/prisma-sigl-user.repository';
import { PrismaTenantAuthRepository } from './infra/prisma/prisma-tenant-auth.repository';
import { BcryptPasswordHasher } from './infra/security/bcrypt-password.hasher';
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
    controllers: [AuthController, UsuariosController],
    providers: [
        LoginSiglUseCase,
        LoginCamaraUseCase,
        GetCurrentUserUseCase,
        ListSiglUsersUseCase,
        CreateSiglUserUseCase,
        UpdateSiglUserUseCase,
        ChangeSiglUserPasswordUseCase,
        JwtStrategy,
        PrismaSiglUserRepository,
        PrismaCamaraAuthRepository,
        PrismaTenantAuthRepository,
        BcryptPasswordHasher,
        JwtTokenIssuer,
        {
            provide: SiglUserRepository,
            useExisting: PrismaSiglUserRepository,
        },
        {
            provide: CamaraAuthRepository,
            useExisting: PrismaCamaraAuthRepository,
        },
        {
            provide: TenantAuthRepository,
            useExisting: PrismaTenantAuthRepository,
        },
        {
            provide: SiglPasswordHasher,
            useExisting: BcryptPasswordHasher,
        },
        {
            provide: TokenIssuer,
            useExisting: JwtTokenIssuer,
        },
    ],
    exports: [
        SiglUserRepository,
        CamaraAuthRepository,
        JwtModule,
    ],
})
export class AuthModule {}
