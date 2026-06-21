# SPEC-010 — Sistema de Votação e Quórum por Tipo de Matéria

**Status:** Aprovada | **Versão:** 1.0
**Complementa:** SPEC-003 (Votações) — adiciona quórum qualificado e voto de qualidade
**Referência PDF:** Caps 16 e 17 — Sistema de Votação e Quórum

---

## Background

O sistema atual conta votos e determina resultado por maioria simples
(`SIM > NAO → APROVADO`). O PDF (Caps 16 e 17) define que o tipo de
quórum exigido varia conforme o tipo de matéria:

| Tipo de matéria | Quórum | Maioria exigida |
|-----------------|--------|-----------------|
| PLO, PLC, REQ, IND, MOÇ, PAR, OFC | Maioria simples | Mais SIM que NAO entre presentes |
| PDL, PR, ELOM (veto derrubado) | Maioria absoluta | Mais da metade do total de membros |
| ELOM (Emenda Lei Orgânica) | 2/3 | 2/3 dos membros totais |
| Outras (por regimento) | Configurável | — |

Além disso, o Presidente da Mesa tem **voto de qualidade** (desempate)
quando o resultado é EMPATADO.

---

## O que JÁ EXISTE (não alterar)

```prisma
model Votacao {
  tipoVotacao  TipoVotacao     // NOMINAL | SIMBOLICA | SECRETA
  votosSim     Int @default(0) // calculados via groupBy, nunca inseridos direto
  votosNao     Int @default(0)
  abstencoes   Int @default(0)
  resultado    ResultadoVotacao?
  encerradaAt  DateTime?
  quorumVotacao Int?
}

enum ResultadoVotacao { APROVADO REJEITADO EMPATADO }
```

---

## O que muda — Migration M12

### Adicionar `tipoQuorum` em `TipoMateria`

```prisma
enum TipoQuorum {
  MAIORIA_SIMPLES     // mais SIM que NAO (padrão para a maioria das matérias)
  MAIORIA_ABSOLUTA    // mais da metade do total de membros ativos
  QUALIFICADO_DOIS_TERCOS    // 2/3 do total (ELOM)
  QUALIFICADO_TRES_QUINTOS   // 3/5 do total (casos especiais por regimento)
}

// Adicionar em TipoMateria:
tipoQuorum TipoQuorum @default(MAIORIA_SIMPLES)
```

### Adicionar campos em `Votacao`

```prisma
// Adicionar em Votacao:
tipoQuorum        TipoQuorum?   // copiado de TipoMateria no momento de criar a votação
totalMembros      Int?          // total de parlamentares ativos no momento da votação
votoQualidade     Boolean @default(false)  // true se o presidente usou voto de qualidade
presidenteId      String?       // parliamentarianId do presidente (para voto de qualidade
presidente        Parliamentarian? @relation(...)
```

---

## Seed: tipos de quórum por sigla de matéria

```ts
// Atualizar no seed após migration M12
const QUORUM_POR_SIGLA: Record<string, TipoQuorum> = {
  'PLO':   'MAIORIA_SIMPLES',
  'PLC':   'MAIORIA_SIMPLES',
  'PDL':   'MAIORIA_ABSOLUTA',
  'PR':    'MAIORIA_ABSOLUTA',
  'REQ':   'MAIORIA_SIMPLES',
  'IND':   'MAIORIA_SIMPLES',
  'SUB':   'MAIORIA_SIMPLES',
  'SUBE':  'MAIORIA_SIMPLES',
  'PAR':   'MAIORIA_SIMPLES',
  'REC':   'MAIORIA_SIMPLES',
  'ELOM':  'QUALIFICADO_DOIS_TERCOS',
  'EMD':   'MAIORIA_SIMPLES',
  'PIL':   'MAIORIA_SIMPLES',
  'PLOE':  'MAIORIA_SIMPLES',
  'MOÇ':   'MAIORIA_SIMPLES',
  'OFC':   'MAIORIA_SIMPLES',   // não vota, mas para completude
  'PVPLO': 'MAIORIA_ABSOLUTA',
  'PLCTC': 'MAIORIA_SIMPLES',
};
```

