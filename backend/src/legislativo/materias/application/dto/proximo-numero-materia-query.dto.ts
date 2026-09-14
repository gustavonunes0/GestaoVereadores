import { IsUUID } from 'class-validator';

export class ProximoNumeroMateriaQueryDto {
    @IsUUID()
    tipoId: string;

    @IsUUID()
    anoId: string;
}
