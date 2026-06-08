Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD e refatoração incremental de sistemas legados.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`
- `docs/prisma-relacionamentos.md`

## Contexto

As Tasks 1, 2, 3 e 4 já foram implementadas ou ajustadas.

Agora execute a **Task 5 — Refatoração DDD do domínio Atos Administrativos**.

O domínio atual já existe como:

```txt
src/atos-administrativos/
├── atos-administrativos.module.ts
└── atos/
    ├── atos.module.ts
    ├── atos.controller.ts
    ├── atos.service.ts
    └── dto/
        ├── ato.dto.ts
        └── update-ato.dto.ts

Esse padrão atual é legado:

controller + service + dto na raiz do submódulo

Ele ainda não segue o padrão DDD completo usado em:

src/legislative/parlamentares/
src/identidade/
Objetivo da Task 5

Refatorar o submódulo:

src/atos-administrativos/atos/

para o padrão DDD:

src/atos-administrativos/
├── atos-administrativos.module.ts
└── atos/
    ├── atos.module.ts
    ├── application/
    │   ├── controllers/
    │   │   └── atos.controller.ts
    │   ├── dto/
    │   │   ├── create-ato.dto.ts
    │   │   ├── update-ato.dto.ts
    │   │   └── list-atos-query.dto.ts
    │   ├── use-cases/
    │   │   ├── create-ato.use-case.ts
    │   │   ├── list-atos.use-case.ts
    │   │   ├── get-ato-by-id.use-case.ts
    │   │   ├── update-ato.use-case.ts
    │   │   └── remove-ato.use-case.ts
    │   └── view-models/
    │       └── ato.view-model.ts
    ├── domain/
    │   ├── entities/
    │   │   ├── ato.entity.ts
    │   │   ├── tipo-ato.entity.ts
    │   │   └── classificacao-ato.entity.ts
    │   ├── repositories/
    │   │   └── ato.repository.ts
    │   └── services/
    │       └── ato-domain.service.ts
    └── infra/
        └── prisma/
            └── prisma-ato.repository.ts
Regra importante sobre tenant

O schema atual documentado indica que:

Ato
TipoAto
ClassificacaoAto

não possuem tenantId.

Portanto, nesta Task 5:

NÃO adicionar tenantId em Ato.
NÃO adicionar tenantId em TipoAto.
NÃO adicionar tenantId em ClassificacaoAto.
NÃO remover @SkipTenant() do controller.
NÃO aplicar TenantGuard neste controller.

Manter o comportamento atual:

@SkipTenant()

Esses registros são tratados como globais no schema atual.

Se no futuro o produto decidir que atos administrativos precisam ser isolados por Câmara, isso deve ser feito em uma task separada, com plano de migração próprio.

Regra sobre rotas

Manter a rota atual:

/api/atos

Não alterar para:

/api/atos-administrativos/atos

sem solicitação explícita.

Rotas esperadas:

GET    /api/atos
GET    /api/atos/:id
POST   /api/atos
PATCH  /api/atos/:id
DELETE /api/atos/:id
Regra sobre permissões

Manter os decorators existentes:

@ReadRoles()
@WriteRoles()
@SkipTenant()

Não substituir por permissões baseadas em tenant nesta task.

O controle atual é por papel de usuário global, não por tenant.

Prisma atual

Usar os models existentes:

model Ato
model TipoAto
model ClassificacaoAto

Delegates Prisma esperados:

this.prisma.ato
this.prisma.tipoAto
this.prisma.classificacaoAto

Não usar delegates inexistentes como:

this.prisma.atoAdministrativo
this.prisma.tipoAtoAdministrativo
this.prisma.classificacaoAtoAdministrativo
Relações Prisma

Ato possui relação obrigatória com:

TipoAto
ClassificacaoAto

Toda consulta de ato deve manter:

include: {
  tipo: true,
  classificacao: true,
}
Campos principais de Ato

Manter os campos atuais:

id
tipoId
classificacaoId
numero
dataInicio
dataFim
dataPublicacaoInicio
dataPublicacaoFim
mensagem
createdAt
updatedAt

