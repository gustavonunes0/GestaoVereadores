Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD, multi-tenancy e sistemas de Câmara Municipal.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`
- `docs/prisma-relacionamentos.md`

## Contexto

As Tasks anteriores já foram executadas.

O domínio `atos-administrativos` já existe separado em:

```txt
src/atos-administrativos/
└── atos/

Esse domínio é diferente de controle-juridico.

Não criar submódulo atos dentro de controle-juridico.

O domínio controle-juridico possui hoje apenas o submódulo:

src/controle-juridico/
└── normas/

A estrutura atual é legado:

src/controle-juridico/
├── controle-juridico.module.ts
└── normas/
    ├── normas.module.ts
    ├── normas.controller.ts
    ├── normas.service.ts
    └── dto/
        ├── norma.dto.ts
        └── update-norma.dto.ts
Objetivo da Task 6

Refatorar somente o submódulo normas para o padrão DDD.

Nova estrutura esperada:

src/controle-juridico/
├── controle-juridico.module.ts
└── normas/
    ├── normas.module.ts
    ├── application/
    │   ├── controllers/
    │   │   └── normas.controller.ts
    │   ├── dto/
    │   │   ├── create-norma.dto.ts
    │   │   ├── update-norma.dto.ts
    │   │   └── list-normas-query.dto.ts
    │   ├── use-cases/
    │   │   ├── create-norma.use-case.ts
    │   │   ├── list-normas.use-case.ts
    │   │   ├── get-norma-by-id.use-case.ts
    │   │   ├── update-norma.use-case.ts
    │   │   └── remove-norma.use-case.ts
    │   └── view-models/
    │       └── norma.view-model.ts
    ├── domain/
    │   ├── entities/
    │   │   └── norma.entity.ts
    │   ├── repositories/
    │   │   └── norma.repository.ts
    │   └── services/
    │       └── norma-domain.service.ts
    └── infra/
        ├── prisma/
        │   └── prisma-norma.repository.ts
        └── integrations/
            └── materia-origem-validator.ts
Importante sobre Atos Administrativos

Não mexer em:

src/atos-administrativos/

Não criar:

src/controle-juridico/atos/

Norma e Ato são bounded contexts separados.

controle-juridico/normas
→ /api/normas
→ usa tenantId
→ soft delete

atos-administrativos/atos
→ /api/atos
→ @SkipTenant()
→ sem tenantId no schema atual

Não criar relação Prisma entre Norma e Ato.

Prisma atual

Usar os models existentes:

model Norma
model TipoNorma
model Ano
model EsferaFederacao
model IdentificadorNorma
model Materia

Delegates esperados:

this.prisma.norma
this.prisma.tipoNorma
this.prisma.ano
this.prisma.esferaFederacao
this.prisma.identificadorNorma
this.prisma.materia

Não usar delegates inexistentes.

Não renomear models Prisma nesta task.

Não criar migration destrutiva.

Não usar:

npx prisma migrate reset
Tenant obrigatório

Diferente de Ato, Norma possui tenantId.

Toda query de Norma deve filtrar por:

tenantId
isRemoved: false

Nunca buscar norma apenas por id.

Correto:

where: {
  id,
  tenantId,
  isRemoved: false,
}

Errado:

where: {
  id,
}

Nunca aceitar tenantId via:

body
query
params

O tenantId deve vir somente do JWT/decorator autorizado:

@TenantId() tenantId: string

Não usar @SkipTenant() em NormasController.

Rota HTTP

Manter a rota atual:

/api/normas

Rotas esperadas:

GET    /api/normas
GET    /api/normas/:id
POST   /api/normas
PATCH  /api/normas/:id
DELETE /api/normas/:id
Includes atuais obrigatórios

Preservar o comportamento atual do service.

create / update

Usar include:

include: {
  tipo: true,
  ano: true,
  materiaOrigem: true,
}
findAll

Usar include:

include: {
  tipo: true,
  ano: true,
}
findOne

Usar include:

include: {
  tipo: true,
  ano: true,
  materiaOrigem: true,
  esferaFederacao: true,
}
Soft delete

Norma usa soft delete.

Nunca usar:

prisma.norma.delete()

Usar:

isRemoved: true

Se o model possuir removedAt, preencher também:

removedAt: new Date()

Se não possuir removedAt, manter apenas isRemoved: true.

Dependência com Legislativo

Hoje NormasService importa:

assertMateriaPodeGerarNorma

de:

src/legislative/materias/domain/services/materia-workflow

Essa regra deve continuar existindo, mas deve ser isolada.

Não deixar o controller depender diretamente do domínio legislativo.

Não deixar o use case acessar Prisma diretamente para validar matéria.

Criar uma integração clara em:

src/controle-juridico/normas/infra/integrations/materia-origem-validator.ts

Responsabilidade:

