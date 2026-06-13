import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { paginatedQuery } from '../../../common/prisma/paginate';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { SiglUserViewModel } from '../view-models/sigl-user.view-model';

@Injectable()
export class ListSiglUsersUseCase {
    constructor(private readonly siglUsers: SiglUserRepository) {}

    async execute(query: PaginationQueryDto) {
        const result = await paginatedQuery(
            () => this.siglUsers.count(),
            (skip, take) => this.siglUsers.findMany(skip, take),
            query,
        );

        return {
            data: result.data.map((user) => SiglUserViewModel.toHttp(user)),
            meta: result.meta,
        };
    }
}