Não criar novos campos sem necessidade.

Não renomear campos Prisma nesta task.

Soft delete vs hard delete

O comportamento atual do DELETE é hard delete.

Nesta Task 5, faça uma análise antes de alterar:

Verifique se o model Ato possui isRemoved e removedAt.
Se possuir, refatore o DELETE para soft delete.
Se não possuir, manter hard delete por compatibilidade e registrar TODO técnico.
Não adicionar isRemoved/removedAt nesta task sem plano de migration.

Adicionar comentário técnico no use case, se necessário:

// TODO: Migrar Ato para soft delete quando o schema incluir isRemoved e removedAt.
Camadas
Application

Deve conter:

controllers
dto
use-cases
view-models

Responsabilidades:

Controller recebe HTTP input.
Controller usa DTO.
Controller chama UseCase.
Controller não contém regra de negócio.
UseCase orquestra fluxo.
UseCase chama repository contract.
UseCase não usa Prisma diretamente.
Domain

Deve conter:

entities
repository contracts
domain services

Responsabilidades:

Domain representa regra de negócio pura.
Domain não depende de Prisma.
Domain não depende de NestJS.
Domain não depende de HTTP.
Infra

Deve conter:

Prisma repository
ORM mapping

Responsabilidades:

Infra usa Prisma.
Infra implementa o repository contract.
Infra conhece detalhes do banco.
Repository contract

Criar:

src/atos-administrativos/atos/domain/repositories/ato.repository.ts

Contrato esperado:

export abstract class AtoRepository {
  abstract create(data: CreateAtoRepositoryInput): Promise<AtoEntity>;

  abstract findMany(query: ListAtosRepositoryQuery): Promise<PaginatedAtos>;

  abstract findById(id: string): Promise<AtoEntity | null>;

  abstract update(
    id: string,
    data: UpdateAtoRepositoryInput,
  ): Promise<AtoEntity>;

  abstract remove(id: string): Promise<void>;

  abstract existsByNumero(
    numero: string,
    ignoreAtoId?: string,
  ): Promise<boolean>;
}

Ajuste os tipos conforme o padrão real do projeto.

Use cases obrigatórios

Criar:

CreateAtoUseCase
ListAtosUseCase
GetAtoByIdUseCase
UpdateAtoUseCase
RemoveAtoUseCase
DTOs

Migrar os DTOs atuais:

ato.dto.ts
update-ato.dto.ts

para:

application/dto/create-ato.dto.ts
application/dto/update-ato.dto.ts
application/dto/list-atos-query.dto.ts

Todos os DTOs devem usar:

class-validator
class-transformer
Swagger decorators
CreateAtoDto

Campos esperados:

tipoId
classificacaoId
numero
dataInicio
dataFim
dataPublicacaoInicio
dataPublicacaoFim
mensagem

Regras:

tipoId obrigatório
classificacaoId obrigatório
numero obrigatório
datas opcionais
mensagem opcional
ListAtosQueryDto

Manter compatibilidade com os filtros atuais.

Permitir, se já existir no service atual:

tipoId
classificacaoId
numero
dataInicio
dataFim
dataPublicacaoInicio
dataPublicacaoFim
page
limit

Usar helpers existentes:

paginatedQuery
buildDateRangeFilter
toOptionalDate
ViewModel

Criar:

application/view-models/ato.view-model.ts

Retornar:

