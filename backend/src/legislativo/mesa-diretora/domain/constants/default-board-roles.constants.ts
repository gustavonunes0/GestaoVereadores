export const DEFAULT_BOARD_ROLE_NAMES = [
    'Presidente',
    'Vice-Presidente',
    'Primeiro Secretário',
    'Segundo Secretário',
] as const;

export type DefaultBoardRoleName = (typeof DEFAULT_BOARD_ROLE_NAMES)[number];
