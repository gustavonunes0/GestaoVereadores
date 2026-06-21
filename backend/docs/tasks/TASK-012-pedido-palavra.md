# TASK-012 — PedidoPalavra: Fila de Pedidos de Fala na Sessão

**Spec de referência:** `backend/docs/review/REVIEW-003-gaps-sessao-presidente.md` GAP 1
**Depende de:** TASK-011 (WebSocket Gateway já criado), TASK-007 (ParlamentarianUser)
**Módulo:** `src/legislativo/sessoes-plenarias/` (adicionar ao módulo existente)

> O parlamentar aperta um botão no app → entra na fila de pedidos de fala.
> O Presidente vê a fila e concede ou nega. Staff também acompanha.
> Painel TV exibe o nome de quem está com a palavra.

---

## Fase 1 — Migration M14

### T-01 · Adicionar enum e model `PedidoPalavra`

- [x] Adicionar em `backend/prisma/schema.prisma`:

```prisma
enum StatusPedidoPalavra {
  AGUARDANDO
  CONCEDIDO
  NEGADO
  ENCERRADO
}

model PedidoPalavra {
  id                String              @id @default(uuid())
  sessaoId          String
  parliamentarianId String
  status            StatusPedidoPalavra @default(AGUARDANDO)
  criadoEm          DateTime            @default(now())
  respondidoEm      DateTime?
  encerradoEm       DateTime?
  duracaoSegundos   Int?                // opcional — timer de fala

  sessao          SessaoPlenaria  @relation(fields: [sessaoId], references: [id])
  parliamentarian Parliamentarian @relation(fields: [parliamentarianId], references: [id])

  @@index([sessaoId, status])
  @@index([sessaoId, parliamentarianId])
  @@map("pedidos_palavra")
}
```

- [x] Adicionar relações inversas:
```prisma
// SessaoPlenaria:
pedidosPalavra PedidoPalavra[]

// Parliamentarian:
pedidosPalavra PedidoPalavra[]
```

- [x] Rodar: `npx prisma migrate dev --name add_pedido_palavra`
- [x] `npx prisma generate && npx tsc --noEmit`

---

## Fase 2 — Domain Layer

### T-02 · Entity `PedidoPalavra`

```ts
// domain/entities/pedido-palavra.entity.ts
export class PedidoPalavraEntity {
  id: string;
  sessaoId: string;
  parliamentarianId: string;
  status: StatusPedidoPalavra;
  criadoEm: Date;
  respondidoEm?: Date;
  encerradoEm?: Date;
  duracaoSegundos?: number;

  estaAtivo(): boolean {
    return ['AGUARDANDO', 'CONCEDIDO'].includes(this.status);
  }
}
```

### T-03 · Repository contract

```ts
// domain/repositories/pedido-palavra.repository.ts
export abstract class PedidoPalavraRepository {
  abstract create(dados: CreatePedidoPalavraData): Promise<PedidoPalavraEntity>;
  abstract findAtivo(sessaoId: string, parliamentarianId: string): Promise<PedidoPalavraEntity | null>;
  abstract findFila(sessaoId: string): Promise<PedidoPalavraEntity[]>; // ordenado por criadoEm ASC
  abstract updateStatus(id: string, status: StatusPedidoPalavra, dados?: UpdatePedidoData): Promise<PedidoPalavraEntity>;
}
```

---

## Fase 3 — Application Layer

### T-04 · Use Cases

#### `PedirPalavraUseCase`
```ts
// Guard: ParlamentarianGuard
// POST /sessoes/:id/pedir-palavra

async execute(sessaoId: string, user: ParlamentarianJwtPayload) {
  // 1. Verificar sessão ABERTA
  const sessao = await sessaoRepo.findById(sessaoId, user.tenantId);
  if (!sessao || sessao.statusSessao !== 'ABERTA') {
    throw new UnprocessableEntityException('Pedido de palavra só é permitido em sessão aberta');
  }

  // 2. Verificar que parlamentar está PRESENTE
  const presenca = await presencaRepo.find(sessaoId, user.parliamentarianId);
  if (!presenca || presenca.situacao !== 'PRESENTE') {
    throw new UnprocessableEntityException('Você precisa estar marcado como presente para pedir a palavra');
  }

  // 3. Verificar que não há pedido ativo
  const ativo = await pedidoRepo.findAtivo(sessaoId, user.parliamentarianId);
  if (ativo) {
    throw new ConflictException('Você já tem um pedido de palavra em andamento');
  }

  // 4. Criar pedido
  const pedido = await pedidoRepo.create({
    sessaoId,
    parliamentarianId: user.parliamentarianId,
    status: 'AGUARDANDO',
  });

  // 5. Notificar via WebSocket — apenas Staff e Presidente veem o nome
  this.gateway.emit(`tenant:${user.tenantId}`, 'palavra:pedida', {
    pedidoId: pedido.id,
    parlamentarNome: user.parliamentaryName,
    sessaoId,
    criadoEm: pedido.criadoEm,
  });

  return pedido;
}
```

