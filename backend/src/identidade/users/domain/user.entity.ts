import { randomUUID } from 'crypto';
import { BaseAuditFields, BaseEntity } from '../../../common/base/base.entity';

type UserProps = {
    id: string;
    firstName: string;
    lastName: string;
    cpf: string | null;
    email: string;
    passwordHash: string;
    profilePicture: string | null;
};

type UserAuditParams = Partial<BaseAuditFields>;

export type UserPrimitives = UserProps & BaseAuditFields;
export type PublicUserPrimitives = Omit<UserPrimitives, 'passwordHash'>;

type CreateUserParams = UserAuditParams & {
    id?: string;
    firstName: string;
    lastName: string;
    cpf: string | null;
    email: string;
    passwordHash: string;
    profilePicture?: string | null;
};

type UpdateUserParams = {
    firstName?: string;
    lastName?: string;
    cpf?: string | null;
    email?: string;
    passwordHash?: string;
    profilePicture?: string | null;
    modifiedBy?: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_LENGTH = 11;
const NAME_MIN_LENGTH = 2;

export class UserEntity extends BaseEntity {
    private constructor(
        private readonly props: UserProps,
        audit: BaseAuditFields,
    ) {
        super(audit);
    }

    static create(params: CreateUserParams) {
        const user = new UserEntity(
            {
                id: params.id ?? randomUUID(),
                firstName: params.firstName.trim(),
                lastName: params.lastName.trim(),
                cpf: params.cpf !== null ? UserEntity.normalizeCpf(params.cpf) : null,
                email: UserEntity.normalizeEmail(params.email),
                passwordHash: params.passwordHash,
                profilePicture: UserEntity.normalizeAsset(
                    params.profilePicture,
                ),
            },
            UserEntity.buildAuditFields(params),
        );

        user.validate();
        return user;
    }

    static restore(props: UserPrimitives) {
        return new UserEntity(
            {
                id: props.id,
                firstName: props.firstName,
                lastName: props.lastName,
                cpf: props.cpf,
                email: props.email,
                passwordHash: props.passwordHash,
                profilePicture: props.profilePicture,
            },
            {
                createdAt: new Date(props.createdAt),
                createdBy: props.createdBy,
                modifiedAt: new Date(props.modifiedAt),
                modifiedBy: props.modifiedBy,
                isRemoved: props.isRemoved,
            },
        );
    }

    get id() {
        return this.props.id;
    }

    get email() {
        return this.props.email;
    }

    get cpf() {
        return this.props.cpf;
    }

    update(params: UpdateUserParams) {
        if (params.firstName !== undefined) {
            this.props.firstName = params.firstName.trim();
        }

        if (params.lastName !== undefined) {
            this.props.lastName = params.lastName.trim();
        }

        if (params.cpf !== undefined) {
            this.props.cpf = params.cpf !== null ? UserEntity.normalizeCpf(params.cpf) : null;
        }

        if (params.email !== undefined) {
            this.props.email = UserEntity.normalizeEmail(params.email);
        }

        if (params.passwordHash !== undefined) {
            this.props.passwordHash = params.passwordHash;
        }

        if (params.profilePicture !== undefined) {
            this.props.profilePicture = UserEntity.normalizeAsset(
                params.profilePicture,
            );
        }

        this.touch(params.modifiedBy);
        this.validate();
    }

    remove(modifiedBy?: string | null) {
        this.markAsRemoved(modifiedBy);
    }

    toPrimitives(): UserPrimitives {
        return {
            ...this.props,
            ...this.toAuditPrimitives(),
        };
    }

    toPublicPrimitives(): PublicUserPrimitives {
        const { passwordHash: _passwordHash, ...publicData } =
            this.toPrimitives();
        return publicData;
    }

    private validate() {
        if (this.props.firstName.length < NAME_MIN_LENGTH) {
            throw new Error(
                `Primeiro nome deve ter ao menos ${NAME_MIN_LENGTH} caracteres`,
            );
        }

        if (this.props.lastName.length < NAME_MIN_LENGTH) {
            throw new Error(
                `Sobrenome deve ter ao menos ${NAME_MIN_LENGTH} caracteres`,
            );
        }

        if (this.props.cpf !== null && this.props.cpf.length !== CPF_LENGTH) {
            throw new Error('CPF do usuário inválido');
        }

        if (!EMAIL_REGEX.test(this.props.email)) {
            throw new Error('E-mail do usuário inválido');
        }

        if (!this.props.passwordHash.trim()) {
            throw new Error('Hash de senha do usuário é obrigatório');
        }
    }

    private static normalizeCpf(cpf: string) {
        return cpf.replace(/\D/g, '');
    }

    private static normalizeEmail(email: string) {
        return email.trim().toLowerCase();
    }

    private static normalizeAsset(asset?: string | null) {
        const normalizedAsset = asset?.trim();
        return normalizedAsset ? normalizedAsset : null;
    }
}