1. Receber tenantId e materiaOrigemId.
2. Buscar Materia no tenant atual.
3. Validar se a matéria existe.
4. Chamar assertMateriaPodeGerarNorma.
5. Retornar sucesso ou lançar erro em português.

Use cases de Norma devem chamar essa integração por contrato/serviço, não acessar prisma.materia diretamente.

Fluxo ao criar Norma com materiaOrigemId
1. Receber tenantId pelo JWT/decorator.
2. Validar tipoId.
3. Validar anoId se informado.
4. Validar esferaFederacaoId se informado.
5. Validar identificadorId se informado.
6. Se materiaOrigemId for informado:
   - buscar Materia no mesmo tenant
   - validar com assertMateriaPodeGerarNorma
7. Criar Norma vinculada à matéria.
8. Retornar ViewModel.
Fluxo ao atualizar Norma com materiaOrigemId
1. Buscar Norma por id + tenantId + isRemoved false.
2. Validar tipoId se alterado.
3. Validar anoId se alterado.
4. Validar esferaFederacaoId se alterado.
5. Validar identificadorId se alterado.
6. Se materiaOrigemId for alterado:
   - buscar Materia no mesmo tenant
   - validar com assertMateriaPodeGerarNorma
7. Atualizar Norma.
8. Retornar ViewModel.
DTOs

Todos os DTOs devem usar:

class-validator
class-transformer
Swagger decorators
CreateNormaDto

Campos esperados, respeitando o schema existente:

tipoId
numero
ementa
anoId
data
dataPublicacaoInicio
dataPublicacaoFim
esferaFederacaoId
identificadorId
materiaOrigemId
mensagem

Regras:

tipoId obrigatório
numero obrigatório
ementa obrigatória
anoId opcional
data opcional
dataPublicacaoInicio opcional
dataPublicacaoFim opcional
esferaFederacaoId opcional
identificadorId opcional
materiaOrigemId opcional
mensagem opcional
UpdateNormaDto

Todos os campos devem ser opcionais.

Não permitir atualizar:

tenantId
id
isRemoved
ListNormasQueryDto

Permitir filtros:

search
tipoId
anoId
esferaFederacaoId
identificadorId
materiaOrigemId
numero
dataInicio
dataFim
page
limit

Busca deve procurar por:

numero
ementa
mensagem

Sempre aplicar:

tenantId
isRemoved: false
Repository contract

Criar:

src/controle-juridico/normas/domain/repositories/norma.repository.ts

Contrato esperado:

export abstract class NormaRepository {
  abstract create(
    tenantId: string,
    data: CreateNormaRepositoryInput,
  ): Promise<NormaEntity>;

  abstract findMany(
    tenantId: string,
    query: ListNormasRepositoryQuery,
  ): Promise<PaginatedNormas>;

  abstract findById(
    tenantId: string,
    id: string,
  ): Promise<NormaEntity | null>;

  abstract update(
    tenantId: string,
    id: string,
    data: UpdateNormaRepositoryInput,
  ): Promise<NormaEntity>;

  abstract softDelete(
    tenantId: string,
    id: string,
  ): Promise<void>;

  abstract existsTipoNorma(tipoId: string): Promise<boolean>;
  abstract existsAno(anoId: string): Promise<boolean>;
  abstract existsEsferaFederacao(esferaFederacaoId: string): Promise<boolean>;
  abstract existsIdentificadorNorma(identificadorId: string): Promise<boolean>;
}

Ajustar os tipos ao padrão real do projeto.

Use cases obrigatórios

Criar:

CreateNormaUseCase
ListNormasUseCase
GetNormaByIdUseCase
UpdateNormaUseCase
RemoveNormaUseCase

Use cases não podem usar Prisma diretamente.

Use cases devem depender de:

NormaRepository
MateriaOrigemValidator
ViewModel

Criar:

application/view-models/norma.view-model.ts

Retornar:

