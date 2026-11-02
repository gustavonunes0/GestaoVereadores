import { UnprocessableEntityException } from '@nestjs/common';
import { CreateParliamentarianUseCase } from './create-parliamentarian.use-case';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
    buildParlamentarianUserRepositoryMock,
    buildPoliticalPartyRepositoryMock,
} from './__tests__/parliamentarian-test.helpers';

describe('CreateParliamentarianUseCase — enquadramento de foto', () => {
    const parliamentarianRepository = buildParliamentarianRepositoryMock();
    const parlamentarianUserRepository = buildParlamentarianUserRepositoryMock();
    const politicalPartyRepository = buildPoliticalPartyRepositoryMock();
    const userRepository = {
        findByCpf: jest.fn(),
        findByEmail: jest.fn(),
        create: jest.fn(),
    };
    const passwordHasher = { hash: jest.fn().mockResolvedValue('hash') };

    const useCase = new CreateParliamentarianUseCase(
        parliamentarianRepository as never,
        parlamentarianUserRepository as never,
        userRepository as never,
        passwordHasher as never,
        politicalPartyRepository as never,
    );

    beforeEach(() => {
        jest.clearAllMocks();
        parliamentarianRepository.create.mockResolvedValue(
            buildParliamentarianWithRelations(),
        );
        parliamentarianRepository.findById.mockResolvedValue(
            buildParliamentarianWithRelations(),
        );
        userRepository.findByCpf.mockResolvedValue(null);
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.create.mockResolvedValue({ id: 'user-new' });
        parlamentarianUserRepository.findActiveByParliamentarianId.mockResolvedValue(
            null,
        );
        parlamentarianUserRepository.create.mockResolvedValue(undefined);
    });

    it('rejeita foto sem enquadramento confirmado (422)', async () => {
        await expect(
            useCase.execute('tenant-1', {
                cpf: '529.982.247-25',
                password: 'senha1234',
                parliamentaryName: 'Teste',
                photoUrl: 'data:image/jpeg;base64,abc',
            } as never),
        ).rejects.toBeInstanceOf(UnprocessableEntityException);
        expect(parliamentarianRepository.create).not.toHaveBeenCalled();
    });

    it('aceita foto com enquadramento confirmado', async () => {
        await useCase.execute('tenant-1', {
            cpf: '529.982.247-25',
            password: 'senha1234',
            parliamentaryName: 'Teste',
            photoUrl: 'data:image/jpeg;base64,abc',
            photoPosX: 45,
            photoPosY: 28,
            photoZoom: 1.2,
            photoPositionConfirmed: true,
        } as never);

        expect(parliamentarianRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                photoUrl: 'data:image/jpeg;base64,abc',
                photoPosX: 45,
                photoPosY: 28,
                photoZoom: 1.2,
                photoPositionConfirmed: true,
            }),
        );
    });
});
