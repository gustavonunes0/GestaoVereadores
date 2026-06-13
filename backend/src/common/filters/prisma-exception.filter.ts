import {
    ArgumentsHost,
    Catch,
    ConflictException,
    ExceptionFilter,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FastifyReply } from 'fastify';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(
        exception: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const response = host.switchToHttp().getResponse<FastifyReply>();

        const mapped = this.mapPrismaError(exception);
        void response.status(mapped.getStatus()).send({
            statusCode: mapped.getStatus(),
            message: mapped.message,
            error: mapped.name,
        });
    }

    private mapPrismaError(
        exception: Prisma.PrismaClientKnownRequestError,
    ): ConflictException | NotFoundException | BadRequestException {
        switch (exception.code) {
            case 'P2002':
                return new ConflictException(
                    'Registro duplicado para os dados informados',
                );
            case 'P2003':
                return new BadRequestException(
                    'Referência inválida em um dos campos relacionados',
                );
            case 'P2025':
                return new NotFoundException('Registro não encontrado');
            default:
                return new BadRequestException(
                    'Erro ao processar operação no banco de dados',
                );
        }
    }
}
