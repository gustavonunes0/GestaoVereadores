# REVIEW-003 — Gaps Pendentes após Revisão de Fluxo

**Data:** 2025-06 | **Originado de:** revisão de fluxo completo da sessão

---

## O que está coberto ✅

| Funcionalidade | Spec | Status |
|---|---|---|
| TenantUser Staff / Admin Staff | SPEC-006 | ✅ |
| ParlamentarianUser | SPEC-007 | ✅ |
| TenantPartner (Autor Externo) | SPEC-008 | ✅ |
| Sessão: ciclo de vida, quórum, fase | SPEC-009 | ✅ |
| Votação: tipos de quórum, resultado | SPEC-010 | ✅ |
| App Parlamentar: presença, voto, WebSocket | SPEC-011 | ✅ |

---

## Gaps que precisam de spec e task

### GAP 1 — PedidoPalavra (PENDING: SPEC-012)

**O que é:** Botão no app do parlamentar que entra numa fila de pedidos.
O Presidente vê a fila no seu painel e concede ou nega.

**Model necessário:**
```prisma
enum StatusPedidoPalavra {
  AGUARDANDO
  CONCEDIDO
  NEGADO
  ENCERRADO
}

model PedidoPalavra {
  id                String               @id @default(uuid())
  sessaoId          String
  parliamentarianId String
  status            StatusPedidoPalavra  @default(AGUARDANDO)
  criadoEm          DateTime             @default(now())
  respondidoEm      DateTime?
  encerradoEm       DateTime?
  duracaoSegundos   Int?                 // opcional — timer de fala

  sessao          SessaoPlenaria  @relation(...)
  parliamentarian Parliamentarian @relation(...)

  @@index([sessaoId, status])
  @@map("pedidos_palavra")
}
```

**Endpoints:**
```
POST   /sessoes/:id/pedir-palavra           ParlamentarianGuard
GET    /sessoes/:id/pedidos-palavra         StaffGuard + isPresidente
PATCH  /sessoes/:id/pedidos-palavra/:pid    isPresidente
POST   /sessoes/:id/pedidos-palavra/:pid/encerrar  isPresidente
```

**Eventos WebSocket:**
```
palavra:pedida    → Staff + Presidente (nome do parlamentar)
palavra:concedida → todos (nome de quem recebeu a palavra)
palavra:negada    → apenas o parlamentar que pediu
palavra:encerrada → todos
```

---

### GAP 2 — Presidente controla votação (patch em SPEC-010 + SPEC-009)

**O que é:** Endpoints de abrir/encerrar votação e avançar fase aceitam
`StaffGuard OR isPresidente`, não mais apenas `StaffGuard`.

**Helper necessário:**
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
      m => m.parliamentarianId === parliamentarianId
        && m.boardRole.name.toLowerCase().includes('president')
    );
  }
}
```

**Guard composto:**
```ts
// src/auth/guards/president-or-staff.guard.ts
@Injectable()
export class PresidentOrStaffGuard implements CanActivate {
  constructor(private readonly presidenciaService: PresidenciaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;

    // Staff passa sempre
    if (isStaffSession(user)) return true;

    // Parlamentar só passa se for Presidente
    if (isParlamentarianSession(user)) {
      const isP = await this.presidenciaService.isPresidente(
        user.parliamentarianId,
        user.tenantId,
      );
      if (!isP) throw new ForbiddenException('Ação restrita ao Presidente da Câmara');
      return true;
    }

    throw new ForbiddenException('Acesso não autorizado');
  }
}
```

**Endpoints que mudam de guard:**
```
POST /votacoes                        → PresidentOrStaffGuard (era StaffGuard)
POST /votacoes/:id/encerrar           → PresidentOrStaffGuard (era StaffGuard)
PATCH /sessoes/:id/fase               → PresidentOrStaffGuard (era StaffGuard)
POST /sessoes/:id/encerrar            → PresidentOrStaffGuard (era StaffGuard)
```

---

### GAP 3 — Painel TV (frontend only)

**O que é:** Rota `/painel-tv` no frontend — view fullscreen dedicada para
o browser aberto na TV da câmara. Sem login necessário (ou token de Staff).
Dados recebidos via WebSocket (eventos já implementados na SPEC-011).

**O que exibe:**
- Fase atual da sessão (EXPEDIENTE / ORDEM DO DIA / etc.)
- Matéria em discussão (identificação + ementa — fonte grande)
- Placar de votação em tempo real (números grandes, visíveis de longe)
- Quem está com a palavra (nome do parlamentar em destaque)

**Implementação:** React page + socket.io client. Sem chamadas REST.
Sem sidebar, sem header — tela limpa maximizada.

---

## Ordem de implementação

```
Backend:
  1. SPEC/TASK-012 — PedidoPalavra (novo model + endpoints + WS)
  2. Patch SPEC-010/009 — PresidentOrStaffGuard nos endpoints de votação e fase

Frontend:
  3. TASK-FE-011 — PainelTVPage (/painel-tv) — somente consumo de WS
  4. TASK-FE-012 — App Parlamentar: tela de pedido de palavra
  5. TASK-FE-013 — App Presidente: painel de controle (aba extra na view parlamentar)
```
