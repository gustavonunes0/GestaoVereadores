import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserEntity, UserPrimitives } from '../../domain/user.entity';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(user: UserEntity): Promise<UserEntity> {
        const data = user.toPrimitives();
        const createdUser = await this.prisma.user.create({
            data: this.toPersistence(data),
        });

        return this.toEntity(createdUser);
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await this.prisma.user.findMany({
            where: { isRemoved: false },
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => this.toEntity(user));
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: { id, isRemoved: false },
        });

        return user ? this.toEntity(user) : null;
    }

    async findByCpf(cpf: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: { cpf, isRemoved: false },
        });

        return user ? this.toEntity(user) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await this.prisma.user.findFirst({
            where: { email, isRemoved: false },
        });

        return user ? this.toEntity(user) : null;
    }

    async update(user: UserEntity): Promise<UserEntity> {
        const data = user.toPrimitives();
        const updatedUser = await this.prisma.user.update({
            where: { id: data.id },
            data: this.toPersistence(data),
        });

        return this.toEntity(updatedUser);
    }

    async remove(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { isRemoved: true },
        });
    }

    private toEntity(user: User) {
        return UserEntity.restore({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            cpf: user.cpf,
            email: user.email,
            passwordHash: user.passwordHash,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            modifiedAt: user.modifiedAt,
            modifiedBy: user.modifiedBy,
            isRemoved: user.isRemoved,
        });
    }

    private toPersistence(user: UserPrimitives): Prisma.UserUncheckedCreateInput {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            cpf: user.cpf,
            email: user.email,
            passwordHash: user.passwordHash,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
            modifiedAt: user.modifiedAt,
            modifiedBy: user.modifiedBy,
            isRemoved: user.isRemoved,
        };
    }
}
