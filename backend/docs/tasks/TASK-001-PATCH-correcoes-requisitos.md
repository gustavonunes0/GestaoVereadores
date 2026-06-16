# TASK-001-PATCH — Correções nas Migrations (pós-revisão do documento operacional)

**Origem:** REVIEW-001 — cruzamento com `legislativo_.docx`
**Aplica sobre:** TASK-001 (migrations M2 e M7)
**Executar antes de:** TASK-001b e TASK-005

> Estas correções devem ser incorporadas nas migrations M2 e M7 **antes** de executá-las.
> Se já foram executadas, criar migrations adicionais para cada item.

---

## Correção C1 — Migration M2: campos faltantes em `Materia`

Adicionar junto com os demais campos da M2:

```prisma
// Campos que estavam faltando em Materia
dataProtocolo   DateTime?    // GAP G4 — data do protocolo (diferente de numeroProtocolo)
justificativa   String?      @db.Text  // GAP G5 — justificativa da matéria
```

**Verificar:** O schema atual tem `numeroProtocolo Int?` mas não `dataProtocolo`. São campos distintos — número e data do protocolo.

Migration a adicionar:
```bash
npx prisma migrate dev --name add_data_protocolo_justificativa_materia
```

---

## Correção C2 — Migration M7: campos faltantes em `Norma`

Adicionar junto com os demais campos da M7:

```prisma
// Campos faltantes em Norma — do documento operacional
complementar     Boolean   @default(false)  // GAP G6 — "Complementar? Sim/Não"
textoIntegralUrl String?                    // GAP G7 — texto integral da norma (arquivo)
audioUrl         String?                    // GAP G7 — áudio da leitura da norma
```

---

## Correção C3 — Migration M7: campos faltantes em `Ato`

Adicionar além do `tenantId` já previsto:

```prisma
// Campos faltantes em Ato — do documento operacional
ementa          String?      // GAP G14 — ementa do ato
dataAto         DateTime?    // GAP G13 — data do ato (não é intervalo)
anexoUrl        String?      // GAP G14 — arquivo do ato (PDF/DOC)
textoUrl        String?      // GAP G14 — texto integral do ato
identificadorId String?      // GAP G12 — FK para IdentificadorNorma (mesma tabela)

identificador   IdentificadorNorma? @relation(fields: [identificadorId], references: [id])
```

> `dataInicio` e `dataFim` continuam existindo para compatibilidade legado.
> `dataAto` é o campo novo que corresponde ao requisito do documento ("Data*").

---

## Correção C4 — Seeds faltantes (todos no mesmo arquivo `prisma/seed.ts`)

### C4a — TipoAutor com IDs de negócio (GAP G2)

```typescript
// Os IDs de negócio (1–26) devem ser armazenados como campo separado para compatibilidade
// com dados legados do SIGL

const tiposAutor = [
  { idNegocio: 1,  nome: 'Parlamentar' },
  { idNegocio: 2,  nome: 'Frente Parlamentar' },
  { idNegocio: 3,  nome: 'Comissão' },
  { idNegocio: 4,  nome: 'Órgão' },
  { idNegocio: 5,  nome: 'Bancada Parlamentar' },
  { idNegocio: 6,  nome: 'Bloco Parlamentar' },
  { idNegocio: 7,  nome: 'Poder Executivo Municipal' },
  { idNegocio: 8,  nome: 'Presidente do Sindicato dos Professores' },
  { idNegocio: 9,  nome: 'Secretário' },
  { idNegocio: 10, nome: 'Sociedade' },
  { idNegocio: 11, nome: 'Coordenadora do CEO' },
  { idNegocio: 12, nome: 'Coordenadora de Saúde Bucal do Município' },
  { idNegocio: 13, nome: 'Advogado Município' },
  { idNegocio: 14, nome: 'Presidente do Sindicato dos Servidores' },
  { idNegocio: 15, nome: 'Presidente da OAB' },
  { idNegocio: 16, nome: 'Secretário de Cultura' },
  { idNegocio: 17, nome: 'Mesa Diretora' },
  { idNegocio: 20, nome: 'Comissão de Justiça e Redação (CJR)' },
  { idNegocio: 21, nome: 'Procurador' },
  { idNegocio: 22, nome: 'Liderança Regional' },
  { idNegocio: 23, nome: 'Deputado Federal' },
  { idNegocio: 24, nome: 'Presidente Municipal do PSL' },
  { idNegocio: 25, nome: 'Sindicato dos Servidores' },
  { idNegocio: 26, nome: 'Tribunal de Contas do Estado do Ceará' },
];
```

> **⚠️ Atenção:** `TipoAutor` tem `tenantId` — esses seeds devem ser criados por tenant,
> ou tornar `tenantId` nullable para tipos globais. Verificar e decidir antes de executar.
>
> **Recomendação:** Tornar `tenantId` nullable em `TipoAutor` para tipos globais (IDs 1–26 são
> iguais em todas as câmaras). Tipos customizados do tenant teriam `tenantId` preenchido.

