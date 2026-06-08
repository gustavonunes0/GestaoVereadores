import {
    GuestUserStatus,
    GuestUserType,
} from '../../domain/enums/guest-user.enums';

/** Linha persistida — espelha o model GuestUser do schema Prisma. */
export type GuestUserRow = {
    id: string;
    tenantId: string;
    fullName: string;
    cpf: string | null;
    email: string | null;
    phone: string | null;
    type: GuestUserType | string;
    status: GuestUserStatus | string;
    organizationName: string | null;
    positionName: string | null;
    notes: string | null;
    isRemoved: boolean;
    removedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type GuestUserWhereInput = {
    id?: string;
    tenantId?: string;
    cpf?: string;
    isRemoved?: boolean;
    type?: GuestUserType | string;
    status?: GuestUserStatus | string;
    fullName?: { contains: string; mode: 'insensitive' };
    NOT?: { id: string };
};

export type GuestUserCreateInput = {
    tenantId: string;
    fullName: string;
    cpf?: string | null;
    email?: string | null;
    phone?: string | null;
    type?: GuestUserType | string;
    status?: GuestUserStatus | string;
    organizationName?: string | null;
    positionName?: string | null;
    notes?: string | null;
};

export type GuestUserUpdateInput = Partial<
    Omit<GuestUserCreateInput, 'tenantId'>
> & {
    isRemoved?: boolean;
    removedAt?: Date | null;
};

export type GuestUserDelegate = {
    create(args: { data: GuestUserCreateInput }): Promise<GuestUserRow>;
    findMany(args: {
        where?: GuestUserWhereInput;
        orderBy?: { createdAt: 'desc' | 'asc' };
        skip?: number;
        take?: number;
    }): Promise<GuestUserRow[]>;
    findFirst(args: {
        where?: GuestUserWhereInput;
        select?: { id: true };
    }): Promise<GuestUserRow | null>;
    count(args: { where?: GuestUserWhereInput }): Promise<number>;
    updateMany(args: {
        where: GuestUserWhereInput;
        data: GuestUserUpdateInput;
    }): Promise<{ count: number }>;
};

export type GuestUserPrismaAccessor = {
    guestUser: GuestUserDelegate;
};
