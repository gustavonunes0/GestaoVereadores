export type CamaraUserProps = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
};

export class CamaraUserEntity {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly passwordHash: string;

    constructor(props: CamaraUserProps) {
        this.id = props.id;
        this.email = props.email;
        this.firstName = props.firstName;
        this.lastName = props.lastName;
        this.passwordHash = props.passwordHash;
    }

    fullName(): string {
        return `${this.firstName} ${this.lastName}`.trim();
    }
}