### C4b — TipoMateria: adicionar siglas faltantes (GAP G1)

```typescript
// Adicionar ao seed existente de TipoMateria:
{ nome: 'Ofício',                     sigla: 'OFC',   ordem: 16 },
{ nome: 'Pedido de Veto de PLO',      sigla: 'PVPLO', ordem: 17 },
{ nome: 'Projeto de Lei (CTC)',        sigla: 'PLCTC', ordem: 18 },
```

> `PLCTC` aparece nos dados como `PLCTC nº 26/2019`, `28`, `29`, `30`.
> Investigar com a câmara o significado completo antes do deploy.

### C4c — TipoNorma com 16 tipos (GAP G8)

```typescript
const tiposNorma = [
  'Constituição Estadual',
  'Constituição Federal',
  'Decreto',
  'Decreto Legislativo',
  'Decreto Lei',
  'Emenda à Lei Orgânica',
  'Emenda Constitucional',
  'Emenda Constitucional de Revisão',
  'Lei',
  'Lei Complementar',
  'Lei Delegada',
  'Lei Orgânica',
  'Medida Provisória',
  'Portaria',
  'Regimento Interno',
  'Resolução',
];
```

### C4d — IdentificadorNorma com todos os valores (GAP G9)

```typescript
const identificadoresNorma = [
  'Lei Orgânica',
  'Regimento Interno',
  'Constituição Federal',
  'Constituição Estadual',
  'Regime Jurídico Único',
  'Código Tributário do Município',
  'Pessoal',
  'Licitações e Contratos',
  'Transparência Legislativa',
  'Transparência Administrativa',
  'Participação e Controle Social',
  'Contabilidade Governamental',
  'Aderência a LAI',
  'Lei de Proteção de Dados (LGPD)',
  'Lei do Governo Digital',
  'Estrutura Organizacional',
  'Diária',                    // aparece nos dados da Norma
  'Procuradoria da Mulher',     // aparece nos dados da Norma
  'Outros',
];
```

### C4e — EsferaFederacao (GAP G15)

```typescript
const esferasFederacao = ['Municipal', 'Estadual', 'Federal'];
```

### C4f — TipoAto com 4 tipos (GAP G10)

```typescript
const tiposAto = [
  'Decreto Legislativo',
  'Edital de Convocação',
  'Edital de Publicação',
  'Portaria',
];
```

### C4g — ClassificacaoAto com 11 valores (GAP G11)

```typescript
const classificacoesAto = [
  'Portaria Aprova Prestação de Contas de Governo',
  'Edital de Publicação - Prestação de Contas de Governo',
  'Sessão Extraordinária',
  'Sessão de Posse - Início de Legislatura',
  'Convoca Reunião da CDFO',
  'Convoca Reunião da CJR',
  'Convoca Reunião Pública',
  'Portaria de Nomeação',
  'Portaria de Exoneração',
  'Nomeia Membros das Comissões Permanentes',
];
```

---

## Correção C5 — SPEC-001: clarificar múltiplos relatores (GAP G3 / Ponto A1)

Adicionar na SPEC-001 seção "Regras de domínio":

```markdown
### Múltiplos relatores

O documento operacional especifica que uma matéria pode ter **mais de um relator**.

Implementação:
- O campo `rapporteurParliamentarianId` em `Materia` é LEGADO — não usar em código novo
- Relatores são armazenados em `MateriaAutorNew` com `papel = RELATOR`
- Não há limite de relatores por matéria
- `GetMateriaByIdUseCase` deve retornar relatores separados dos coautores no response:
  ```json
  {
    "relatores": [...],
    "coautores": [...],
    "representantes": [...]
  }
  ```
- `AddAutorMateriaUseCase` aceita `papel = RELATOR` para adicionar relator
```

---

## Checklist de correções

- [ ] C1: `dataProtocolo` e `justificativa` adicionados em migration M2
- [ ] C2: `complementar`, `textoIntegralUrl`, `audioUrl` adicionados em migration M7 para `Norma`
- [ ] C3: `ementa`, `dataAto`, `anexoUrl`, `textoUrl`, `identificadorId` adicionados em `Ato`
- [ ] C4a: Seed de TipoAutor com 26 tipos e IDs de negócio — decidir: global ou por tenant
- [ ] C4b: Seed de TipoMateria com OFC, PVPLO, PLCTC
- [ ] C4c: Seed de TipoNorma com 16 tipos
- [ ] C4d: Seed de IdentificadorNorma com todos os valores (incluindo Diária e Procuradoria da Mulher)
- [ ] C4e: Seed de EsferaFederacao
- [ ] C4f: Seed de TipoAto com 4 tipos
- [ ] C4g: Seed de ClassificacaoAto com 11 valores
- [ ] C5: SPEC-001 atualizada com seção de múltiplos relatores
- [ ] Verificar significado de PLCTC com a câmara cliente
