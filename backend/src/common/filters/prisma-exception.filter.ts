import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const mapped = this.mapPrismaError(exception);
    response.status(mapped.getStatus()).json({
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
        return new ConflictException('Registro duplicado para os dados informados');
      case 'P2003':
        return new BadRequestException('Referência inválida em um dos campos relacionados');
      case 'P2025':
        return new NotFoundException('Registro não encontrado');
      default:
        return new BadRequestException('Erro ao processar operação no banco de dados');
    }
  }
}
