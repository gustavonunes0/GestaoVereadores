# PATTERNS.md — Padrões de Código

Exemplos usando o código real do projeto. Seguir sempre.

---

## 1 — Repository: abstract class no domínio, Prisma na infra

```ts
// domain/repositories/materia.repository.ts
export abstract class MateriaRepository {
  abstract findMany(params: FindManyMateriasParams): Promise<{ data: Materia[]; total: number }>;
  abstract findById(id: string, tenantId: string): Promise<Materia | null>;
  abstract create(materia: Materia): Promise<Materia>;
  abstract save(materia: Materia): Promise<Materia>;
  abstract softDelete(id: string, tenantId: string): Promise<void>;
  // Operações com transaction ficam aqui, nunca no use case:
  abstract tramitar(id: string, tenantId: string, dados: TramitacaoDados): Promise<void>;
  abstract proximoNumero(tenantId: string, tipoId: string, anoId: string): Promise<number>;
}

// infra/prisma/prisma-materia.repository.ts
@Injectable()
export class PrismaMateriaRepository implements MateriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tenantId: string): Promise<Materia | null> {
    const raw = await this.prisma.materia.findFirst({
      where: { id, tenantId, isRemoved: false },  // sempre os três
      include: { tipo: true, ano: true, autor: { include: { parliamentarian: true, autorExterno: true } } },
    });
    return raw ? MateriaMapper.toDomain(raw) : null;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.prisma.materia.updateMany({
      where: { id, tenantId, isRemoved: false },
      data: { isRemoved: true, removedAt: new Date() },  // nunca .delete()
    });
  }

  async tramitar(id: string, tenantId: string, dados: TramitacaoDados): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.materia.update({ where: { id }, data: { status: dados.novoStatus } }),
      this.prisma.tramitacaoHistorico.create({  // append-only — nunca update
        data: { materiaId: id, statusAnterior: dados.statusAnterior, statusNovo: dados.novoStatus,
                responsavelId: dados.responsavelId, despacho: dados.despacho },
      }),
    ]);
  }

  async proximoNumero(tenantId: string, tipoId: string, anoId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<[{ proximo: number }]>`
      SELECT COALESCE(MAX(numero), 0) + 1 AS proximo
      FROM materias
      WHERE tenant_id = ${tenantId} AND tipo_id = ${tipoId} AND ano_id = ${anoId}
      FOR UPDATE
    `;
    return result[0].proximo;
  }
}
```

---

## 2 — Use Case

```ts
// application/use-cases/tramitar-materia.use-case.ts
@Injectable()
export class TramitarMateriaUseCase {
  constructor(private readonly materiaRepository: MateriaRepository) {}

  async execute(id: string, dto: TramitarMateriaDto, tenantId: string, userId: string) {
    const materia = await this.materiaRepository.findById(id, tenantId);
    if (!materia) throw new NotFoundException('Matéria não encontrada');

    if (!materia.podeTransicionarPara(dto.novoStatus)) {
      throw new BadRequestException(`Transição inválida: ${materia.status} → ${dto.novoStatus}`);
    }

    // Despacho obrigatório para certas transições
    if (['EM_TRAMITACAO', 'APROVADA', 'REJEITADA'].includes(dto.novoStatus) && !dto.despacho) {
      throw new BadRequestException('Despacho obrigatório para esta transição');
    }

    // Transaction fica na infra — use case não sabe de Prisma
    await this.materiaRepository.tramitar(id, tenantId, {
      statusAnterior: materia.status,
      novoStatus: dto.novoStatus,
      responsavelId: userId,
      despacho: dto.despacho,
      observacao: dto.observacao,
    });

    return this.materiaRepository.findById(id, tenantId);
  }
}
```

---

## 3 — Controller thin

```ts
// application/controllers/materias.controller.ts
@Controller('materias')  // prefixo /legislative/ vem do LegislativoModule
@UseGuards(JwtAuthGuard, TenantGuard)
export class MateriasController {
  constructor(
    private readonly tramitarMateriaUseCase: TramitarMateriaUseCase,
    private readonly getMateriaByIdUseCase: GetMateriaByIdUseCase,
  ) {}

  @Post(':id/tramitar')
  async tramitar(
    @Param('id') id: string,
    @Body() dto: TramitarMateriaDto,
    @CurrentTenant() tenantId: string,  // nunca do body
    @CurrentUser() user: UserPayload,
  ) {
    const materia = await this.tramitarMateriaUseCase.execute(id, dto, tenantId, user.id);
    return MateriaViewModel.toHttp(materia);  // sempre via view model
  }
}
```

---

## 4 — Entity de domínio (zero dependência de infra)

