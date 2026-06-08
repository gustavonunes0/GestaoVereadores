export abstract class ActiveParliamentarianChecker {
    abstract hasActiveParliamentarian(
        tenantId: string,
        tenantUserId: string,
    ): Promise<boolean>;
}