---

## `ResultadoVotacaoService` — atualizado

```ts
// domain/services/resultado-votacao.service.ts
export class ResultadoVotacaoService {
  determinar(params: {
    sim: number;
    nao: number;
    totalMembros: number;
    tipoQuorum: TipoQuorum;
  }): ResultadoVotacao {
    const { sim, nao, totalMembros, tipoQuorum } = params;

    switch (tipoQuorum) {
      case 'MAIORIA_SIMPLES':
        if (sim > nao) return 'APROVADO';
        if (nao > sim) return 'REJEITADO';
        return 'EMPATADO';

      case 'MAIORIA_ABSOLUTA': {
        const minimoAbsoluto = Math.floor(totalMembros / 2) + 1;
        if (sim >= minimoAbsoluto) return 'APROVADO';
        return 'REJEITADO'; // não atingiu maioria absoluta
      }

      case 'QUALIFICADO_DOIS_TERCOS': {
        const minimoDoisTercos = Math.ceil((totalMembros * 2) / 3);
        if (sim >= minimoDoisTercos) return 'APROVADO';
        return 'REJEITADO';
      }

      case 'QUALIFICADO_TRES_QUINTOS': {
        const minimoTresQuintos = Math.ceil((totalMembros * 3) / 5);
        if (sim >= minimoTresQuintos) return 'APROVADO';
        return 'REJEITADO';
      }

      default:
        throw new Error(`Tipo de quórum desconhecido: ${tipoQuorum}`);
    }
  }
}
```

---

## Voto de qualidade do Presidente

**RN-VOT-01:** Quando o resultado é `EMPATADO` em votação `MAIORIA_SIMPLES`,
o Presidente da Mesa pode exercer o voto de qualidade (desempate).

```ts
// EncerrarVotacaoUseCase — trecho adicional
if (resultado === 'EMPATADO') {
  // Verificar se o presidente está presente e não votou
  const presidente = await boardMemberRepo.findPresidenteAtivo(sessaoId, tenantId);
  if (presidente && dto.usarVotoQualidade) {
    // Presidente vota SIM ou NAO via dto.votoQualidade
    resultado = dto.votoQualidade === 'SIM' ? 'APROVADO' : 'REJEITADO';
    await votacaoRepo.registrarVotoQualidade(votacaoId, presidente.parliamentarianId, dto.votoQualidade);
  }
  // Se não usar voto de qualidade, mantém EMPATADO (sem aprovação)
}
```

**RN-VOT-02:** Voto de qualidade é registrado em `VotoParlamentar` com flag especial
e em `Votacao.votoQualidade = true`.

---

## `AbrirVotacaoUseCase` — atualizar

```ts
async execute(pautaItemId: string, dto: AbrirVotacaoDto, tenantId: string) {
  // Buscar tipo de matéria para obter tipoQuorum
  const pautaItem = await pautaItemRepo.findById(pautaItemId, tenantId);
  const materia = await materiaRepo.findById(pautaItem.materiaId, tenantId);
  const tipoMateria = await tipoMateriaRepo.findById(materia.tipoId);

  // Verificar que a matéria está na Ordem do Dia
  if (pautaItem.fase !== 'ORDEM_DO_DIA') {
    throw new BadRequestException('Apenas itens da Ordem do Dia podem ser votados');
  }
  // Verificar que é DELIBERACAO (não LEITURA)
  if (pautaItem.tipoPautaItem === 'LEITURA') {
    throw new BadRequestException('Item de expediente não pode ser votado');
  }

  const totalMembros = await parlamentarianRepo.countAtivos(tenantId);

  return votacaoRepo.create({
    pautaItemId,
    tipoVotacao: dto.tipoVotacao,
    tipoQuorum: tipoMateria.tipoQuorum,  // NOVO — copiado da matéria
    totalMembros,                         // NOVO — registrado no momento
    realizadaAt: new Date(),
  });
}
```

