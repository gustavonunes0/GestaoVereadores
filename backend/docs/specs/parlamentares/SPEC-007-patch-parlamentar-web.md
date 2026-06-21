# SPEC-007-PATCH — Parlamentar na Plataforma Web

**Status:** Aprovada | **Versão:** 1.0
**Patch de:** SPEC-007 (ParlamentarianUser)
**Contexto:** A plataforma web serve dois perfis.
Staff acessa tudo. Parlamentar acessa apenas três seções restritas.

---

## Visibilidade do Parlamentar na plataforma web

| Seção | Staff | Parlamentar |
|-------|-------|-------------|
| Dashboard | ✅ Completo | ❌ Não vê |
| Sessões | ✅ CRUD | ❌ Não vê |
| Matérias | ✅ CRUD | ✅ Apenas as próprias (read-only) |
| Normas | ✅ CRUD | ❌ Não vê |
| Atos | ✅ CRUD | ❌ Não vê |
| Parlamentares | ✅ CRUD | ❌ Não vê |
| Mesa / Comissões / Frentes | ✅ CRUD | ✅ Apenas (read-only) |
| Autor Externo | ✅ CRUD | ❌ Não vê |
| Agenda | ✅ CRUD | ❌ Não vê |
| Relatórios | ✅ | ❌ Não vê |
| Câmara Gestão | ✅ | ❌ Não vê |
| Meu Perfil | — | ✅ Editar |
| Minha Biografia | — | ✅ Editar |
| Minhas Matérias | — | ✅ Ver onde é autor/coautor/relator |

---

## Endpoints backend — patch

### `GET /legislative/materias/minhas`

Retorna matérias onde o parlamentar logado tem participação como
autor principal, coautor ou relator.

```ts
// Guard: ParlamentarianGuard
// parliamentarianId do JWT — nunca do query param

async execute(parliamentarianId: string, tenantId: string, filtros: MinhasMateriasDto) {
  return this.prisma.materia.findMany({
    where: {
      tenantId,
      isRemoved: false,
      OR: [
        // autor principal
        { autores: { some: { parliamentarianId, papel: 'AUTOR' } } },
        // coautor
        { autores: { some: { parliamentarianId, papel: 'COAUTOR' } } },
        // relator
        { autores: { some: { parliamentarianId, papel: 'RELATOR' } } },
      ],
    },
    include: {
      tipo: true,
      autores: { include: { tipoAutor: true } },
      tramitacaoHistorico: { orderBy: { criadoEm: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

### `GET /legislative/parlamentares/me/perfil`

Já definido na SPEC-007. Retorna dados do próprio parlamentar.

### `PATCH /legislative/parlamentares/me/perfil`

Atualizar dados editáveis do próprio perfil.

```ts
// Guard: ParlamentarianGuard
// Campos editáveis pelo próprio parlamentar:
export class UpdateMeuPerfilDto {
  @IsOptional() @IsString() parliamentaryName?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() gabinete?: string;
}
// NÃO editável pelo próprio: partido, mandatos, status — gerenciados pelo Admin
```

### `PATCH /legislative/parlamentares/me/biografia`

```ts
// Guard: ParlamentarianGuard
export class UpdateMinhabiografiaDto {
  @IsString() @MaxLength(5000) biografia: string;
}
```

---

## Regra: parlamentar não cria matéria pela plataforma web

Matérias novas são criadas pelo App Mobile (fluxo simplificado).
Na plataforma web, o parlamentar apenas visualiza as existentes.

Se futuramente quiser criar matéria via web também, basta liberar
o endpoint `POST /legislative/materias` para `ParlamentarianGuard`
— o backend já suporta (SPEC-001), só o frontend web restringe.

---

## Sidebar do parlamentar na plataforma web

```
Meu Perfil
  └─ Perfil Parlamentar   → /parlamentar/perfil
  └─ Minha Biografia      → /parlamentar/biografia
Minhas Matérias           → /parlamentar/materias
```

Sem Dashboard, sem módulos de gestão.
Ao logar como parlamentar na web → redireciona para `/parlamentar/perfil`.

---

## Gathering Results

- [ ] `GET /legislative/materias/minhas` retorna apenas matérias de participação própria
- [ ] `PATCH /me/perfil` atualiza apenas campos permitidos
- [ ] `PATCH /me/biografia` atualiza o texto de biografia
- [ ] Parlamentar logado na web não vê rota `/` (Dashboard) — redireciona
- [ ] Parlamentar não vê sidebar de gestão (Sessões, Normas, Atos etc.)
- [ ] Botões Criar / Editar / Deletar ausentes na view de matérias do parlamentar
