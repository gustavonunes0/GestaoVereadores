import { randomUUID } from 'crypto';

export type TipoAutorData = {
    id: string;
    nome: string;
    idNegocio: number | null;
};

type TenantPartnerProps = {
    id: string;
    tenantId: string;
    tipoAutorId: string;
    tipoAutor?: TipoAutorData;
    nome: string;
    cargo: string | null;
    instituicao: string | null;
    cpf: string | null;
    email: string | null;
    telefone: string | null;
    registro: string | null;
    partido: string | null;
    uf: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type TenantPartnerPrimitives = Omit<TenantPartnerProps, 'tipoAutor'>;

type CreateTenantPartnerParams = {
    tenantId: string;
    tipoAutorId: string;
    nome: string;
    cargo?: string | null;
    instituicao?: string | null;
    cpf?: string | null;
    email?: string | null;
    telefone?: string | null;
    registro?: string | null;
    partido?: string | null;
    uf?: string | null;
};

type UpdateTenantPartnerParams = Partial<Omit<CreateTenantPartnerParams, 'tenantId'>>;

export class TenantPartnerEntity {
    private constructor(private readonly props: TenantPartnerProps) {}

    static create(params: CreateTenantPartnerParams): TenantPartnerEntity {
        const now = new Date();
        return new TenantPartnerEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tipoAutorId: params.tipoAutorId,
            nome: params.nome.trim(),
            cargo: params.cargo ?? null,
            instituicao: params.instituicao ?? null,
            cpf: params.cpf ? params.cpf.replace(/\D/g, '') : null,
            email: params.email?.trim().toLowerCase() ?? null,
            telefone: params.telefone ?? null,
            registro: params.registro ?? null,
            partido: params.partido ?? null,
            uf: params.uf ?? null,
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: TenantPartnerPrimitives & { tipoAutor?: TipoAutorData }): TenantPartnerEntity {
        return new TenantPartnerEntity(props);
    }

    update(params: UpdateTenantPartnerParams): void {
        if (params.tipoAutorId !== undefined) this.props.tipoAutorId = params.tipoAutorId;
        if (params.nome !== undefined) this.props.nome = params.nome.trim();
        if (params.cargo !== undefined) this.props.cargo = params.cargo ?? null;
        if (params.instituicao !== undefined) this.props.instituicao = params.instituicao ?? null;
        if (params.cpf !== undefined) this.props.cpf = params.cpf ? params.cpf.replace(/\D/g, '') : null;
        if (params.email !== undefined) this.props.email = params.email?.trim().toLowerCase() ?? null;
        if (params.telefone !== undefined) this.props.telefone = params.telefone ?? null;
        if (params.registro !== undefined) this.props.registro = params.registro ?? null;
        if (params.partido !== undefined) this.props.partido = params.partido ?? null;
        if (params.uf !== undefined) this.props.uf = params.uf ?? null;
        this.props.updatedAt = new Date();
    }

    remove(): void {
        this.props.isRemoved = true;
        this.props.removedAt = new Date();
        this.props.updatedAt = new Date();
    }

    get id() { return this.props.id; }
    get tenantId() { return this.props.tenantId; }
    get tipoAutorId() { return this.props.tipoAutorId; }
    get tipoAutor() { return this.props.tipoAutor; }
    get nome() { return this.props.nome; }
    get cargo() { return this.props.cargo; }
    get instituicao() { return this.props.instituicao; }
    get cpf() { return this.props.cpf; }
    get email() { return this.props.email; }
    get telefone() { return this.props.telefone; }
    get registro() { return this.props.registro; }
    get partido() { return this.props.partido; }
    get uf() { return this.props.uf; }
    get isRemoved() { return this.props.isRemoved; }
    get createdAt() { return this.props.createdAt; }

    toPrimitives(): TenantPartnerPrimitives {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tipoAutor, ...primitives } = this.props;
        return primitives;
    }
}
