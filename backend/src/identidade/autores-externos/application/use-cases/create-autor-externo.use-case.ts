import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { CreateAutorExternoDto } from '../dto/create-autor-externo.dto';
import { TipoAutorInvalidoError } from '../errors/autor-externo.errors';
import { AutorExternoViewModel } from '../view-models/autor-externo.view-model';

@Injectable()
export class CreateAutorExternoUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, dto: CreateAutorExternoDto) {
        const tipoValido = await this.repository.existsTipoAutor(dto.tipoAutorId);
        if (!tipoValido) {
            throw new TipoAutorInvalidoError();
        }

        try {
            const created = await this.repository.create({
                tenantId,
                tipoAutorId: dto.tipoAutorId,
                nome: dto.nome,
                cargo: dto.cargo,
                instituicao: dto.instituicao,
                cpf: dto.cpf,
                email: dto.email,
                telefone: dto.telefone,
                registro: dto.registro,
                partido: dto.partido,
                uf: dto.uf,
            });
            return AutorExternoViewModel.toHttp(created);
        } catch (error) {
            if (error instanceof Error && error.message.includes('obrigatório')) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