```ts
// domain/entities/materia.entity.ts
import { StatusMateria } from '../enums/status-materia.enum';  // enum local, não do Prisma

export class Materia {
  id: string;
  tenantId: string;
  sigla: string;
  numero: number;
  ano: number;
  ementa: string;
  status: StatusMateria;
  isRemoved: boolean;
  // relações opcionais — carregadas conforme include
  autor?: Autor;
  tramitacaoHistorico?: TramitacaoHistorico[];

  get identificacao(): string {
    return `${this.sigla} nº ${this.numero}/${this.ano}`;
  }

  podeTransicionarPara(novoStatus: StatusMateria): boolean {
    const TRANSICOES: Record<StatusMateria, StatusMateria[]> = {
      [StatusMateria.DRAFT]:               [StatusMateria.PROTOCOLADA],
      [StatusMateria.PROTOCOLADA]:         [StatusMateria.EM_TRAMITACAO],
      [StatusMateria.EM_TRAMITACAO]:       [StatusMateria.EM_PAUTA, StatusMateria.ARQUIVADA, StatusMateria.RETIRADA],
      [StatusMateria.EM_PAUTA]:            [StatusMateria.APROVADA, StatusMateria.REJEITADA, StatusMateria.EM_TRAMITACAO],
      [StatusMateria.APROVADA]:            [StatusMateria.TRANSFORMADA_EM_NORMA],
      [StatusMateria.REJEITADA]:           [],
      [StatusMateria.ARQUIVADA]:           [],
      [StatusMateria.RETIRADA]:            [],
      [StatusMateria.TRANSFORMADA_EM_NORMA]: [],
    };
    return (TRANSICOES[this.status] ?? []).includes(novoStatus);
  }
}
```

---

## 5 — View Model (nunca expor campos internos)

```ts
// application/view-models/materia.view-model.ts
export class MateriaViewModel {
  static toHttp(materia: Materia) {
    return {
      id: materia.id,
      identificacao: materia.identificacao,  // "PLO nº 3/2025"
      ementa: materia.ementa,
      status: materia.status,
      autorPrincipal: materia.autor ? AutorViewModel.toHttp(materia.autor) : null,
      createdAt: materia.createdAt,
      updatedAt: materia.updatedAt,
      // ❌ NUNCA incluir: tenantId · isRemoved · removedAt · tramitacaoJson
    };
  }

  static toHttpDetalhe(materia: Materia) {
    return {
      ...MateriaViewModel.toHttp(materia),
      justificativa: materia.justificativa,
      textoOriginalUrl: materia.textoOriginalUrl,
      tramitacaoHistorico: materia.tramitacaoHistorico?.map(TramitacaoHistoricoViewModel.toHttp) ?? [],
      publicacoesOficiais: materia.publicacoesOficiais?.map(PublicacaoOficialViewModel.toHttp) ?? [],
    };
  }
}
```

---

## 6 — Módulo NestJS com binding domain → infra

```ts
// materias.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [MateriasController],
  providers: [
    // Use cases
    CreateMateriaUseCase, ListMateriasUseCase, GetMateriaByIdUseCase,
    UpdateMateriaUseCase, TramitarMateriaUseCase, AddAutorMateriaUseCase,
    // Bindings domain → infra
    { provide: MateriaRepository, useClass: PrismaMateriaRepository },
    { provide: TramitacaoHistoricoRepository, useClass: PrismaTramitacaoHistoricoRepository },
    // Domain services
    NumeracaoMateriaService,
    AutorResolverService,
  ],
  exports: [GetMateriaByIdUseCase],  // só o necessário para outros módulos
})
export class MateriasModule {}
```

---

## 7 — Teste de use case

```ts
describe('TramitarMateriaUseCase', () => {
  let useCase: TramitarMateriaUseCase;
  let repo: jest.Mocked<MateriaRepository>;

  beforeEach(async () => {
    repo = {
      findById: jest.fn(), tramitar: jest.fn(), findMany: jest.fn(),
      create: jest.fn(), save: jest.fn(), softDelete: jest.fn(), proximoNumero: jest.fn(),
    } as any;
    const module = await Test.createTestingModule({
      providers: [TramitarMateriaUseCase, { provide: MateriaRepository, useValue: repo }],
    }).compile();
    useCase = module.get(TramitarMateriaUseCase);
  });

  it('lança NotFoundException quando matéria não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('x', { novoStatus: 'PROTOCOLADA', despacho: 'ok' }, 'tenant-1', 'user-1'))
      .rejects.toThrow(NotFoundException);
  });

  it('lança BadRequestException com mensagem PT para transição inválida', async () => {
    const materia = new Materia();
    materia.status = StatusMateria.APROVADA;
    repo.findById.mockResolvedValue(materia);
    await expect(useCase.execute('x', { novoStatus: 'DRAFT', despacho: 'ok' }, 'tenant-1', 'user-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('não chama tramitar() para transição inválida', async () => {
    const materia = new Materia();
    materia.status = StatusMateria.DRAFT;
    repo.findById.mockResolvedValue(materia);
    await expect(useCase.execute('x', { novoStatus: 'APROVADA', despacho: 'ok' }, 'tenant-1', 'user-1'))
      .rejects.toThrow();
    expect(repo.tramitar).not.toHaveBeenCalled();
  });
});
```

---

## 8 — Comunicação entre submódulos do legislativo

```ts
// ❌ nunca importar infra de outro submódulo
import { PrismaMateriaRepository } from '../materias/infra/prisma/prisma-materia.repository';

// ✅ usar use case exportado pelo MateriasModule
import { GetMateriaByIdUseCase } from '../materias/application/use-cases/get-materia-by-id.use-case';

// No módulo que precisa:
@Module({
  imports: [MateriasModule],  // importa o módulo inteiro
  ...
})
```
