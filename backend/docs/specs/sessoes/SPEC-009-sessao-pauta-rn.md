# SPEC-009 — Sessão Plenária e Pauta: Fluxo e Organização de Seções

**Status:** Aprovada | **Versão:** 1.0
**Complementa:** SPEC-002 (Sessões) — adiciona regras de negócio do PDF (Caps 6, 7, 8, 9)
**Depende de:** TASK-001 Migration M4 (StatusSessao) concluída

---

## Background

O PDF (Cap. 6, 7, 8, 9) define que uma sessão plenária tem seções com
ordem e regras distintas. A SPEC-002 modelou o ciclo de vida da sessão
corretamente (AGENDADA → ABERTA → SUSPENSA → ENCERRADA), mas não modelou
a **progressão interna de seções** nem as **regras de cada fase da pauta**.

A câmara opera com uma ordem regimental fixa:

```
1. Abertura (presidente declara aberta a sessão)
2. Expediente
   ├── Leitura de documentos recebidos
   ├── Indicações e ofícios (matérias tipo OFC, IND, REQ)
   └── Comunicações de vereadores
3. Ordem do Dia
   ├── Discussão de matérias
   └── Votação de matérias (requer quórum)
4. Explicações Pessoais (após encerramento da Ordem do Dia)
5. Encerramento
```

---

## O que JÁ EXISTE (não alterar)

```prisma
model SessaoPlenaria {
  statusSessao     StatusSessao @default(AGENDADA)  // M4
  dataAbertura     DateTime?
  dataEncerramento DateTime?
  dataSuspensao    DateTime?
  quorumMinimo     Int?
  quorumPresente   Int?
}

model PautaItem {
  fase       FasePauta       // PEQUENO_EXPEDIENTE | GRANDE_EXPEDIENTE | ORDEM_DO_DIA | EXPLICACOES_PESSOAIS
  resultado  ResultadoPauta?
  statusPauta StatusPautaItem @default(RASCUNHO)   // M4
  publicadaEm DateTime?
  ordemDia    Int?
}

enum FasePauta {
  PEQUENO_EXPEDIENTE
  GRANDE_EXPEDIENTE
  ORDEM_DO_DIA
  EXPLICACOES_PESSOAIS
}
```

---

## O que muda — Migration M11

### Adicionar `faseAtual` em `SessaoPlenaria` — como indicador, não trava

```prisma
enum FaseSessao {
  NAO_INICIADA
  EXPEDIENTE
  ORDEM_DO_DIA
  EXPLICACOES_PESSOAIS
  ENCERRADA
}

// Adicionar em SessaoPlenaria:
faseAtual FaseSessao @default(NAO_INICIADA)
```

> ⚠️ **`faseAtual` é um indicador de posição — não uma trava de acesso.**
>
> Ele informa em qual momento da sessão o presidente se encontra e aparece
> no painel para orientar todos os participantes. **Não impede votação de
> nenhum item.** O usuário pode votar qualquer matéria de qualquer fase
> enquanto a sessão estiver ABERTA.
>
> A progressão pode avançar E retroceder livremente — o presidente controla
> isso conforme o andamento real da sessão. Se precisar voltar ao Expediente
> para ler um ofício esquecido, pode.

### Adicionar `tipo` em `PautaItem` para distinguir leitura vs. votação

```prisma
enum TipoPautaItem {
  LEITURA        // expediente — lido em plenário, sem votação
  DELIBERACAO    // ordem do dia — pode ser votado
  COMUNICACAO    // comunicação — sem votação
}

// Adicionar em PautaItem:
tipoPautaItem TipoPautaItem @default(DELIBERACAO)
```

> `tipoPautaItem` É a única verificação que bloqueia votação:
> - `LEITURA` → nunca pode ser votado (regra de negócio real)
> - `DELIBERACAO` → pode ser votado a qualquer momento com sessão ABERTA
> - `COMUNICACAO` → nunca pode ser votado
>
> A `fase` do item (Expediente, Ordem do Dia) é apenas para **organização e
> ordenação visual** — não restringe o que pode ser feito com o item.

---

## Regras de negócio por fase

### Abertura da sessão (`AbrirSessaoUseCase` — já existe, adicionar regras)

**RN-SPL-01:** Para abrir a sessão, o quórum mínimo deve estar presente.
Quórum mínimo = metade + 1 dos parlamentares ativos do tenant (maioria simples).

```ts
const totalAtivos = await parlamentarianRepo.countAtivos(tenantId);
const quorumMinimo = Math.floor(totalAtivos / 2) + 1;
const presentes = await presencaRepo.countPresentes(sessaoId);
if (presentes < quorumMinimo) {
  throw new UnprocessableEntityException(
    `Quórum insuficiente: ${presentes} presentes, mínimo necessário ${quorumMinimo}`
  );
}
```