---

## `EncerrarVotacaoUseCase` — atualizar

```ts
async execute(votacaoId: string, dto: EncerrarVotacaoDto, tenantId: string) {
  const votacao = await votacaoRepo.findById(votacaoId, tenantId);

  // Calcular contagem via groupBy (nunca manual)
  const contagem = await votacaoRepo.calcularContagem(votacaoId);

  // Determinar resultado com tipo de quórum correto
  let resultado = resultadoVotacaoService.determinar({
    sim: contagem.sim,
    nao: contagem.nao,
    totalMembros: votacao.totalMembros,
    tipoQuorum: votacao.tipoQuorum,
  });

  // Voto de qualidade em caso de empate (maioria simples)
  if (resultado === 'EMPATADO' && dto.votoQualidade && votacao.tipoQuorum === 'MAIORIA_SIMPLES') {
    resultado = dto.votoQualidade === 'SIM' ? 'APROVADO' : 'REJEITADO';
    // Registrar o voto de qualidade
  }

  await votacaoRepo.encerrar(votacaoId, {
    votosSim: contagem.sim,
    votosNao: contagem.nao,
    abstencoes: contagem.abstencao,
    resultado,
    encerradaAt: new Date(),
    responsavelId: dto.responsavelId,
  });

  // Se aprovada: atualizar status da matéria
  if (resultado === 'APROVADO') {
    await materiaRepo.tramitar(materiaId, tenantId, {
      statusAnterior: 'EM_PAUTA',
      statusNovo: 'APROVADA',
      responsavelId: dto.responsavelId,
      despacho: 'Aprovada em votação plenária',
    });
  }
}
```

---

## Endpoints atualizados

| Método | Rota | Mudança |
|--------|------|---------|
| POST | `/votacoes` (abrir) | Copia `tipoQuorum` da matéria, registra `totalMembros` |
| POST | `/votacoes/:id/encerrar` | Usa `tipoQuorum` para determinar resultado; aceita `votoQualidade` |

### DTO atualizado `EncerrarVotacaoDto`

```ts
export class EncerrarVotacaoDto {
  @IsOptional() @IsEnum(['SIM', 'NAO'])
  votoQualidade?: 'SIM' | 'NAO';  // NOVO — apenas quando resultado seria EMPATADO

  @IsOptional() @IsString()
  motivoEmpate?: string;

  @IsOptional() @IsString()
  observacoes?: string;
}
```

---

## View Model — campos novos expostos

```ts
{
  id: string;
  tipoVotacao: string;
  tipoQuorum: string;       // NOVO — "Maioria Simples", "Maioria Absoluta", "2/3"
  totalMembros: number;     // NOVO — total no momento da votação
  quorumNecessario: number; // NOVO — calculado: mínimo de SIM para aprovar
  votosSim: number;
  votosNao: number;
  abstencoes: number;
  resultado: string;
  votoQualidade: boolean;   // NOVO — se presidente usou voto de desempate
  encerradaAt: string | null;
}
```

---

## Gathering Results

- [ ] PLO aprovada com SIM > NAO → APROVADO (maioria simples)
- [ ] ELOM com 60% de SIM mas total < 2/3 → REJEITADO (quórum qualificado)
- [ ] PDL com 50% de SIM → REJEITADO (maioria absoluta exige > 50%)
- [ ] Empate em PLO → presidente pode usar voto de qualidade
- [ ] Empate em ELOM → não há voto de qualidade (EMPATADO = REJEITADO por não atingir quórum)
- [ ] Matéria aprovada → status da matéria vai automaticamente para APROVADA
- [ ] `tipoQuorum` e `quorumNecessario` visíveis no response da votação
- [ ] Contadores calculados via groupBy, nunca inseridos manualmente
