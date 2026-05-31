import { Inject, Injectable } from '@nestjs/common';
import { PublicUserPrimitives } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';
import { USER_REPOSITORY } from '../../users.tokens';
import { UserNotFoundError } from '../errors/user-not-found.error';

@Injectable()
export class FindUserByIdUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(id: string): Promise<PublicUserPrimitives> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user.toPublicPrimitives();
    }
}
