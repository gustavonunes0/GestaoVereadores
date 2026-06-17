import { randomUUID } from 'crypto';

export type AutorExternoProps = {
    id: string;
    tenantId: string;
    tipoAutorId: string;
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

export type AutorExternoTipoAutor = {
    id: string;
    nome: string;
    idNegocio: number | null;
};

export type CreateAutorExternoParams = {
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

export type UpdateAutorExternoParams = Partial<
    Omit<CreateAutorExternoParams, 'tenantId'>
>;

export class AutorExternoEntity {
    private constructor(private props: AutorExternoProps) {}

    static create(params: CreateAutorExternoParams) {
        const now = new Date();
        const entity = new AutorExternoEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            tipoAutorId: params.tipoAutorId,
            nome: params.nome.trim(),
            cargo: AutorExternoEntity.normalizeOptional(params.cargo),
            instituicao: AutorExternoEntity.normalizeOptional(params.instituicao),
            cpf: AutorExternoEntity.normalizeCpf(params.cpf),
            email: AutorExternoEntity.normalizeOptional(params.email),
            telefone: AutorExternoEntity.normalizeOptional(params.telefone),
            registro: AutorExternoEntity.normalizeOptional(params.registro),
            partido: AutorExternoEntity.normalizeOptional(params.partido),
            uf: AutorExternoEntity.normalizeOptional(params.uf),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: AutorExternoProps) {
        return new AutorExternoEntity({
            ...props,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
            removedAt: props.removedAt ? new Date(props.removedAt) : null,
        });
    }

    toPrimitives(): AutorExternoProps {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.nome.trim()) {
            throw new Error('Nome do autor externo é obrigatório');
        }
        if (!this.props.tipoAutorId) {
            throw new Error('Tipo de autor é obrigatório');
        }
    }

    private static normalizeOptional(value?: string | null): string | null {
        const trimmed = value?.trim();
        return trimmed ? trimmed : null;
    }

    private static normalizeCpf(value?: string | null): string | null {
        if (!value) return null;
        const digits = value.replace(/\D/g, '');
        return digits || null;
    }
}
