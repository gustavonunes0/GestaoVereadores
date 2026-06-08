import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { MatterAuthorshipDomainService } from '../../domain/services/matter-authorship-domain.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { AddCoautorMateriaDto } from '../dto/matter-autoria.dto';
import {
    MatterAuthorshipValidationError,
    MatterCoauthorAlreadyExistsError,
    MatterCoauthorNotFoundError,
    MatterNotFoundError,
    ParliamentarianNotFoundForMatterError,
} from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

@Injectable()
export class AddMatterCoauthorUseCase {
    private readonly domainService = new MatterAuthorshipDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        dto: AddCoautorMateriaDto,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);
        this.domainService.assertCoauthorMustBeParliamentarian();

        try {
            const data = await this.repository.addCoautor(
                tenantId,
                matterId,
                dto,
            );
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                const msg = error.message;
                if (msg.includes('Parlamentar')) {
                    throw new ParliamentarianNotFoundForMatterError();
                }
                throw new MatterNotFoundError();
            }
            if (error instanceof ConflictException) {
                throw new MatterCoauthorAlreadyExistsError();
            }
            if (error instanceof BadRequestException) {
                throw new MatterAuthorshipValidationError(error.message);
            }
            throw error;
        }
    }
}

@Injectable()
export class RemoveMatterCoauthorUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, matterId: string, coauthorId: string) {
        try {
            const data = await this.repository.removeCoautor(
                tenantId,
                matterId,
                coauthorId,
            );
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                const msg = error.message;
                if (msg.includes('Coautor')) {
                    throw new MatterCoauthorNotFoundError();
                }
                throw new MatterNotFoundError();
            }
            throw error;
        }
    }
}
