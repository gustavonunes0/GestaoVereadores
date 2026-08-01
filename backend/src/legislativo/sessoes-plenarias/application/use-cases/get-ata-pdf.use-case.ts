import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PdfGeneratorService } from '../../../../common/pdf/pdf-generator.service';
import { ataSessaoTemplate } from '../../../../common/pdf/templates/ata-sessao.template';
import { STATUS_ATA_LABELS } from '../../ata/domain/enums/status-ata.enum';
import { StatusAta } from '../../ata/domain/enums/status-ata.enum';

/**
 * Rota pública — busca só por `sessaoPlenariaId` (unique, não enumerável), sem filtro de
 * tenant, mesmo padrão de `GetResumoPublicoSessaoUseCase`. Só serve Ata `APROVADA`/`PUBLICADA`
 * — nunca vaza rascunho.
 */
@Injectable()
export class GetAtaPdfUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly pdfGenerator: PdfGeneratorService,
    ) {}

    async execute(sessaoId: string): Promise<Buffer> {
        const ata = await this.prisma.ata.findFirst({
            where: {
                sessaoPlenariaId: sessaoId,
                isRemoved: false,
                status: { in: ['APROVADA', 'PUBLICADA'] },
            },
        });
        if (!ata) throw new NotFoundException('Ata não encontrada ou ainda não aprovada');

        const html = ataSessaoTemplate(
            ata.conteudo,
            STATUS_ATA_LABELS[ata.status as unknown as StatusAta],
        );
        return this.pdfGenerator.gerarDeHtml(html);
    }
}
