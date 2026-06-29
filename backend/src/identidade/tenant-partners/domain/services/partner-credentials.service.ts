import { randomBytes, randomUUID } from 'crypto';

export class PartnerCredentialsService {
    generateRandomPassword(): string {
        return randomBytes(12).toString('base64').slice(0, 15);
    }

    generatePlaceholderEmail(): string {
        return `partner-${randomUUID()}@no-access.local`;
    }
}
