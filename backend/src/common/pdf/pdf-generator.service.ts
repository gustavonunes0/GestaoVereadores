import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

export type PdfOpcoes = {
    formato?: 'A4' | 'Letter';
    paisagem?: boolean;
};

/**
 * Único ponto de geração de PDF do projeto — reusado por Ata, Lista de Presença e
 * Relatórios (ver ADR-012). Mantém um único browser Puppeteer vivo entre chamadas
 * em vez de abrir/fechar um processo Chromium por request.
 */
@Injectable()
export class PdfGeneratorService implements OnModuleDestroy {
    private readonly logger = new Logger(PdfGeneratorService.name);
    private browserPromise: Promise<Browser> | null = null;

    private async getBrowser(): Promise<Browser> {
        if (!this.browserPromise) {
            this.browserPromise = puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }
        return this.browserPromise;
    }

    async gerarDeHtml(html: string, opcoes?: PdfOpcoes): Promise<Buffer> {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            await page.setContent(html, { waitUntil: 'load' });
            const pdf = await page.pdf({
                format: opcoes?.formato ?? 'A4',
                landscape: opcoes?.paisagem ?? false,
                printBackground: true,
                margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
            });
            return Buffer.from(pdf);
        } finally {
            await page.close();
        }
    }

    async onModuleDestroy() {
        if (this.browserPromise) {
            try {
                const browser = await this.browserPromise;
                await browser.close();
            } catch (error) {
                this.logger.warn(`Falha ao fechar o browser do Puppeteer: ${error}`);
            }
        }
    }
}