#### `ListPedidosPalavraUseCase`
```ts
// Guard: PresidentOrStaffGuard
// GET /sessoes/:id/pedidos-palavra

async execute(sessaoId: string, tenantId: string) {
  // Retorna fila em ordem de chegada (criadoEm ASC)
  // Filtrada por: AGUARDANDO e CONCEDIDO no topo, NEGADO e ENCERRADO por último
  return pedidoRepo.findFila(sessaoId);
}
```

#### `ResponderPedidoPalavraUseCase`
```ts
// Guard: PresidentOrStaffGuard (apenas Presidente deve usar na prática)
// PATCH /sessoes/:id/pedidos-palavra/:pid
// Body: { status: 'CONCEDIDO' | 'NEGADO' }

async execute(pedidoId: string, novoStatus: 'CONCEDIDO' | 'NEGADO', user: JwtPayload) {
  const pedido = await pedidoRepo.findById(pedidoId);
  if (!pedido || pedido.status !== 'AGUARDANDO') {
    throw new ConflictException('Pedido não está aguardando resposta');
  }

  const atualizado = await pedidoRepo.updateStatus(pedidoId, novoStatus, {
    respondidoEm: new Date(),
  });

  // Notificar via WebSocket
  if (novoStatus === 'CONCEDIDO') {
    // Todos recebem — quem está com a palavra
    this.gateway.emit(`tenant:${tenantId}`, 'palavra:concedida', {
      pedidoId,
      parlamentarNome: pedido.parliamentarianName,
      sessaoId: pedido.sessaoId,
    });
  } else {
    // Apenas o parlamentar que pediu recebe a negação
    this.gateway.emitParaParlamentar(pedido.parliamentarianId, 'palavra:negada', {
      pedidoId,
      sessaoId: pedido.sessaoId,
    });
  }

  return atualizado;
}
```

#### `EncerrarPedidoPalavraUseCase`
```ts
// Guard: PresidentOrStaffGuard
// POST /sessoes/:id/pedidos-palavra/:pid/encerrar

async execute(pedidoId: string, tenantId: string) {
  const pedido = await pedidoRepo.findById(pedidoId);
  if (!pedido || pedido.status !== 'CONCEDIDO') {
    throw new ConflictException('Pedido não está com a palavra concedida');
  }

  const atualizado = await pedidoRepo.updateStatus(pedidoId, 'ENCERRADO', {
    encerradoEm: new Date(),
    duracaoSegundos: Math.floor((Date.now() - pedido.respondidoEm!.getTime()) / 1000),
  });

  // Todos recebem
  this.gateway.emit(`tenant:${tenantId}`, 'palavra:encerrada', {
    pedidoId,
    parlamentarNome: pedido.parliamentarianName,
    sessaoId: pedido.sessaoId,
  });

  return atualizado;
}
```

### T-05 · View Model

```ts
// pedido-palavra.view-model.ts
export class PedidoPalavraViewModel {
  static toHttp(pedido: PedidoPalavraEntity, parlamentarNome: string) {
    return {
      id: pedido.id,
      sessaoId: pedido.sessaoId,
      parlamentarNome,               // incluído para exibição na fila
      status: pedido.status,
      criadoEm: pedido.criadoEm,
      respondidoEm: pedido.respondidoEm ?? null,
      encerradoEm: pedido.encerradoEm ?? null,
      duracaoSegundos: pedido.duracaoSegundos ?? null,
    };
  }
}
```

---

## Fase 4 — Controller

### T-06 · Adicionar endpoints ao `SessoesPlenariasController`

```ts
// POST /sessoes/:id/pedir-palavra → ParlamentarianGuard
@Post(':id/pedir-palavra')
@UseGuards(...PARLAMENTAR_GUARDS)
pedirPalavra(
  @Param('id') sessaoId: string,
  @CurrentUser() user: ParlamentarianJwtPayload,
) {
  return this.pedirPalavraUseCase.execute(sessaoId, user);
}

// GET /sessoes/:id/pedidos-palavra → PresidentOrStaffGuard
@Get(':id/pedidos-palavra')
@UseGuards(JwtAuthGuard, TenantGuard, PresidentOrStaffGuard)
listPedidos(
  @Param('id') sessaoId: string,
  @CurrentTenant() tenantId: string,
) {
  return this.listPedidosUseCase.execute(sessaoId, tenantId);
}

// PATCH /sessoes/:id/pedidos-palavra/:pid → PresidentOrStaffGuard
@Patch(':id/pedidos-palavra/:pid')
@UseGuards(JwtAuthGuard, TenantGuard, PresidentOrStaffGuard)
responderPedido(
  @Param('pid') pedidoId: string,
  @Body() dto: ResponderPedidoDto,
  @CurrentTenant() tenantId: string,
  @CurrentUser() user: JwtPayload,
) {
  return this.responderPedidoUseCase.execute(pedidoId, dto.status, user, tenantId);
}

// POST /sessoes/:id/pedidos-palavra/:pid/encerrar → PresidentOrStaffGuard
@Post(':id/pedidos-palavra/:pid/encerrar')
@UseGuards(JwtAuthGuard, TenantGuard, PresidentOrStaffGuard)
encerrarPedido(
  @Param('pid') pedidoId: string,
  @CurrentTenant() tenantId: string,
) {
  return this.encerrarPedidoUseCase.execute(pedidoId, tenantId);
}
```

