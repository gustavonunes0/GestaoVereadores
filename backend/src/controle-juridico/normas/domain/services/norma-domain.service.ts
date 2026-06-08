export class NormaDomainService {
    assertTipoExists(exists: boolean) {
        if (!exists) {
            throw new Error('Tipo de norma não encontrado');
        }
    }

    assertAnoExists(exists: boolean) {
        if (!exists) {
            throw new Error('Ano não encontrado');
        }
    }

    assertEsferaExists(exists: boolean) {
        if (!exists) {
            throw new Error('Esfera de federação não encontrada');
        }
    }

    assertIdentificadorExists(exists: boolean) {
        if (!exists) {
            throw new Error('Identificador de norma não encontrado');
        }
    }

    assertNormaFound(norma: unknown) {
        if (!norma) {
            throw new Error('Norma não encontrada');
        }
    }
}
