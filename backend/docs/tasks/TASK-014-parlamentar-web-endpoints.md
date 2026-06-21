# TASK-014 — Parlamentar na Plataforma Web: /materias/minhas, /me/perfil, /me/biografia

**Spec de referência:** `backend/docs/specs/parlamentares/SPEC-007-patch-parlamentar-web.md`
**Depende de:** TASK-007 (ParlamentarianUser + ParlamentarianGuard), TASK-001b (Matérias)
**Módulo:** `src/legislativo/materias/` + `src/legislativo/parlamentares/`

> Três endpoints exclusivos do parlamentar logado na plataforma web.
> Todos usam `ParlamentarianGuard` e identificam o parlamentar pelo JWT
> — nunca por parâmetro de URL ou body.

---

## Fase 1 — Endpoint `GET /legislative/materias/minhas`

### T-01 · `ListMinhasMateriasUseCase`

```ts
// src/legislativo/materias/application/use-cases/list-minhas-materias.use-case.ts

@Injectable()
export class ListMinhasMateriasUseCase {
  constructor(private readonly materiaRepo: MateriaRepository) {}

  async execute(
    parliamentarianId: string,
    tenantId: string,
    filtros: MinhasMateriasQueryDto,
  ) {
    return this.materiaRepo.findMinhas(parliamentarianId, tenantId, filtros);
  }
}
```

### T-02 · DTO de filtros

```ts
// list-minhas-materias-query.dto.ts
export class MinhasMateriasQueryDto {
  @IsOptional() @IsString() tipoId?: string;
  @IsOptional() @IsEnum(StatusMateria) status?: StatusMateria;
  @IsOptional() @IsDateString() dataInicio?: string;
  @IsOptional() @IsDateString() dataFim?: string;
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) @Max(50) limit?: number = 20;
}
```

### T-03 · Método `findMinhas` no `PrismaMateriaRepository`

```ts
// infra/prisma/prisma-materia.repository.ts

async findMinhas(
  parliamentarianId: string,
  tenantId: string,
  filtros: MinhasMateriasQueryDto,
) {
  const where: Prisma.MateriaWhereInput = {
    tenantId,
    isRemoved: false,
    // Matérias onde o parlamentar participa como autor, coautor ou relator
    autores: {
      some: {
        parliamentarianId,
        papel: { in: ['AUTOR', 'COAUTOR', 'RELATOR'] },
      },
    },
    // Filtros opcionais
    ...(filtros.tipoId && { tipoId: filtros.tipoId }),
    ...(filtros.status && { status: filtros.status }),
    ...(filtros.dataInicio || filtros.dataFim
      ? {
          createdAt: {
            ...(filtros.dataInicio && { gte: new Date(filtros.dataInicio) }),
            ...(filtros.dataFim && { lte: new Date(filtros.dataFim) }),
          },
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    this.prisma.materia.findMany({
      where,
      include: {
        tipo: true,
        autores: {
          where: { parliamentarianId },  // incluir apenas o papel do parlamentar logado
          include: { tipoAutor: true },
        },
        tramitacaoHistorico: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: ((filtros.page ?? 1) - 1) * (filtros.limit ?? 20),
      take: filtros.limit ?? 20,
    }),
    this.prisma.materia.count({ where }),
  ]);

  return {
    data: data.map(m => MateriaMapper.toDomain(m)),
    meta: {
      total,
      page: filtros.page ?? 1,
      limit: filtros.limit ?? 20,
      totalPages: Math.ceil(total / (filtros.limit ?? 20)),
    },
  };
}
```

### T-04 · Endpoint no `MateriasController`

```ts
// controllers/materias.controller.ts

@Get('minhas')
@UseGuards(...PARLAMENTAR_GUARDS)
async minhas(
  @Query() filtros: MinhasMateriasQueryDto,
  @CurrentUser() user: ParlamentarianJwtPayload,
) {
  const result = await this.listMinhasMateriasUseCase.execute(
    user.parliamentarianId, // do JWT — nunca do query param
    user.tenantId,
    filtros,
  );
  return {
    data: result.data.map(m => MateriaViewModel.toHttp(m)),
    meta: result.meta,
  };
}
```

> ⚠️ A rota `GET /materias/minhas` deve ser registrada **antes** de
> `GET /materias/:id` no controller para o Nest não interpretar "minhas"
> como um UUID de matéria.

---

## Fase 2 — Endpoint `PATCH /legislative/parlamentares/me/perfil`

### T-05 · DTO

```ts
// update-meu-perfil.dto.ts
export class UpdateMeuPerfilDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(100)
  parliamentaryName?: string;

  @IsOptional() @IsUrl()
  photoUrl?: string;

  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(20)
  telefone?: string;

  @IsOptional() @IsString() @MaxLength(100)
  gabinete?: string;

  // NUNCA aceitar: partido, mandatos, status, tenantId
}
```

### T-06 · `UpdateMeuPerfilUseCase`

