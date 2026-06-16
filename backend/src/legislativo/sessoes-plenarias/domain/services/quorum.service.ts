import { UnprocessableEntityException } from '@nestjs/common';
import { QuorumInfo } from '../repositories/sessao-plenaria.repository';

export class QuorumService {
    calcularMinimo(totalParlamentares: number): number {
        return Math.ceil(totalParlamentares / 2) + 1;
    }

    verificarAtual(presentes: number, total: number): QuorumInfo {
        const quorumMinimo = this.calcularMinimo(total);
        return {
            quorumMinimo,
            quorumPresente: presentes,
            temQuorum: presentes >= quorumMinimo,
        };
    }

    assertTemQuorum(info: QuorumInfo): void {
        if (!info.temQuorum) {
            throw new UnprocessableEntityException(
                `Quórum insuficiente: ${info.quorumPresente} presentes, mínimo ${info.quorumMinimo}`,
            );
        }
    }
}
