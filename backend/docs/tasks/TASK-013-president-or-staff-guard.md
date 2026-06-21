# TASK-013 — PresidentOrStaffGuard: Presidente Controla Votação e Fase

**Spec de referência:** `backend/docs/review/REVIEW-003-gaps-sessao-presidente.md` GAP 2
**Depende de:** TASK-006 (guards base), TASK-007 (ParlamentarianUser + isPresidente)
**Módulo:** `src/auth/guards/` + patch em controllers de sessão e votação

> O Presidente da Câmara é um Parlamentar identificado via BoardMember
> no Board ativo do tenant. Ele pode abrir e encerrar votações e controlar
> a fase da sessão — sem depender do Staff para isso.

---

## Fase 1 — PresidenciaService

### T-01 · Criar `PresidenciaService`

```ts
// src/legislativo/sessoes-plenarias/domain/services/presidencia.service.ts

@Injectable()
export class PresidenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async isPresidente(parliamentarianId: string, tenantId: string): Promise<boolean> {
    const boardAtivo = await this.prisma.board.findFirst({
      where: { tenantId, isActive: true, isRemoved: false },
      include: {
        members: {
          where: { isRemoved: false },
          include: { boardRole: true },
        },
      },
    });

    if (!boardAtivo) return false;

    return boardAtivo.members.some(
      m =>
        m.parliamentarianId === parliamentarianId &&
        m.boardRole.name.toLowerCase().includes('president'),
    );
  }
}
```

- [x] Criar o arquivo acima
- [x] Exportar `PresidenciaService` do `SessoesPlenariasModule`
- [x] Registrar como `provider` no módulo

---

## Fase 2 — PresidentOrStaffGuard

### T-02 · Criar guard composto

```ts
// src/auth/guards/president-or-staff.guard.ts

import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException,
} from '@nestjs/common';
import { PresidenciaService } from '../../legislativo/sessoes-plenarias/domain/services/presidencia.service';
import { isStaffSession, isParlamentarianSession, JwtPayload } from '../dto/jwt-payload.dto';

@Injectable()
export class PresidentOrStaffGuard implements CanActivate {
  constructor(private readonly presidenciaService: PresidenciaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;

    // Staff (ADMIN_STAFF ou STAFF) sempre passa
    if (isStaffSession(user)) return true;

    // Parlamentar só passa se for o Presidente ativo
    if (isParlamentarianSession(user)) {
      const isP = await this.presidenciaService.isPresidente(
        user.parliamentarianId,
        user.tenantId,
      );
      if (!isP) {
        throw new ForbiddenException('Ação restrita ao Presidente da Câmara');
      }
      return true;
    }

    throw new ForbiddenException('Acesso não autorizado');
  }
}
```

- [x] Criar o arquivo acima
- [x] Exportar do `src/auth/guards/index.ts`
- [x] Registrar como provider no `SessoesPlenariasModule` (onde PresidenciaService está disponível)

### T-03 · Adicionar `PresidentOrStaffGuard` ao `guard-combos.ts`

```ts
// src/auth/guards/guard-combos.ts — adicionar:
export const PRESIDENTE_OR_STAFF_GUARDS = [
  JwtAuthGuard,
  TenantGuard,
  PresidentOrStaffGuard,
];
```

---

## Fase 3 — Patch nos controllers

### T-04 · `VotacoesController` — substituir guard nos endpoints de controle

```ts
// ANTES:
@Post()
@UseGuards(...STAFF_GUARDS)
abrirVotacao() {}

@Post(':id/encerrar')
@UseGuards(...STAFF_GUARDS)
encerrarVotacao() {}

// DEPOIS:
@Post()
@UseGuards(...PRESIDENTE_OR_STAFF_GUARDS)
abrirVotacao() {}

@Post(':id/encerrar')
@UseGuards(...PRESIDENTE_OR_STAFF_GUARDS)
encerrarVotacao() {}
```

- [x] Alterar `POST /legislative/sessoes/:id/pauta/:pautaItemId/votacao` → `PresidentOrStaffGuard`
- [x] Alterar `PATCH /legislative/sessoes/:id/pauta/:pautaItemId/votacao/encerrar` → `PresidentOrStaffGuard`

### T-05 · `SessoesPlenariasController` — substituir guard nos endpoints de controle

```ts
// ANTES: todos usavam STAFF_GUARDS
// DEPOIS:

@Patch(':id/fase')
@UseGuards(...PRESIDENTE_OR_STAFF_GUARDS)
setFase() {}

@Post(':id/encerrar')
@UseGuards(...PRESIDENTE_OR_STAFF_GUARDS)
encerrarSessao() {}

// Abrir, suspender e cancelar continuam STAFF_GUARDS (apenas Staff)
@Post(':id/abrir')
@UseGuards(...STAFF_GUARDS)
abrirSessao() {}

@Post(':id/suspender')
@UseGuards(...STAFF_GUARDS)
suspenderSessao() {}

@Post(':id/cancelar')
@UseGuards(...STAFF_GUARDS)
cancelarSessao() {}
```

