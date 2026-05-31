export type BaseAuditFields = {
    createdAt: Date;
    createdBy: string | null;
    modifiedAt: Date;
    modifiedBy: string | null;
    isRemoved: boolean;
};

type BuildAuditParams = Partial<BaseAuditFields>;

export abstract class BaseEntity {
    protected createdAt: Date;
    protected createdBy: string | null;
    protected modifiedAt: Date;
    protected modifiedBy: string | null;
    protected isRemoved: boolean;

    protected constructor(audit: BaseAuditFields) {
        this.createdAt = audit.createdAt;
        this.createdBy = audit.createdBy;
        this.modifiedAt = audit.modifiedAt;
        this.modifiedBy = audit.modifiedBy;
        this.isRemoved = audit.isRemoved;
    }

    protected static buildAuditFields(
        params: BuildAuditParams = {},
    ): BaseAuditFields {
        const now = new Date();
        return {
            createdAt: params.createdAt ?? now,
            createdBy: params.createdBy ?? null,
            modifiedAt: params.modifiedAt ?? now,
            modifiedBy: params.modifiedBy ?? null,
            isRemoved: params.isRemoved ?? false,
        };
    }

    protected touch(modifiedBy?: string | null): void {
        this.modifiedAt = new Date();
        if (modifiedBy !== undefined) {
            this.modifiedBy = modifiedBy;
        }
    }

    protected markAsRemoved(modifiedBy?: string | null): void {
        this.isRemoved = true;
        this.touch(modifiedBy);
    }

    protected toAuditPrimitives(): BaseAuditFields {
        return {
            createdAt: this.createdAt,
            createdBy: this.createdBy,
            modifiedAt: this.modifiedAt,
            modifiedBy: this.modifiedBy,
            isRemoved: this.isRemoved,
        };
    }
}