### T-07 · DTO

```ts
// responder-pedido-palavra.dto.ts
export class ResponderPedidoDto {
  @IsEnum(['CONCEDIDO', 'NEGADO'])
  status: 'CONCEDIDO' | 'NEGADO';
}
```

---

## Fase 5 — WebSocket: novos eventos

### T-08 · Adicionar métodos ao `SessaoRealtimeGateway` (TASK-011)

```ts
// src/legislativo/sessoes-plenarias/realtime/sessao-realtime.gateway.ts

// Novo: palavra:pedida — enviado para todos os Staff e Presidente
emitirPalavraPedida(tenantId: string, payload: {
  pedidoId: string;
  parlamentarNome: string;
  sessaoId: string;
  criadoEm: Date;
}) {
  this.server.to(`tenant:${tenantId}`).emit('palavra:pedida', payload);
}

// Novo: palavra:concedida — enviado para todos
emitirPalavraConcedida(tenantId: string, payload: {
  pedidoId: string;
  parlamentarNome: string;
  sessaoId: string;
}) {
  this.server.to(`tenant:${tenantId}`).emit('palavra:concedida', payload);
}

// Novo: palavra:negada — enviado apenas ao parlamentar que pediu
// Requer mapeamento de parliamentarianId → socketId
emitirPalavraNegada(tenantId: string, parlamentarSocketId: string, payload: {
  pedidoId: string;
  sessaoId: string;
}) {
  // Emitir para a sala do parlamentar específico
  this.server.to(parlamentarSocketId).emit('palavra:negada', payload);
}

// Novo: palavra:encerrada — enviado para todos
emitirPalavraEncerrada(tenantId: string, payload: {
  pedidoId: string;
  parlamentarNome: string;
  sessaoId: string;
}) {
  this.server.to(`tenant:${tenantId}`).emit('palavra:encerrada', payload);
}
```

> **Nota sobre `palavra:negada`:** Para enviar apenas para o parlamentar que pediu,
> o gateway precisa mapear `parliamentarianId → socketId` ao conectar.
> Adicionar `client.data.parliamentarianId` no `handleConnection`:
> ```ts
> if (isParlamentarianSession(payload)) {
>   client.data.parliamentarianId = payload.parliamentarianId;
> }
> ```
> e manter um Map em memória: `private parlSocketMap = new Map<string, string>()`.

---

## Fase 6 — Testes

### T-09 · Testes

- [x] `pedir-palavra.use-case.spec.ts`:
  - Sessão não ABERTA → 422 em PT-BR
  - Parlamentar não PRESENTE → 422 em PT-BR
  - Pedido ativo existente → 409 em PT-BR
  - Criação bem-sucedida → emite `palavra:pedida`
- [x] `responder-pedido-palavra.use-case.spec.ts`:
  - Conceder → emite `palavra:concedida` para todos
  - Negar → emite `palavra:negada` apenas para o parlamentar
  - Pedido não AGUARDANDO → 409 em PT-BR
- [x] `encerrar-pedido-palavra.use-case.spec.ts`:
  - Encerrar → `duracaoSegundos` calculado corretamente
  - Emite `palavra:encerrada` para todos
  - Pedido não CONCEDIDO → 409 em PT-BR

---

## Checklist final

- [x] Migration `add_pedido_palavra` aplicada
- [x] `npx prisma generate && npx tsc --noEmit` → zero erros
- [x] Parlamentar pede palavra → `status: AGUARDANDO` criado
- [x] Dois pedidos ativos do mesmo parlamentar na mesma sessão → 409
- [x] Presidente concede → evento `palavra:concedida` para todos
- [x] Presidente nega → evento `palavra:negada` apenas para quem pediu
- [x] Encerrar calcula `duracaoSegundos`
- [x] `GET /pedidos-palavra` ordenado por `criadoEm ASC`
- [x] Endpoint bloqueado para Staff comum (apenas Presidente ou Admin via PresidentOrStaffGuard)
- [x] `npx jest` passando
