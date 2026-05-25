import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateComissaoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  mensagem?: string;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}

export class AddMembroComissaoDto {
  @IsString()
  parlamentarId: string;

  @IsOptional()
  @IsBoolean()
  titular?: boolean;
}
