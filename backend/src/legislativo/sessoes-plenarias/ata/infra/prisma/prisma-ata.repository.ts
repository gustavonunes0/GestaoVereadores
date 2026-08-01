import { Injectable } from '@nestjs/common';
import { StatusAta as PrismaStatusAta } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { AtaEntity } from '../../domain/entities/ata.entity';
import { StatusAta } from '../../domain/enums/status-ata.enum';
import { AtaRepository, CreateAtaData, UpdateAtaData } from '../../domain/repositories/ata.repository';

type RawAta = {
    id: string;
    tenantId: string;
    sessaoPlenariaId: string;
    status: PrismaStatusAta;
    conteudo: string;
    geradaAutomaticamente: boolean;
    aprovadaEm: Date | null;
    aprovadaPorId: string | null;
    pdfUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
};

function toEntity(raw: RawAta): AtaEntity {
    const entity = new AtaEntity();
    entity.id = raw.id;
    entity.tenantId = raw.tenantId;
    entity.sessaoPlenariaId = raw.sessaoPlenariaId;
    entity.status = raw.status as unknown as StatusAta;
    entity.conteudo = raw.conteudo;
    entity.geradaAutomaticamente = raw.geradaAutomaticamente;
    entity.aprovadaEm = raw.aprovadaEm;
    entity.aprovadaPorId = raw.aprovadaPorId;
    entity.pdfUrl = raw.pdfUrl;
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    return entity;
}

@Injectable()
export class PrismaAtaRepository extends AtaRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findBySessaoId(sessaoPlenariaId: string, tenantId: string): Promise<AtaEntity | null> {
        const raw = await this.prisma.ata.findFirst({
            where: { sessaoPlenariaId, tenantId, isRemoved: false },
        });
        return raw ? toEntity(raw) : null;
    }

    async findById(id: string, tenantId: string): Promise<AtaEntity | null> {
        const raw = await this.prisma.ata.findFirst({
            where: { id, tenantId, isRemoved: false },
        });
        return raw ? toEntity(raw) : null;
    }

    async create(dados: CreateAtaData): Promise<AtaEntity> {
        const raw = await this.prisma.ata.create({
            data: {
                tenantId: dados.tenantId,
                sessaoPlenariaId: dados.sessaoPlenariaId,
                conteudo: dados.conteudo,
                geradaAutomaticamente: dados.geradaAutomaticamente,
            },
        });
        return toEntity(raw);
    }

    async update(id: string, dados: UpdateAtaData): Promise<AtaEntity> {
        const raw = await this.prisma.ata.update({
            where: { id },
            data: {
                conteudo: dados.conteudo,
                status: dados.status as unknown as PrismaStatusAta | undefined,
                aprovadaEm: dados.aprovadaEm,
                aprovadaPorId: dados.aprovadaPorId,
                pdfUrl: dados.pdfUrl,
            },
        });
        return toEntity(raw);
    }
}
