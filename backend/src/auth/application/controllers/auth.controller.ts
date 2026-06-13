import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SkipTenant } from '../../../common/decorators/skip-tenant.decorator';
import { AuthenticatedUser } from '../../../common/types/authenticated-request';
import { Public } from '../../decorators/public.decorator';
import { LoginCamaraDto } from '../dto/login-camara.dto';
import { LoginDto } from '../dto/login.dto';
import {
    InvalidCredentialsError,
    InvalidTenantError,
    TenantMembershipRequiredError,
    TenantResolutionRequiredError,
} from '../errors/auth.errors';
import { GetCurrentUserUseCase } from '../use-cases/get-current-user.use-case';
import { LoginCamaraUseCase } from '../use-cases/login-camara.use-case';
import { LoginSiglUseCase } from '../use-cases/login-sigl.use-case';

@ApiTags('auth')
@SkipTenant()
@Controller('auth')
export class AuthController {
    constructor(
        private readonly loginSigl: LoginSiglUseCase,
        private readonly loginCamara: LoginCamaraUseCase,
        private readonly getCurrentUser: GetCurrentUserUseCase,
    ) {}

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('login')
    async login(@Body() dto: LoginDto) {
        try {
            return await this.loginSigl.execute(dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post('login-camara')
    async loginCamaraEndpoint(@Body() dto: LoginCamaraDto) {
        try {
            return await this.loginCamara.execute(dto);
        } catch (error) {
            this.handleError(error);
        }
    }

    @ApiBearerAuth()
    @Get('me')
    async me(@Req() req: { user: AuthenticatedUser }) {
        try {
            return await this.getCurrentUser.execute(req.user);
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: unknown): never {
        if (error instanceof InvalidCredentialsError) {
            throw new UnauthorizedException(error.message);
        }
        if (
            error instanceof InvalidTenantError ||
            error instanceof TenantResolutionRequiredError
        ) {
            throw new BadRequestException(error.message);
        }
        if (error instanceof TenantMembershipRequiredError) {
            throw new UnauthorizedException(error.message);
        }
        throw error;
    }
}
