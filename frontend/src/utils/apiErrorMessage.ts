import { ApiError } from '../api/client';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Dados inválidos. Verifique os campos e tente novamente.',
  401: 'Sessão expirada ou credenciais inválidas.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  409: 'Conflito: a operação viola uma regra de negócio ou já existe um registro semelhante.',
};

export function getApiErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof ApiError) {
    const prefix = STATUS_MESSAGES[error.status];
    if (error.message && error.message !== `Erro ${error.status}`) {
      return prefix ? `${prefix} ${error.message}` : error.message;
    }
    return prefix ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
