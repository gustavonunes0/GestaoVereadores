import { AutorResolverService } from './autor-resolver.service';

describe('AutorResolverService', () => {
    let service: AutorResolverService;

    beforeEach(() => {
        service = new AutorResolverService();
    });

    describe('validar()', () => {
        it('lança erro quando zero FKs preenchidas', () => {
            expect(() =>
                service.validar({
                    parlamentarId: null,
                    parliamentarianId: null,
                    autorExternoId: null,
                    guestUserId: null,
                }),
            ).toThrow('exatamente uma referência é obrigatória');
        });

        it('lança erro quando duas FKs preenchidas', () => {
            expect(() =>
                service.validar({
                    parlamentarId: 'parl-1',
                    parliamentarianId: 'new-parl-1',
                    autorExternoId: null,
                    guestUserId: null,
                }),
            ).toThrow('exatamente uma referência é obrigatória');
        });

        it('não lança erro quando exatamente uma FK preenchida', () => {
            expect(() =>
                service.validar({
                    parlamentarId: null,
                    parliamentarianId: 'new-parl-1',
                    autorExternoId: null,
                    guestUserId: null,
                }),
            ).not.toThrow();
        });
    });

    describe('resolverNomeCompleto()', () => {
        it('Categoria A — retorna apenas o nome quando sem cargo', () => {
            expect(
                service.resolverNomeCompleto({ nome: 'Frente Parlamentar da Saúde' }),
            ).toBe('Frente Parlamentar da Saúde');
        });

        it('Categoria B — compõe nome — cargo (instituição)', () => {
            expect(
                service.resolverNomeCompleto({
                    nome: 'João Silva',
                    cargo: 'Secretário de Educação',
                    instituicao: 'Prefeitura de Juazeiro do Norte',
                }),
            ).toBe('João Silva — Secretário de Educação (Prefeitura de Juazeiro do Norte)');
        });

        it('Categoria C — compõe nome — cargo (registro) quando registro preenchido', () => {
            expect(
                service.resolverNomeCompleto({
                    nome: 'Maria Costa',
                    cargo: 'Advogada',
                    registro: 'OAB/CE 12345',
                    instituicao: 'OAB Ceará',
                }),
            ).toBe('Maria Costa — Advogada (OAB/CE 12345)');
        });

        it('retorna nome — cargo quando cargo preenchido mas sem instituição e registro', () => {
            expect(
                service.resolverNomeCompleto({
                    nome: 'Pedro Alves',
                    cargo: 'Procurador',
                }),
            ).toBe('Pedro Alves — Procurador');
        });
    });
});
