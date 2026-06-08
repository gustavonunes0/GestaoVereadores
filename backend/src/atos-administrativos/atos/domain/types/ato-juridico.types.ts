/**
 * Elementos conceituais do ato administrativo (task 29).
 *
 * No MVP, o schema atual não possui campos dedicados para todos eles;
 * o domínio reconhece o mapeamento operacional abaixo.
 */
export type AtoElementoJuridico =
    | 'COMPETENCIA'
    | 'FINALIDADE'
    | 'FORMA'
    | 'MOTIVO'
    | 'OBJETO';

/** Quem pratica o ato — no MVP, controlado por permissões (@WriteRoles). */
export const ATO_ELEMENTO_COMPETENCIA: AtoElementoJuridico = 'COMPETENCIA';

/** Objetivo administrativo — representado em `mensagem` (opcional no MVP). */
export const ATO_ELEMENTO_FINALIDADE: AtoElementoJuridico = 'FINALIDADE';

/** Formato escrito, numerado e classificado — `tipoId`, `classificacaoId`, `numero`, datas, `mensagem`. */
export const ATO_ELEMENTO_FORMA: AtoElementoJuridico = 'FORMA';

/** Justificativa ou situação de origem — representado em `mensagem`. */
export const ATO_ELEMENTO_MOTIVO: AtoElementoJuridico = 'MOTIVO';

/** Efeito prático do ato — representado em `mensagem`. */
export const ATO_ELEMENTO_OBJETO: AtoElementoJuridico = 'OBJETO';

/**
 * Ato administrativo é distinto de norma jurídica, matéria legislativa,
 * votação e sessão plenária — não possui relação direta com esses agregados.
 */
export const ATO_NATUREZA = 'ADMINISTRATIVO' as const;
