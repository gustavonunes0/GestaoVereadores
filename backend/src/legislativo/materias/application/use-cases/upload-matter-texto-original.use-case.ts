import {
    BadRequestException,
    Inject,
    Injectable,
} from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';
import type { MultipartFile } from '@fastify/multipart';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

@Injectable()
export class UploadMatterTextoOriginalUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        file: MultipartFile | undefined,
    ) {
        if (!file) {
            throw new BadRequestException('Arquivo texto original é obrigatório');
        }

        const extension = extname(file.filename).toLowerCase();
        if (
            !ALLOWED_EXTENSIONS.has(extension) ||
            !ALLOWED_MIME_TYPES.has(file.mimetype)
        ) {
            throw new BadRequestException(
                'Formato inválido. Envie PDF, DOC ou DOCX.',
            );
        }

        await this.repository.findOne(tenantId, matterId);

        const uploadDir = join(
            process.cwd(),
            'uploads',
            'materias',
            tenantId,
        );
        await mkdir(uploadDir, { recursive: true });

        const storedName = `${matterId}${extension}`;
        const absolutePath = join(uploadDir, storedName);
        await pipeline(file.file, createWriteStream(absolutePath));

        const textoOriginalUrl = `/uploads/materias/${tenantId}/${storedName}`;
        const updated = await this.repository.update(tenantId, matterId, {
            textoOriginalUrl,
        });

        return MatterViewModel.toHttp(updated as MateriaPrismaPayload);
    }
}