```ts
// src/legislativo/parlamentares/application/use-cases/update-meu-perfil.use-case.ts

@Injectable()
export class UpdateMeuPerfilUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    parliamentarianId: string,
    tenantId: string,
    dto: UpdateMeuPerfilDto,
  ) {
    const parl = await this.prisma.parliamentarian.findFirst({
      where: { id: parliamentarianId, tenantId, isRemoved: false },
    });
    if (!parl) throw new NotFoundException('Parlamentar não encontrado');

    // Atualizar apenas campos do próprio parlamentar
    return this.prisma.parliamentarian.update({
      where: { id: parliamentarianId },
      data: {
        ...(dto.parliamentaryName && { parliamentaryName: dto.parliamentaryName }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.gabinete !== undefined && { officeNumber: dto.gabinete }),
      },
    });

    // Se email ou telefone precisam ser atualizados, atualizar o User vinculado:
    if (dto.email || dto.telefone) {
      const parlUser = await this.prisma.parliamentarianUser.findFirst({
        where: { parliamentarianId, isRemoved: false },
      });
      if (parlUser) {
        await this.prisma.user.update({
          where: { id: parlUser.userId },
          data: {
            ...(dto.email && { email: dto.email }),
          },
        });
      }
    }
  }
}
```

### T-07 · Endpoint no `ParlamentaresController`

```ts
@Patch('me/perfil')
@UseGuards(...PARLAMENTAR_GUARDS)
async updateMeuPerfil(
  @Body() dto: UpdateMeuPerfilDto,
  @CurrentUser() user: ParlamentarianJwtPayload,
) {
  return this.updateMeuPerfilUseCase.execute(
    user.parliamentarianId,
    user.tenantId,
    dto,
  );
}
```

---

## Fase 3 — Endpoint `PATCH /legislative/parlamentares/me/biografia`

### T-08 · DTO

```ts
// update-minha-biografia.dto.ts
export class UpdateMinhaBiografiaDto {
  @IsString()
  @MinLength(0)
  @MaxLength(5000)
  biografia: string;
}
```

### T-09 · `UpdateMinhaBiografiaUseCase`

```ts
// update-minha-biografia.use-case.ts

@Injectable()
export class UpdateMinhaBiografiaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    parliamentarianId: string,
    tenantId: string,
    dto: UpdateMinhaBiografiaDto,
  ) {
    const parl = await this.prisma.parliamentarian.findFirst({
      where: { id: parliamentarianId, tenantId, isRemoved: false },
    });
    if (!parl) throw new NotFoundException('Parlamentar não encontrado');

    return this.prisma.parliamentarian.update({
      where: { id: parliamentarianId },
      data: { biography: dto.biografia },
    });
  }
}
```

### T-10 · Endpoint no `ParlamentaresController`

```ts
@Patch('me/biografia')
@UseGuards(...PARLAMENTAR_GUARDS)
async updateMinhaBiografia(
  @Body() dto: UpdateMinhaBiografiaDto,
  @CurrentUser() user: ParlamentarianJwtPayload,
) {
  return this.updateMinhaBiografiaUseCase.execute(
    user.parliamentarianId,
    user.tenantId,
    dto,
  );
}
```

---

## Fase 4 — View Model atualizado

### T-11 · `MateriaViewModel.toHttp` com campo `meuPapel`

Para `GET /materias/minhas`, adicionar o papel do parlamentar no response:

```ts
// materia.view-model.ts — adicionar método específico:
static toHttpMinhas(materia: Materia, papel: PapelAutorMateria) {
  return {
    ...MateriaViewModel.toHttp(materia),
    meuPapel: papel, // 'AUTOR' | 'COAUTOR' | 'RELATOR'
  };
}
```

---

## Fase 5 — Registrar no módulo

### T-12 · Registrar novos use cases

```ts
// parlamentares.module.ts — adicionar:
providers: [
  // ... providers existentes
  UpdateMeuPerfilUseCase,
  UpdateMinhaBiografiaUseCase,
],

// materias.module.ts — adicionar:
providers: [
  // ... providers existentes
  ListMinhasMateriasUseCase,
],
```

---

## Fase 6 — Testes

### T-13 · Testes dos endpoints

- [ ] `GET /materias/minhas` com parlamentar que é autor → retorna as matérias com `meuPapel: 'AUTOR'`
- [ ] `GET /materias/minhas` com parlamentar que é relator → retorna com `meuPapel: 'RELATOR'`
- [ ] `GET /materias/minhas` sem matérias → retorna `{ data: [], meta: { total: 0 } }`
- [ ] Matérias de outro parlamentar NÃO aparecem
- [ ] Staff tenta `GET /materias/minhas` → 403
- [ ] `PATCH /me/perfil` atualiza `parliamentaryName` → 200
- [ ] `PATCH /me/perfil` com campo `partido` no body → campo ignorado (não atualiza)
- [ ] `PATCH /me/biografia` com texto de 5001 chars → 400 em PT-BR
- [ ] `PATCH /me/biografia` com texto vazio → 200 (limpa a biografia)
- [ ] Staff tenta `PATCH /me/perfil` → 403

> **Nota:** testes unitários dos use cases ainda pendentes (T-13)

---

## Checklist final

- [x] `GET /materias/minhas` funciona com ParlamentarianGuard
- [x] `parliamentarianId` vem do JWT — nunca do query param
- [ ] Campo `meuPapel` no response de cada matéria (pendente — T-11 não implementado)
- [x] Rota `minhas` registrada ANTES de `/:id` no controller
- [x] `PATCH /me/perfil` não aceita `partido`, `status`, `mandatos` no body
- [x] `PATCH /me/biografia` respeita limite de 5000 chars
- [x] `npx tsc --noEmit` → zero erros
- [x] `npx jest` → todos passando
