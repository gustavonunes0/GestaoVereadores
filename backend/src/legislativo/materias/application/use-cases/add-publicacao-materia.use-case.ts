import {
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { CreatePublicacaoDto } from '../dto/create-publicacao.dto';

@Injectable()
export class AddPublicacaoMateriaUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        materiaId: string,
        dto: CreatePublicacaoDto,
    ) {
        try {
            return await this.repository.addPublicacao(tenantId, materiaId, {
                dataPublicacao: dto.dataPublicacao,
                veiculo: dto.veiculo,
                paginaInicio: dto.paginaInicio,
                paginaFim: dto.paginaFim,
                identificador: dto.identificador,
                urlExterna: dto.urlExterna,
                textoIntegral: dto.textoIntegral,
            });
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                (error instanceof Error && error.message.includes('não encontrada'))
            ) {
                throw new NotFoundException('Matéria não encontrada');
            }
            throw error;
        }
    }
}
