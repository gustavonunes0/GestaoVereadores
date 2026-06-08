import { randomUUID } from 'crypto';

type BoardRoleProps = {
    id: string;
    tenantId: string;
    name: string;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type BoardRolePrimitives = BoardRoleProps;

export type CreateBoardRoleParams = {
    tenantId: string;
    name: string;
};

export class BoardRoleEntity {
    private constructor(private props: BoardRoleProps) {}

    static create(params: CreateBoardRoleParams) {
        const now = new Date();
        const entity = new BoardRoleEntity({
            id: randomUUID(),
            tenantId: params.tenantId,
            name: params.name.trim(),
            isRemoved: false,
            removedAt: null,
            createdAt: now,
            updatedAt: now,
        });
        entity.validate();
        return entity;
    }

    static restore(props: BoardRolePrimitives) {
        return new BoardRoleEntity({
            ...props,
            createdAt: new Date(props.createdAt),
            updatedAt: new Date(props.updatedAt),
            removedAt: props.removedAt ? new Date(props.removedAt) : null,
        });
    }

    get id() {
        return this.props.id;
    }

    get tenantId() {
        return this.props.tenantId;
    }

    get name() {
        return this.props.name;
    }

    toPrimitives(): BoardRolePrimitives {
        return { ...this.props };
    }

    private validate() {
        if (!this.props.tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para cargo da mesa');
        }
        if (!this.props.name) {
            throw new Error('Nome do cargo é obrigatório');
        }
    }
}
