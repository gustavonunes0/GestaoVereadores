# TASK-011 — App Parlamentar: Presença, Votação e WebSocket

**Spec:** `backend/docs/specs/sessoes/SPEC-011-app-parlamentar-presenca-realtime.md`
**Depende de:** TASK-007 (ParlamentarianUser), TASK-009 (Sessão RN), TASK-010 (Votação RN)

---

## Fase 1 — Migration M13

### T-01 · Enum `ModalidadePresenca` e campos em `PresencaSessao`

```prisma
enum ModalidadePresenca {
  PRESENCIAL
  REMOTO
}

// Adicionar em PresencaSessao:
autoRegistrado Boolean           @default(false)
modalidade     ModalidadePresenca @default(PRESENCIAL)
registradoEm   DateTime?
```

- [x] Rodar: `npx prisma migrate dev --name add_presenca_auto_registro_modalidade`
  > Aplicado em migração combinada M11+M12+M13 + migração complementar para `parliamentarianId` em `PresencaSessao`

### T-02 · Campo `registradoRemoto` em `VotoParlamentar` e `linkTransmissao` em `SessaoPlenaria`

```prisma
// VotoParlamentar:
registradoRemoto Boolean @default(false)

// SessaoPlenaria:
linkTransmissao String?
```

- [ ] `registradoRemoto` em `VotoParlamentar` — **pendente** (não adicionado ao schema)
- [x] Links de transmissão em `SessaoPlenaria` — implementado como `linkJitsi String?` e `linkYoutube String?` em vez de `linkTransmissao`
- [ ] Rodar: `npx prisma migrate dev --name add_voto_remoto_link_transmissao`
- [ ] `npx prisma generate && npx tsc --noEmit`

---

## Fase 2 — Novo Use Case: Auto-registro de Presença

### T-03 · `RegistrarMinhaPresencaUseCase`

```ts
// src/legislativo/sessoes-plenarias/application/use-cases/
//   registrar-minha-presenca.use-case.ts

@Injectable()
export class RegistrarMinhaPresencaUseCase {
  async execute(
    sessaoId: string,
    dto: MinhaPresencaDto,
    user: ParlamentarianJwtPayload,
  ) {
    const sessao = await this.sessaoRepo.findById(sessaoId, user.tenantId);
    if (!sessao) throw new NotFoundException('Sessão não encontrada');

    if (!['ABERTA', 'AGENDADA'].includes(sessao.statusSessao)) {
      throw new UnprocessableEntityException(
        'Registro de presença permitido apenas em sessão agendada ou aberta'
      );
    }

    return this.presencaRepo.upsert({
      sessaoId,
      parliamentarianId: user.parliamentarianId, // do JWT, nunca do body
      presente: true,
      situacao: 'PRESENTE',
      autoRegistrado: true,
      registradoEm: new Date(),
    });
  }
}
```

- [x] Criado em `registrar-minha-presenca.use-case.ts`
- [x] `parliamentarianId` do JWT via `PresencaSessao.parliamentarianId` (campo adicionado na migration)
- [x] Upsert por `sessaoId_parliamentarianId` (unique constraint adicionado)
- [x] `autoRegistrado = true`, `registradoEm = new Date()`
- [x] Verifica sessão ABERTA ou AGENDADA
- > **Nota:** DTO é vazio por definição do PROMPT — `modalidade` não é passado (campo passivo, sem lógica)

### T-04 · DTO `MinhaPresencaDto`

```ts
export class MinhaPresencaDto {
  // DTO vazio — autoRegistrado=true e parliamentarianId vêm do JWT
}
```

- [x] Criado como classe vazia em `minha-presenca.dto.ts`
  > Spec sugeria campo `modalidade` opcional, mas PROMPT.md define DTO como vazio — `modalidade` é campo passivo sem lógica atual.

### T-05 · `GetSessaoAtivaUseCase`

```ts
// GET /legislative/sessoes-plenarias/sessao-ativa
// Retorna a sessão ABERTA ou SUSPENSA do tenant
```

- [x] Criado em `get-sessao-ativa.use-case.ts`
- [x] Busca via `repository.findAtiva(user.tenantId)`
- [x] Inclui `minhaPresenca` (por `parliamentarianId`) e `votacaoAberta`
- [x] Retorna `null` quando nenhuma sessão ativa

---

## Fase 3 — Atualizar Controller de Sessões

### T-06 · Adicionar endpoints ao `SessoesPlenariasController`

```ts
// Endpoint exclusivo do App Parlamentar — auto-registro de presença
@Post(':id/minha-presenca')
@TenantRoles(...PARLIAMENTARIAN_ONLY)

// Sessão ativa — sem ID na rota
@Get('sessao-ativa')
@TenantRoles(...PARLIAMENTARIAN_ONLY)
```

- [x] `POST /:id/minha-presenca` → `RegistrarMinhaPresencaUseCase`
- [x] `GET /sessao-ativa` → `GetSessaoAtivaUseCase`
- [x] Ambos requerem `PARLIAMENTARIAN_ONLY` (TenantRoles)
- [x] `parliamentarianId` extraído de `req.user` (ParlamentarianAuthenticatedUser)

### T-07 · Atualizar `SessaoRepository` — adicionar `findAtiva`

```ts
// domain/repositories/sessao-plenaria.repository.ts
abstract findAtiva(tenantId: string): Promise<SessaoPlenaria | null>;
```

