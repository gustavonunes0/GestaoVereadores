import { RoleUsuario } from '@prisma/client';
import { SiglUserEntity } from '../entities/sigl-user.entity';

export type SiglUserListItem = {
    id: string;
    username: string;
    nome: string;
    role: RoleUsuario;
    ativo: boolean;
    createdAt?: Date;
};

export type SiglUserProfile = {
    id: string;
    username: string;
    nome: string;
    role: RoleUsuario;
    ativo: boolean;
};

export type CreateSiglUserInput = {
    username: string;
    passwordHash: string;
    nome: string;
    role: RoleUsuario;
};

export type UpdateSiglUserInput = {
    nome?: string;
    role?: RoleUsuario;
    ativo?: boolean;
};

export abstract class SiglUserRepository {
    abstract findByUsername(username: string): Promise<SiglUserEntity | null>;

    abstract findById(id: string): Promise<SiglUserEntity | null>;

    abstract findProfileById(id: string): Promise<SiglUserProfile | null>;

    abstract count(): Promise<number>;

    abstract findMany(
        skip: number,
        take: number,
    ): Promise<SiglUserListItem[]>;

    abstract existsByUsername(username: string): Promise<boolean>;

    abstract create(input: CreateSiglUserInput): Promise<SiglUserListItem>;

    abstract update(
        id: string,
        input: UpdateSiglUserInput,
    ): Promise<SiglUserListItem>;

    abstract updatePassword(id: string, passwordHash: string): Promise<void>;
}
