import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  username: string;

  @IsString()
  @MinLength(1)
  password: string;

  /** Câmara ativa no contexto do token (claim `tid`). Obrigatório para rotas legislativas. */
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}
