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
    parliamentarianId?: string;
    isTenantAdmin: boolean;
    isTenantStaff: boolean;
    isParliamentarian: boolean;
};

export class TenantUserAccessEntity {
    readonly id: string;
    readonly tenantId: string;
    readonly userId: string;
    readonly role: TenantUserRole;
    readonly parliamentarianId?: string;
    readonly isTenantAdmin: boolean;
    readonly isTenantStaff: boolean;
    readonly isParliamentarian: boolean;

    constructor(props: TenantUserAccessProps) {
        this.id = props.id;
        this.tenantId = props.tenantId;
        this.userId = props.userId;
        this.role = props.role;
        this.parliamentarianId = props.parliamentarianId;
        this.isTenantAdmin = props.isTenantAdmin;
        this.isTenantStaff = props.isTenantStaff;
        this.isParliamentarian = props.isParliamentarian;
    }
}
