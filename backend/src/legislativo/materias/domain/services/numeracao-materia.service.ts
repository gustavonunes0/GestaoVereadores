/** Valida se um número de matéria é positivo e inteiro. */
export class NumeracaoMateriaService {
    validarNumero(numero: number): void {
        if (!Number.isInteger(numero) || numero <= 0) {
            throw new Error('Número da matéria deve ser um inteiro positivo');
        }
    }
}
