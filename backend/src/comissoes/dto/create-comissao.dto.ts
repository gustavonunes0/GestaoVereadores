import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateComissaoDto {
  @IsString()
  @MinLength(2)
  nome: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  sigla?: string;

  @IsOptional()
  @IsString()
  tipoComissaoId?: string;

  @IsOptional()
  @IsDateString()
  dataCriacao?: string;

  @IsOptional()
  @IsDateString()
  dataExtincao?: string;

  @IsOptional()
  @IsBoolean()
  unidadeDeliberativa?: boolean;

  @IsOptional()
  @IsString()
  localReuniao?: string;

  @IsOptional()
  @IsDateString()
  dataHoraReuniao?: string;

  @IsOptional()
  @IsString()
  telSalaReuniao?: string;

  @IsOptional()
  @IsString()
  enderecoSecretaria?: string;

  @IsOptional()
  @IsString()
  telSecretaria?: string;

  @IsOptional()
  @IsString()
  faxSecretaria?: string;

  @IsOptional()
  @IsString()
  secretario?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  finalidade?: string;

  @IsOptional()
  @IsString()
  apelido?: string;

  @IsOptional()
  @IsDateString()
  dataInstalacao?: string;

  @IsOptional()
  @IsDateString()
  dataPrevistaTermino?: string;

  @IsOptional()
  @IsDateString()
  novoPrazo?: string;

  @IsOptional()
  @IsDateString()
  dataTermino?: string;

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
