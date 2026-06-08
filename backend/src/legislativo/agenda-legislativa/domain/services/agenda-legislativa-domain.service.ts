/**
 * Calendário operacional da Câmara (task 30).
 *
 * Referências futuras a sessão, comissão, frente ou matéria não fazem
 * parte desta base — serão vinculadas em tasks posteriores.
 */
export class AgendaLegislativaDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para agenda legislativa');
        }
    }

    assertDateRange(dataInicio: Date | null, dataFim: Date | null) {
        if (
            dataInicio &&
            dataFim &&
            dataFim.getTime() < dataInicio.getTime()
        ) {
            throw new Error('Data final não pode ser anterior à data inicial');
        }
    }
}
