import { IsEnum } from 'class-validator';
import { FaseSessao } from '../../domain/enums/fase-sessao.enum';

export class SetFaseSessaoDto {
    @IsEnum(FaseSessao)
    faseAtual: FaseSessao;
}
