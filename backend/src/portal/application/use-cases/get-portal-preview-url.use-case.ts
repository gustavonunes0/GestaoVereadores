import { Injectable } from '@nestjs/common';

@Injectable()
export class GetPortalPreviewUrlUseCase {
    build(slug: string): string {
        const base = this.resolveFrontendBaseUrl();
        return `${base}/portal/${slug}`;
    }

    execute(slug: string) {
        return { url: this.build(slug) };
    }

    private resolveFrontendBaseUrl(): string {
        const fromEnv =
            process.env.PORTAL_FRONTEND_URL?.trim() ||
            process.env.CORS_ORIGIN?.split(',')[0]?.trim();
        return fromEnv || 'http://localhost:8080';
    }
}