- [x] Alterar `PATCH /sessoes/:id/fase` → `PresidentOrStaffGuard`
- [x] Alterar `POST /sessoes/:id/encerrar` → `PresidentOrStaffGuard`
- [x] Manter `POST /sessoes/:id/abrir`, `/suspender`, `/cancelar` como `STAFF_GUARDS`

> **Regra de negócio:** Abrir e suspender sessão é responsabilidade operacional
> do Staff (controle técnico da câmara). O Presidente controla o conteúdo
> legislativo: votações e progressão de fase.

---

## Fase 4 — Endpoint de sessão ativa com flag `euSouPresidente`

### T-06 · Atualizar `GetSessaoAtivaUseCase` (TASK-011)

O app mobile do Presidente precisa saber se deve exibir o painel de controles.
Adicionar flag no response de `GET /sessoes/sessao-ativa`:

```ts
// get-sessao-ativa.use-case.ts
async execute(tenantId: string, user: ParlamentarianJwtPayload) {
  const sessao = await sessaoRepo.findAtiva(tenantId);

  // Verificar se o parlamentar logado é o Presidente
  const euSouPresidente = await presidenciaService.isPresidente(
    user.parliamentarianId,
    tenantId,
  );

  return {
    sessao: SessaoViewModel.toHttp(sessao),
    faseAtual: sessao?.faseAtual ?? null,
    votacaoAberta: sessao?.votacaoAberta ?? null,
    minhaPresenca: null, // preenchido com presença do parlamentar
    euSouPresidente,     // NOVO — app usa para mostrar/ocultar controles
  };
}
```

- [x] Adicionar campo `euSouPresidente: boolean` no response
- [x] Injetar `PresidenciaService` no use case

---

## Fase 5 — Testes

### T-07 · Testes do `PresidentOrStaffGuard`

- [x] Staff (ADMIN_STAFF) → canActivate = true
- [x] Staff (STAFF) → canActivate = true
- [x] Parlamentar que É Presidente → canActivate = true
- [x] Parlamentar que NÃO é Presidente → ForbiddenException em PT-BR
- [x] Nenhum Board ativo no tenant → ForbiddenException em PT-BR

### T-08 · Testes de integração

- [ ] Presidente abre votação → 201
- [ ] Parlamentar comum tenta abrir votação → 403 "Ação restrita ao Presidente da Câmara"
- [ ] Staff abre votação → 201
- [ ] Presidente altera fase → 200
- [ ] Parlamentar comum altera fase → 403

### T-09 · Testes do `PresidenciaService`

- [ ] Board ativo com Presidente vinculado ao parlamentarianId → true
- [ ] Board ativo sem o parlamentarianId → false
- [ ] Sem Board ativo → false
- [ ] BoardRole com nome "Vice-Presidente" → false (não contém "president" sem "vice"?)
  > ⚠️ Decidir: o nome do BoardRole usa exatamente "Presidente"?
  > Se sim, usar `.toLowerCase() === 'presidente'` em vez de `.includes('president')`.
  > Confirmar com o seed de BoardRole antes de implementar.

---

## Checklist final

- [ ] `PresidenciaService` criado e testado
- [ ] `PresidentOrStaffGuard` criado e exportado
- [ ] `PRESIDENTE_OR_STAFF_GUARDS` no `guard-combos.ts`
- [ ] `POST /votacoes` aceita Presidente → 201
- [ ] `POST /votacoes/:id/encerrar` aceita Presidente → 200
- [ ] `PATCH /sessoes/:id/fase` aceita Presidente → 200
- [ ] `POST /sessoes/:id/encerrar` aceita Presidente → 200
- [ ] `POST /sessoes/:id/abrir` bloqueia Presidente → 403
- [ ] `GET /sessoes/sessao-ativa` retorna `euSouPresidente: true` para Presidente
- [ ] `npx tsc --noEmit` → zero erros
- [ ] `npx jest` → todos passando

---

## Notas para o Claude Code

- `PresidenciaService` faz query ao banco em cada request — não cachear por ora.
  Se performance for problema no futuro, cachear com TTL de 5 minutos.
- `PresidentOrStaffGuard` é `async` por causa da query ao banco — não esquecer o `await`
- O nome do `BoardRole` no banco deve ser verificado antes de implementar o `.includes()`.
  Se o seed usa exatamente "Presidente" (sem variações), usar comparação exata.
- Não confundir: Staff ainda pode abrir/suspender/cancelar sessão.
  Presidente ganha apenas controle sobre votações e progressão de fase.
