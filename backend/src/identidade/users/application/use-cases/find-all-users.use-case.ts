import { Inject, Injectable } from '@nestjs/common';
import { PublicUserPrimitives } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { USER_REPOSITORY } from '../../users.tokens';

@Injectable()
export class FindAllUsersUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(): Promise<PublicUserPrimitives[]> {
        const users = await this.userRepository.findAll();
        return users.map((user) => user.toPublicPrimitives());
    }
}