{
  id: string;
  numero: string;
  dataInicio?: Date;
  dataFim?: Date;
  dataPublicacaoInicio?: Date;
  dataPublicacaoFim?: Date;
  mensagem?: string;
  tipo: {
    id: string;
    nome: string;
  };
  classificacao: {
    id: string;
    nome: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

Não retornar campos internos se existirem futuramente:

isRemoved
removedAt
Controller

Mover o controller para:

application/controllers/atos.controller.ts

Manter:

@Controller('atos')
@SkipTenant()

Manter os decorators de segurança atuais:

@ReadRoles()
@WriteRoles()

O controller deve chamar apenas use cases.

Não usar AtosService diretamente no controller após a refatoração.

AtosService

O arquivo atual:

atos.service.ts

deve ser substituído gradualmente pelo repository:

infra/prisma/prisma-ato.repository.ts

Não manter regra de negócio no service.

Opções válidas:

Remover AtosService se não houver dependências externas.
Manter temporariamente como adapter legado apenas se outro módulo ainda usar.
Se mantiver, marcar como deprecated e não usar no controller novo.

Antes de remover, fazer busca global por:

AtosService
AtosModule

Atualizar:

atos.module.ts

Para registrar:

AtosController
CreateAtoUseCase
ListAtosUseCase
GetAtoByIdUseCase
UpdateAtoUseCase
RemoveAtoUseCase
PrismaAtoRepository

Provider esperado:

{
  provide: AtoRepository,
  useClass: PrismaAtoRepository,
}

Importar PrismaModule se o projeto exigir.

AtosAdministrativosModule

Manter como agregador:

@Module({
  imports: [AtosModule],
  exports: [AtosModule],
})
export class AtosAdministrativosModule {}

Não colocar regra de negócio nele.

Validações obrigatórias

Ao criar ou atualizar Ato:

1. Validar se TipoAto existe.
2. Validar se ClassificacaoAto existe.
3. Validar duplicidade de numero, se essa regra já existir no legado.
4. Converter datas com helper existente.
5. Retornar erro em português.

Mensagens esperadas:

throw new NotFoundException('Ato não encontrado');
throw new NotFoundException('Tipo de ato não encontrado');
throw new NotFoundException('Classificação de ato não encontrada');
throw new ConflictException('Já existe ato com este número');
Dependências comuns

Reutilizar, se já existirem:

common/prisma/paginatedQuery
common/prisma/assertFound
common/prisma/buildDateRangeFilter
common/prisma/toOptionalDate
common/decorators/ReadRoles
common/decorators/WriteRoles
common/decorators/SkipTenant

Não duplicar helpers.

Migration

Nesta task, o objetivo é refatoração de código.

Não criar migration salvo se estritamente necessário.

Não executar:

npx prisma migrate reset

Não renomear models Prisma.

Não renomear tabelas.

Não adicionar tenantId.

Testes mínimos

Criar ou ajustar testes para:

- listar atos com paginação
- listar atos com filtros
- buscar ato por id
- retornar 404 se ato não existir
- criar ato validando tipoId
- criar ato validando classificacaoId
- atualizar ato
- remover ato mantendo compatibilidade atual
- garantir include de tipo e classificacao
- garantir que controller usa @SkipTenant()
Checklist final obrigatório

Ao finalizar, reporte:

 Analisei estrutura atual de src/atos-administrativos.
 Mantive AtosAdministrativosModule como agregador.
 Refatorei atos para DDD.
 Criei camada application.
 Criei camada domain.
 Criei camada infra.
 Controller foi movido para application/controllers.
 DTOs foram movidos para application/dto.
 Use cases foram criados.
 ViewModel foi criado.
 Repository contract foi criado no domain.
 Prisma repository foi criado na infra.
 Controller não usa Prisma.
 Controller não usa service legado diretamente.
 Use cases não usam Prisma diretamente.
 Domain não depende de Prisma, NestJS ou HTTP.
 Prisma ficou somente na infra.
 Mantive rota /api/atos.
 Mantive @SkipTenant().
 Não adicionei tenantId.
 Não renomeei models Prisma.
 Não rodei migration destrutiva.
 Mantive include de tipo e classificacao.
 Validei tipoId.
 Validei classificacaoId.
 Avaliei hard delete vs soft delete conforme schema atual.
 Mensagens de erro estão em português brasileiro.
 Código está organizado conforme padrão DDD.

Resumo da Task 5:

```txt
Não mudar o comportamento funcional agora.
Não adicionar tenant.
Não renomear Prisma.
Não quebrar rota /api/atos.

Apenas migrar o módulo legado para DDD.