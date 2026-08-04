import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { MatterViewModel } from '../view-models/matter.view-model';
import { MinhasMateriasQueryDto } from '../dto/list-minhas-materias-query.dto';

@Injectable()
export class ListMinhasMateriasUseCase {
    constructor(private readonly prisma: PrismaService) {}

    async execute(parliamentarianId: string, tenantId: string, filtros: MinhasMateriasQueryDto) {
        const page = filtros.page ?? 1;
        const limit = filtros.limit ?? 20;

        const where = {
            tenantId,
            isRemoved: false,
            OR: [
                { authorParliamentarianId: parliamentarianId },
                { matterCoauthors: { some: { parliamentarianId } } },
                { autor: { parliamentarianId } },
            ],
            ...(filtros.tipoId && { tipoId: filtros.tipoId }),
            ...(filtros.status && { status: filtros.status }),
            ...((filtros.dataInicio || filtros.dataFim) && {
                createdAt: {
                    ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
                    ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
                },
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.materia.findMany({
                where,
                include: {
                    tipo: true,
                    ano: true,
                    autor: {
                        include: {
                            tenantPartner: {
                                select: {
                                    id: true,
                                    nome: true,
                                    cargo: true,
                                    instituicao: true,
                                    tenantPartnerUser: {
                                        select: {
                                            user: {
                                                select: {
                                                    firstName: true,
                                                    lastName: true,
                                                    profilePicture: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    authorParliamentarian: {
                        include: {
                            parliamentarianUser: {
                                include: { politicalParty: true },
                            },
                        },
                    },
                    rapporteurParliamentarian: {
                        include: {
                            parliamentarianUser: {
                                include: { politicalParty: true },
                            },
                        },
                    },
                    matterCoauthors: {
                        include: {
                            parliamentarian: {
                                include: {
                                    parliamentarianUser: {
                                        include: { politicalParty: true },
                                    },
                                },
                            },
                            tenantPartner: {
                                select: {
                                    id: true,
                                    nome: true,
                                    tipoAutorId: true,
                                    tenantPartnerUser: {
                                        select: {
                                            user: {
                                                select: {
                                                    firstName: true,
                                                    lastName: true,
                                                    profilePicture: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.materia.count({ where }),
        ]);

        return {
            data: data.map(m => MatterViewModel.toHttp(m as any)),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
