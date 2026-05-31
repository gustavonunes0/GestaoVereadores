/** Filtro base para entidades legislativas com isolamento por câmara. */
export function tenantWhere(tenantId: string) {
  return { tenantId, isRemoved: false };
}