**RN-SPL-02:** `faseAtual` começa em `NAO_INICIADA` ao criar a sessão.
Ao abrir a sessão, vai automaticamente para `EXPEDIENTE`.

### Expediente (caps 7 e 8)

**RN-SPL-03:** Itens com `tipoPautaItem = LEITURA` são apenas lidos —
**não abrem votação**, independente de qualquer outra condição.
```ts
if (pautaItem.tipoPautaItem === 'LEITURA') {
  throw new BadRequestException('Item de leitura não pode ser votado');
}
if (pautaItem.tipoPautaItem === 'COMUNICACAO') {
  throw new BadRequestException('Comunicação não pode ser votada');
}
```

**RN-SPL-04:** Matérias tipo `OFC`, `IND`, `REQ` são inferidas automaticamente
para `fase = PEQUENO_EXPEDIENTE` e `tipoPautaItem = LEITURA` ao entrar na pauta.
O staff pode alterar manualmente se necessário.

**RN-SPL-05:** Ordem dentro de cada fase é controlada por `PautaItem.ordem`.
O reordenamento é livre — sem restrição de fase.

### Ordem do Dia (cap. 9) e navegação livre

**RN-SPL-06:** Item `DELIBERACAO` com sessão `ABERTA` pode ser votado
**independente do `faseAtual` da sessão**. O staff pode:
- Votar uma matéria da Ordem do Dia antes de encerrar o Expediente
- Retornar a um item não deliberado de fase anterior
- Pular itens e voltar depois

**RN-SPL-07:** Verificação antes de abrir votação:
```ts
// Única verificação de bloqueio:
if (sessao.statusSessao !== 'ABERTA') {
  throw new UnprocessableEntityException('Sessão não está aberta');
}
if (['LEITURA', 'COMUNICACAO'].includes(pautaItem.tipoPautaItem)) {
  throw new BadRequestException('Este tipo de item não pode ser votado');
}
// Sem verificação de faseAtual — votação é livre
```

**RN-SPL-08:** Item já deliberado (`resultado` preenchido) não pode
ser reaberto para nova votação na mesma sessão.

**RN-SPL-09:** Matéria aprovada em votação → status vai para `APROVADA`
automaticamente (via `EncerrarVotacaoUseCase`).

### Controle de faseAtual (livre, pelo presidente)

**RN-SPL-10:** `SetFaseSessaoUseCase` — presidente atualiza `faseAtual`
**sem restrição de direção** (pode avançar ou retroceder):
```ts
// Qualquer FaseSessao é permitida enquanto sessão ABERTA ou SUSPENSA
// Único bloqueio: sessão ENCERRADA ou CANCELADA
if (['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao)) {
  throw new BadRequestException('Sessão encerrada — fase não pode ser alterada');
}
```

---

## Novos Use Cases

### `SetFaseSessaoUseCase` (substitui `AdvancePhaseSessaoUseCase`)

```ts
// PATCH /legislative/sessoes-plenarias/:id/fase
// Roles: STAFF_AND_ABOVE
// Body: { faseAtual: FaseSessao }

async execute(sessaoId: string, novaFase: FaseSessao, tenantId: string) {
  const sessao = await repo.findById(sessaoId, tenantId);
  if (!sessao) throw new NotFoundException('Sessão não encontrada');

  if (['ENCERRADA', 'CANCELADA'].includes(sessao.statusSessao)) {
    throw new BadRequestException(
      'Sessão encerrada — não é possível alterar a fase'
    );
  }

  // SEM restrição de direção — pode avançar ou retroceder
  return repo.setFase(sessaoId, tenantId, novaFase);
}
```

### `CreatePautaItemUseCase` — inferência de fase e tipo

- Inferir `fase` a partir de `TipoMateria.sigla`
- Inferir `tipoPautaItem` a partir da sigla
- Permitir override manual em ambos os campos

---

## Endpoints

| Método | Rota | Use Case | Roles |
|--------|------|----------|-------|
| PATCH | `/sessoes-plenarias/:id/fase` | SetFaseSessaoUseCase | STAFF_AND_ABOVE |
| GET | `/sessoes-plenarias/:id/pauta` | GetSessaoByIdUseCase — retorna todos os itens com fase e ordem | ALL_AUTHENTICATED |

---

## Gathering Results

- [ ] Sessão não abre sem quórum → 422 com contagem em português
- [ ] Item OFC inferido como LEITURA automaticamente
- [ ] Votar item LEITURA → 400 em português
- [ ] Votar item DELIBERACAO com faseAtual = EXPEDIENTE → **permitido** (sem bloqueio por fase)
- [ ] Alterar `faseAtual` para qualquer valor → permitido com sessão ABERTA
- [ ] Alterar `faseAtual` com sessão ENCERRADA → 400 em português
- [ ] Item já deliberado não reabre votação → 409
- [ ] `faseAtual` e label PT visíveis no response da sessão
