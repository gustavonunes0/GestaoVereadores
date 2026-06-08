import { Injectable } from '@nestjs/common';
import { AgendaViewModel } from '../view-models/agenda.view-model';

@Injectable()
export class ListAgendaTiposUseCase {
    execute() {
        return AgendaViewModel.listEventTypes();
    }
}
