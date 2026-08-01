import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PdfGeneratorService } from '../../../../common/pdf/pdf-generator.service';
import { listaPresencaTemplate } from '../../../../common/pdf/templates/lista-presenca.template';
import { GetResumoPublicoSessaoUseCase } from './get-resumo-publico-sessao.use-case';

@Injectable()
export class GetListaPresencaPdfUseCase {
    constructor(
        private readonly getResumoPublico: GetResumoPublicoSessaoUseCase,
        private readonly pdfGenerator: PdfGeneratorService,
        private readonly prisma: PrismaService,
    ) {}

    async execute(sessaoId: string): Promise<Buffer> {
        const dados = await this.getResumoPublico.buscarDados(sessaoId);
        const sessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId },
            select: { dataInicio: true },
        });

        const html = listaPresencaTemplate({
            sessaoTitulo: dados.sessaoTitulo,
            dataInicio: sessao?.dataInicio ?? new Date(),
            presencas: dados.presencas,
        });

        return this.pdfGenerator.gerarDeHtml(html);
    }
}
