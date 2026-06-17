export type CamaraUserProps = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    cpf: string;
};

export class CamaraUserEntity {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly passwordHash: string;
    readonly cpf: string;

    constructor(props: CamaraUserProps) {
        this.id = props.id;
        this.email = props.email;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.passwordHash = props.passwordHash;
        this.cpf = props.cpf;
    }

    fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}
