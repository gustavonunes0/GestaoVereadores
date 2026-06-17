import { TenantStatus, TenantUserRole } from '@prisma/client';

export type TenantAuthProps = {
    id: string;
    name: string;
    cnpj: string;
    status: TenantStatus;
};

export class TenantAuthEntity {
    readonly id: string;
    readonly name: string;
    readonly cnpj: string;
    readonly status: TenantStatus;

    constructor(props: TenantAuthProps) {
        this.id = props.id;
        this.name = props.name;
        this.cnpj = props.cnpj;
        this.status = props.status;
    }
}

export type TenantUserAccessProps = {
    id: string;
    tenantId: string;
    userId: string;
    role: TenantUserRole;
};

export class TenantUserAccessEntity {
    readonly id: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly role: TenantUserRole;

    constructor(props: TenantUserAccessProps) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.userId = props.userId;
        this.role = props.role;
    }
}

export type ParlamentarianUserAccessProps = {
    id: string;
    tenantId: string;
    userId: string;
    parliamentarianId: string;
    parliamentaryName: string;
};

export class ParlamentarianUserAccessEntity {
    readonly id: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly parliamentarianId: string;
    readonly parliamentaryName: string;

    constructor(props: ParlamentarianUserAccessProps) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.userId = props.userId;
        this.parliamentarianId = props.parliamentarianId;
        this.parliamentaryName = props.parliamentaryName;
    }
}
