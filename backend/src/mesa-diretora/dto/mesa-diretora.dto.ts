import { IsOptional, IsString } from 'class-validator';

export class CreateMesaDiretoraDto {
  @IsString()
  legislaturaId: string;

  @IsOptional()
  @IsString()
  sessaoId?: string;

  @IsOptional()
  @IsString()
  mensagem?: string;
}

export class AddMembroMesaDto {
  @IsString()
  parlamentarId: string;

  @IsString()
  cargoId: string;
}
