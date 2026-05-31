import { UserEntity } from './user.entity';

export interface UserRepository {
    create(user: UserEntity): Promise<UserEntity>;
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
    findByCpf(cpf: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    update(user: UserEntity): Promise<UserEntity>;
    remove(id: string): Promise<void>;
}
