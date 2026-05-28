import { NotFoundException } from '@nestjs/common';

export function assertFound<T>(entity: T | null | undefined, message: string): T {
  if (entity == null) {
    throw new NotFoundException(message);
  }
  return entity;
}
