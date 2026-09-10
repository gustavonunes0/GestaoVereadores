import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { existsSync } from 'fs';
import puppeteer, { Browser } from 'puppeteer';

export type PdfOpcoes = {
    formato?: 'A4' | 'Letter';
    paisagem?: boolean;
    margem?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    /** HTML do cabeçalho Puppeteer (requer displayHeaderFooter). */
    cabecalhoHtml?: string;
    /** HTML do rodapé Puppeteer (requer displayHeaderFooter). */
    rodapeHtml?: string;
};

function resolveChromiumExecutable(): string | undefined {
    const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
    if (fromEnv && existsSync(fromEnv)) return fromEnv;

    const candidates = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
    ];
    return candidates.find((path) => existsSync(path));
}

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
            const executablePath = resolveChromiumExecutable();
            if (executablePath) {
                this.logger.log(`Puppeteer usando Chromium em ${executablePath}`);
            } else {
                this.logger.warn(
                    'PUPPETEER_EXECUTABLE_PATH não encontrado; tentando Chrome empacotado do Puppeteer',
                );
            }

            this.browserPromise = puppeteer
                .launch({
                    headless: true,
                    ...(executablePath ? { executablePath } : {}),
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--font-render-hinting=none',
                    ],
                })
                .catch((error) => {
                    this.browserPromise = null;
                    throw error;
                });
        }
        return this.browserPromise;
    }

    async gerarDeHtml(html: string, opcoes?: PdfOpcoes): Promise<Buffer> {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            await page.setContent(html, { waitUntil: 'load' });
            const comCabRodape = Boolean(
                opcoes?.cabecalhoHtml || opcoes?.rodapeHtml,
            );
            const pdf = await page.pdf({
                format: opcoes?.formato ?? 'A4',
                landscape: opcoes?.paisagem ?? false,
                printBackground: true,
                displayHeaderFooter: comCabRodape,
                headerTemplate: opcoes?.cabecalhoHtml ?? '<div></div>',
                footerTemplate: opcoes?.rodapeHtml ?? '<div></div>',
                margin: {
                    top: opcoes?.margem?.top ?? (comCabRodape ? '32mm' : '20mm'),
                    bottom:
                        opcoes?.margem?.bottom ??
                        (comCabRodape ? '34mm' : '20mm'),
                    left: opcoes?.margem?.left ?? '15mm',
                    right: opcoes?.margem?.right ?? '15mm',
                },
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
