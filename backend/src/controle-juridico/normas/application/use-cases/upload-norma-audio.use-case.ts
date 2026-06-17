import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';
import type { MultipartFile } from '@fastify/multipart';
import { NormaRepository } from '../../domain/repositories/norma.repository';
import { NormaNotFoundError } from '../errors/norma.errors';
import { NormaViewModel } from '../view-models/norma.view-model';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.ogg']);
const ALLOWED_MIME_TYPES = new Set([
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/ogg',
]);

@Injectable()
export class UploadNormaAudioUseCase {
    constructor(private readonly normaRepository: NormaRepository) {}

    async execute(
        tenantId: string,
        normaId: string,
        file: MultipartFile | undefined,
    ) {
        if (!file) {
            throw new BadRequestException('Arquivo de áudio é obrigatório');
        }

        const extension = extname(file.filename).toLowerCase();
        if (
            !ALLOWED_EXTENSIONS.has(extension) ||
            !ALLOWED_MIME_TYPES.has(file.mimetype)
        ) {
            throw new BadRequestException(
                'Formato inválido. Envie MP3, WAV, M4A ou OGG.',
            );
        }

        const existing = await this.normaRepository.findById(tenantId, normaId);
        if (!existing) {
            throw new NormaNotFoundError();
        }

        const uploadDir = join(process.cwd(), 'uploads', 'normas', tenantId);
        await mkdir(uploadDir, { recursive: true });

        const storedName = `${normaId}-audio${extension}`;
        const absolutePath = join(uploadDir, storedName);
        await pipeline(file.file, createWriteStream(absolutePath));

        const audioUrl = `/uploads/normas/${tenantId}/${storedName}`;
        const updated = await this.normaRepository.update(tenantId, normaId, {
            audioUrl,
        });

        return NormaViewModel.toHttp(updated);
    }
}
