import { Injectable } from '@nestjs/common';
import { ListPublicAgendaUseCase } from '../../../legislativo/agenda-legislativa/application/use-cases/list-public-agenda.use-case';
import { AgendaHttp } from '../../../legislativo/agenda-legislativa/application/view-models/agenda.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

export type PublicTransmissaoHttp = {
    id: string;
    titulo: string;
    linkTransmissao: string;
    dataInicio?: string;
    dataFim?: string;
    local?: string;
    aoVivo: boolean;
};

@Injectable()
export class GetPublicPortalTransmissaoUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        private readonly listPublicAgenda: ListPublicAgendaUseCase,
    ) {}

    async execute(slug: string) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.transmissao) {
            return { transmissao: null };
        }

        const agenda = await this.listPublicAgenda.execute(record.tenantId, {
            limit: 50,
        });

        const withLink = agenda.data.filter((item) => item.linkTransmissao);
        const selected = this.pickHighlight(withLink);

        if (!selected?.linkTransmissao) {
            return { transmissao: null };
        }

        const now = new Date();
        const inicio = selected.dataInicio
            ? new Date(selected.dataInicio)
            : null;
        const fim = selected.dataFim ? new Date(selected.dataFim) : null;
        const aoVivo =
            !!inicio &&
            inicio <= now &&
            (!fim || fim >= now);

        return {
            transmissao: {
                id: selected.id,
                titulo:
                    selected.titulo ??
                    selected.mensagem ??
                    selected.tipoLabel ??
                    'Transmissão ao vivo',
                linkTransmissao: selected.linkTransmissao,
                ...(selected.dataInicio
                    ? { dataInicio: new Date(selected.dataInicio).toISOString() }
                    : {}),
                ...(selected.dataFim
                    ? { dataFim: new Date(selected.dataFim).toISOString() }
                    : {}),
                ...(selected.local ? { local: selected.local } : {}),
                aoVivo,
            } satisfies PublicTransmissaoHttp,
        };
    }

    private pickHighlight(items: AgendaHttp[]): AgendaHttp | null {
        if (items.length === 0) return null;

        const now = new Date();
        const live = items.find((item) => {
            if (!item.linkTransmissao || !item.dataInicio) return false;
            const start = new Date(item.dataInicio);
            const end = item.dataFim ? new Date(item.dataFim) : null;
            return start <= now && (!end || end >= now);
        });
        if (live) return live;

        const upcoming = items
            .filter(
                (item) =>
                    item.linkTransmissao &&
                    item.dataInicio &&
                    new Date(item.dataInicio) > now,
            )
            .sort(
                (a, b) =>
                    new Date(a.dataInicio!).getTime() -
                    new Date(b.dataInicio!).getTime(),
            )[0];
        if (upcoming) return upcoming;

        return (
            items
                .filter((item) => item.linkTransmissao && item.dataInicio)
                .sort(
                    (a, b) =>
                        new Date(b.dataInicio!).getTime() -
                        new Date(a.dataInicio!).getTime(),
                )[0] ?? items[0]
        );
    }
}
