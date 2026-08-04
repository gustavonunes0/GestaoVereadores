import { NotFoundException } from '@nestjs/common';
import { MatterNotFoundError } from '../errors/matter.errors';

/**
 * Converte 404 do repositório em erro de domínio.
 * Propaga demais erros (Prisma, serialização, etc.) para não mascarar 500.
 */
export function rethrowIfMateriaNotFound(error: unknown): never {
    if (error instanceof MatterNotFoundError) {
        throw error;
    }
    if (error instanceof NotFoundException) {
        throw new MatterNotFoundError();
    }
    throw error;
}