- [x] Método adicionado à classe abstrata `SessaoPlenariaRepository`
- [x] Implementado em `PrismaSessaoPlenariaRepository` (busca `ABERTA` ou `SUSPENSA`)

---

## Fase 4 — Atualizar Votação para voto remoto

### T-08 · `RegistrarVotoUseCase` — inferir `registradoRemoto`

```ts
async execute(votacaoId: string, dto: RegistrarVotoDto, user: ParlamentarianJwtPayload) {
  // Inferir se é remoto pela modalidade de presença
  const presenca = await presencaRepo.findByParlamentarian(
    votacao.pautaItem.sessaoId,
    user.parliamentarianId,
  );
  const registradoRemoto = presenca?.modalidade === 'REMOTO';

  return votoRepo.upsert({
    votacaoId,
    parliamentarianId: user.parliamentarianId, // do JWT
    voto: dto.voto,
    registradoRemoto,
  });
}
```

- [x] Gateway `emitVotacaoPlacar` chamado após registrar voto (no controller)
- [ ] `registradoRemoto` em `VotoParlamentar` — **pendente** (campo não adicionado ao schema/model)
- [ ] `parliamentarianId` do JWT para voto — **pendente** (`VotoParlamentar` ainda usa `parlamentarId` do body — migration separada necessária)

---

## Fase 5 — WebSocket Gateway

### T-09 · Instalar dependências

```bash
cd backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

- [x] Instalado: `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`

### T-10 · Criar `SessaoRealtimeGateway`

- [x] Criado em `src/legislativo/sessoes-plenarias/realtime/sessao-realtime.gateway.ts`
- [x] `@WebSocketGateway({ namespace: '/sessao', cors: { origin: '*' } })`
- [x] `handleConnection` — valida JWT e entra na sala `tenant:{tenantId}`; token inválido → `client.disconnect()`
- [x] `handleDisconnect` — limpeza automática via socket.io
- [x] 5 métodos de emit implementados:
  - `emitVotacaoAberta(tenantId, payload)`
  - `emitVotacaoPlacar(tenantId, payload)` — NUNCA expõe quem votou
  - `emitVotacaoEncerrada(tenantId, payload)` — NOMINAL inclui votos; SECRETA nunca
  - `emitSessaoFase(tenantId, payload)`
  - `emitSessaoEncerrada(tenantId, payload)`

### T-11 · Injetar gateway nos Use Cases e chamar emit nos momentos certos

- [x] `emitVotacaoAberta` — emitido no controller após `abrirVotacaoHandler`
- [x] `emitVotacaoPlacar` — emitido no controller após `registrarVotoHandler` (votacaoId; totais pendentes de melhoria)
- [x] `emitVotacaoEncerrada` — emitido no controller após `encerrarVotacaoHandler`
- [x] `emitSessaoFase` — emitido no controller após `setFaseHandler`
- [x] `emitSessaoEncerrada` — emitido no controller após `encerrarSessaoHandler`
- > **Nota:** eventos emitidos no controller (não nos use cases diretamente), para evitar dependência circular entre módulos. Gateway injetado em `SessoesController`.

### T-12 · Registrar gateway no módulo

```ts
// sessoes-plenarias.module.ts
@Module({
  providers: [
    // ... providers existentes
    SessaoRealtimeGateway,
    RegistrarMinhaPresencaUseCase,
    GetSessaoAtivaUseCase,
    SetFaseSessaoUseCase,
  ],
  exports: [SESSAO_PLENARIA_REPOSITORY, SessaoRealtimeGateway],
})
```

- [x] `SessaoRealtimeGateway` registrado em `providers`
- [x] `SessaoRealtimeGateway` exportado do módulo
- [x] `JwtModule.registerAsync` importado (necessário para o gateway)
- [x] `RegistrarMinhaPresencaUseCase`, `GetSessaoAtivaUseCase`, `SetFaseSessaoUseCase` registrados

---

## Fase 6 — Testes

### T-13 · Testes de novos use cases

- [ ] `RegistrarMinhaPresencaUseCase`:
  - Parlamentar registra presença → `autoRegistrado = true`
  - Sessão ENCERRADA → 422 em PT-BR
  - `parliamentarianId` vem do JWT, não aceita no body
- [ ] `GetSessaoAtivaUseCase`:
  - Sem sessão ativa → retorna `null`
  - Com sessão → inclui `votacaoAberta` e `minhaPresenca`
- [ ] WebSocket:
  - Cliente sem token → desconectado
  - Voto registrado → emit de placar sem identificar votante
  - Votação SECRETA encerrada → resultado sem votos individuais

---

## Checklist final

- [x] `POST /minha-presenca` — `parliamentarianId` do JWT, nunca do body
- [x] Staff pode registrar presença de parlamentar via `/presencas` (fallback manual)
- [x] `autoRegistrado = true` quando parlamentar registra pelo app
- [ ] `modalidade = REMOTO` quando parlamentar está fora da câmara — campo passivo, sem lógica ativa
- [ ] `registradoRemoto` em `VotoParlamentar` — pendente (schema e migration não aplicados)
- [x] WebSocket: cliente entra na sala `tenant:{tenantId}` ao conectar
- [x] Placar emitido a cada voto — sem identificar votante
- [x] Votação SECRETA: nem placar individual nem resultado individual jamais
- [ ] `linkTransmissao` — implementado como `linkJitsi` + `linkYoutube` (campo simples pendente)
- [x] `npx tsc --noEmit` passando
- [x] `npx jest` — 89/92 suites passando (3 falhas pré-existentes não relacionadas)
