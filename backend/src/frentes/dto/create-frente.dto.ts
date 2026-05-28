import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateFrenteDto {
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

export class AddMembroFrenteDto {
  @IsString()
  parlamentarId: string;
}
