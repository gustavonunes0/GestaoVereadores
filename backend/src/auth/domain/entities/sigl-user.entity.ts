import { RoleUsuario } from '@prisma/client';

export type SiglUserProps = {
    id: string;
    username: string;
    nome: string;
    role: RoleUsuario;
    ativo: boolean;
    passwordHash: string;
    createdAt?: Date;
};

export class SiglUserEntity {
    readonly id: string;
    readonly username: string;
    readonly nome: string;
    readonly role: RoleUsuario;
    readonly ativo: boolean;
    readonly passwordHash: string;
    readonly createdAt?: Date;

    constructor(props: SiglUserProps) {
        this.id = props.id;
        this.username = props.username;
        this.nome = props.nome;
        this.role = props.role;
        this.ativo = props.ativo;
        this.passwordHash = props.passwordHash;
        this.createdAt = props.createdAt;
    }

    isActive(): boolean {
        return this.ativo;
    }
}
