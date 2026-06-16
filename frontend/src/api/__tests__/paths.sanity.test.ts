import { API_PATHS } from '../paths';

describe('API_PATHS sanity', () => {
    it('todos os paths estáticos começam com /', () => {
        Object.entries(API_PATHS).forEach(([key, value]) => {
            if (typeof value === 'string') {
                expect(value).toMatch(/^\//);
                if (!value.startsWith('/')) {
                    throw new Error(`${key}: "${value}" deve começar com /`);
                }
            }
        });
    });

    it('paths de funções retornam string com id embutido', () => {
        expect(API_PATHS.materiasTramitar('abc')).toBe('/legislative/materias/abc/tramitar');
        expect(API_PATHS.sessoesAbrir('xyz')).toBe('/legislative/sessoes-plenarias/xyz/abrir');
        expect(API_PATHS.normasSancao('123')).toBe('/normas/123/sancao');
        expect(API_PATHS.votacoesEncerrar('v1')).toBe('/legislative/votacoes/v1/encerrar');
        expect(API_PATHS.agendaVincularSessao('ag1')).toBe('/legislative/agenda-legislativa/ag1/vincular-sessao');
    });
});
