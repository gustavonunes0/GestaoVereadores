export abstract class ActiveParliamentarianMandateChecker {
    abstract hasActiveMandate(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ): Promise<boolean>;
}
