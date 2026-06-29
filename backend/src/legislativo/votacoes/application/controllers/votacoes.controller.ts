import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    ListResultadoValoresUseCase,
} from '../use-cases/resultado.use-case';
import { ListVotacaoTiposUseCase } from '../use-cases/votacao.use-case';
import { ListVotoValoresUseCase } from '../use-cases/voto.use-case';

@ApiTags('votacoes')
@ApiBearerAuth()
@Controller('legislative/votacoes')
export class VotacoesController {
    constructor(
        private readonly listVotacaoTipos: ListVotacaoTiposUseCase,
        private readonly listVotoValores: ListVotoValoresUseCase,
        private readonly listResultadoValores: ListResultadoValoresUseCase,
    ) {}

    @Get('tipos')
    listTipos() {
        return this.listVotacaoTipos.execute();
    }

    @Get('votos/valores')
    listValoresVoto() {
        return this.listVotoValores.execute();
    }

    @Get('resultados/valores')
    listValoresResultado() {
        return this.listResultadoValores.execute();
    }
}