{
  id: string;
  numero: string;
  ementa: string;
  data?: Date;
  dataPublicacaoInicio?: Date;
  dataPublicacaoFim?: Date;
  mensagem?: string;
  tipo: {
    id: string;
    nome: string;
  };
  ano?: {
    id: string;
    valor: number;
  };
  esferaFederacao?: {
    id: string;
    nome: string;
  };
  identificador?: {
    id: string;
    nome: string;
  };
  materiaOrigem?: {
    id: string;
    ementa: string;
    numero?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

Não retornar:

tenantId
isRemoved
removedAt
Controller

Mover para:

application/controllers/normas.controller.ts

Manter:

@Controller('normas')

Não usar:

@SkipTenant()

O controller deve:

1. Receber tenantId pelo decorator autorizado.
2. Receber DTOs.
3. Chamar use cases.
4. Não conter regra de negócio.
5. Não acessar Prisma.
6. Não usar NormasService legado diretamente.
NormasService legado

O arquivo atual:

normas.service.ts

deve ser substituído pelo repository e use cases.

Antes de remover, buscar referências globais por:

NormasService

Opções válidas:

1. Remover se não houver dependência externa.
2. Manter temporariamente como deprecated se outro módulo usar.
3. Não usar o service legado no controller novo.

Se mantiver temporariamente:

// TODO: Remover NormasService após migração completa para use cases.
NormasModule

Atualizar:

normas.module.ts

Para registrar:

NormasController
CreateNormaUseCase
ListNormasUseCase
GetNormaByIdUseCase
UpdateNormaUseCase
RemoveNormaUseCase
PrismaNormaRepository
MateriaOrigemValidator

Provider esperado:

{
  provide: NormaRepository,
  useClass: PrismaNormaRepository,
}

Importar PrismaModule se o projeto exigir.

ControleJuridicoModule

Manter como agregador:

@Module({
  imports: [NormasModule],
  exports: [NormasModule],
})
export class ControleJuridicoModule {}

Não colocar regra de negócio em:

src/controle-juridico/
Validações obrigatórias

Ao criar ou atualizar Norma:

1. Validar se TipoNorma existe.
2. Validar Ano se informado.
3. Validar EsferaFederacao se informada.
4. Validar IdentificadorNorma se informado.
5. Validar Materia de origem se informada.
6. Materia de origem deve pertencer ao mesmo tenant.
7. Materia de origem deve poder gerar norma.
8. Retornar erros em português.

Mensagens esperadas:

throw new NotFoundException('Norma não encontrada');
throw new NotFoundException('Tipo de norma não encontrado');
throw new NotFoundException('Ano não encontrado');
throw new NotFoundException('Esfera de federação não encontrada');
throw new NotFoundException('Identificador de norma não encontrado');
throw new NotFoundException('Matéria de origem não encontrada');
throw new BadRequestException('A matéria informada não pode gerar norma');
Dependências comuns

Reutilizar helpers existentes, se já usados pelo service atual:

common/prisma/paginatedQuery
common/prisma/assertFound
common/prisma/buildDateRangeFilter
common/prisma/toOptionalDate
common/decorators

Não duplicar helpers.

Migration

Esta task é refatoração de código.

Não criar migration salvo se estritamente necessário.

Não executar:

npx prisma migrate reset

Não renomear models Prisma.

Não renomear tabelas.

Não alterar relacionamento entre Norma e Ato, pois não existe relação entre eles.

Testes mínimos

Criar ou ajustar testes para:

- listar normas com paginação
- listar normas por tenant
- não listar normas removidas
- buscar norma por id + tenantId
- retornar 404 se norma não existir
- criar norma validando tipoId
- criar norma validando anoId quando informado
- criar norma validando materiaOrigemId quando informado
- bloquear matéria de outro tenant
- bloquear matéria que não pode gerar norma
- atualizar norma
- remover norma com soft delete
- garantir que controller não usa @SkipTenant()
- garantir que controller não usa NormasService legado diretamente
Checklist final obrigatório

Ao finalizar, reporte:

 Analisei a estrutura atual de src/controle-juridico.
 Confirmei que controle-juridico possui apenas normas.
 Não criei submódulo atos dentro de controle-juridico.
 Não alterei src/atos-administrativos.
 Mantive ControleJuridicoModule como agregador.
 Refatorei normas para DDD.
 Criei camada application.
 Criei camada domain.
 Criei camada infra.
 Controller foi movido para application/controllers.
 DTOs foram movidos para application/dto.
 Use cases foram criados.
 ViewModel foi criado.
 Repository contract foi criado no domain.
 Prisma repository foi criado na infra.
 Integração com matéria de origem foi isolada.
 Controller não usa Prisma.
 Controller não usa NormasService legado diretamente.
 Use cases não usam Prisma diretamente.
 Domain não depende de Prisma, NestJS ou HTTP.
 Prisma ficou somente na infra.
 Mantive rota /api/normas.
 Não usei @SkipTenant().
 Mantive isolamento por tenantId.
 Todas as queries filtram por tenantId.
 Todas as queries ignoram isRemoved: true.
 DELETE usa soft delete.
 Não usei prisma.norma.delete().
 Preservei includes atuais.
 Validei tipoId.
 Validei materiaOrigemId.
 Mantive regra assertMateriaPodeGerarNorma.
 Não criei relação entre Norma e Ato.
 Não rodei migration destrutiva.
 Mensagens de erro estão em português brasileiro.
 Código está organizado conforme padrão DDD.

Resumo da Task 6:

```txt
Refatorar controle-juridico/normas para DDD.
Manter /api/normas.
Manter tenantId.
Manter soft delete.
Não misturar com atos-administrativos.
Não criar controle-juridico/atos.