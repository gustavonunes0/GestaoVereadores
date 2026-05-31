import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MasterOnly, ReadRoles } from '../common/decorators/api-roles.decorator';
import { SkipTenant } from '../common/decorators/skip-tenant.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './dto/usuario.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@SkipTenant()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly authService: AuthService) {}

  @MasterOnly()
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.authService.listUsers(query);
  }

  @MasterOnly()
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.authService.createUser(dto);
  }

  @ReadRoles()
  @Patch('me/senha')
  changePassword(
    @Req() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @MasterOnly()
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.authService.updateUser(id, dto);
  }
}
