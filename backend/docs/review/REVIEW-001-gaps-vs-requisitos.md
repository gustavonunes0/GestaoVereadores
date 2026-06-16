# REVIEW-001 — Cruzamento Tasks vs. Requisitos do Documento Operacional

**Documento analisado:** `legislativo_.docx`
**Tasks revisadas:** TASK-001 (migrations) · TASK-001b (materias) · TASK-005 (normas)
**Data:** 2025-06

Status de cada requisito:
- ✅ Coberto nas tasks
- ⚠️ Parcialmente coberto — precisa ajuste
- ❌ GAP — não coberto, task precisa ser atualizada

---

## BLOCO 1 — MATÉRIA LEGISLATIVA

### 1.1 Tipos de Matéria e siglas

**Requisito do doc:** 15 tipos nomeados + dados reais mostram mais 3 siglas em uso

| Sigla | Nome no doc | Status nas tasks |
|-------|-------------|-----------------|
| PLO | Projeto de Lei Ordinária | ✅ no seed TASK-001b T-14 |
| PLC | Projeto de Lei Complementar | ✅ no seed |
| PDL | Projeto de Decreto Legislativo | ✅ no seed |
| PR | Projeto de Resolução | ✅ no seed |
| REQ | Requerimento Legislativo | ✅ no seed |
| IND | Indicação | ✅ no seed |
| SUB | Substitutivo | ✅ no seed |
| SUBE | Sub-emenda | ✅ no seed |
| PAR | Parecer | ✅ no seed |
| REC | Recurso | ✅ no seed |
| ELOM | Emenda à Lei Orgânica do Município | ✅ no seed |
| EMD | Emenda | ✅ no seed |
| PIL | Projeto de Indicação de Lei | ✅ no seed |
| PLOE | Projeto de Lei - Executivo | ✅ no seed |
| MOÇ | Moção | ✅ no seed |
| **OFC** | **Ofício** | ❌ **FALTA no seed** — aparece centenas de vezes nos dados reais |
| **PVPLO** | **Pedido de Veto de PLO** | ❌ **FALTA no seed** — PVPLO nº 7/2019, PVPLO nº 1/2020 |
| **PLCTC** | **Projeto de Lei (tipo não identificado)** | ❌ **FALTA no seed** — PLCTC nº 26/2019, 28, 29, 30 |

**Ação necessária:** Adicionar OFC, PVPLO e PLCTC no seed de TipoMateria do TASK-001b T-14.

---

### 1.2 Autor principal

**Requisito:** "1 Matéria pode 1 autor" — um autor principal obrigatório
**Status:** ✅ Coberto — `Materia.autorId → Autor` existe, `CreateMateriaDto.autorId` está na TASK-001b T-07

---

### 1.3 Tipos de Autor — 26 tipos documentados

**Requisito:** 26 tipos de autor com IDs específicos

| ID | Tipo | Mapeamento atual | Status |
|----|------|-----------------|--------|
| 1 | Parlamentar | `Parliamentarian` (novo) ou `Parlamentar` (legado) | ✅ coberto |
| 2 | Frente Parlamentar | `AutorExterno` | ✅ coberto |
| 3 | Comissão | `AutorExterno` | ✅ coberto |
| 4 | Órgão | `AutorExterno` | ✅ coberto |
| 5 | Bancada Parlamentar | `AutorExterno` | ✅ coberto |
| 6 | Bloco Parlamentar | `AutorExterno` | ✅ coberto |
| 7 | Poder Executivo Municipal | `AutorExterno` | ✅ coberto |
| 8 | Presidente do Sindicato dos Professores | `AutorExterno` | ✅ coberto |
| 9 | Secretário | `AutorExterno` | ✅ coberto |
| 10 | Sociedade | `AutorExterno` | ✅ coberto |
| 11 | Coordenadora do CEO | `AutorExterno` | ✅ coberto |
| 12 | Coordenadora de Saúde Bucal | `AutorExterno` | ✅ coberto |
| 13 | Advogado Município | `AutorExterno` | ✅ coberto |
| 14 | Presidente do Sindicato dos Servidores | `AutorExterno` | ✅ coberto |
| 15 | Presidente da OAB | `AutorExterno` | ✅ coberto |
| 16 | Secretário de Cultura | `AutorExterno` | ✅ coberto |
| 17 | Mesa Diretora | `AutorExterno` | ✅ coberto |
| 20 | Comissão de Justiça e Redação (CJR) | `AutorExterno` | ✅ coberto |
| 21 | Procurador | `AutorExterno` | ✅ coberto |
| 22 | Liderança Regional | `AutorExterno` | ✅ coberto |
| 23 | Deputado Federal | `AutorExterno` | ✅ coberto |
| 24 | Presidente Municipal do PSL | `AutorExterno` | ✅ coberto |
| 25 | Sindicato dos Servidores | `AutorExterno` | ✅ coberto |
| 26 | Tribunal de Contas do Estado do Ceará | `AutorExterno` | ✅ coberto |

**⚠️ Ponto de atenção:** Os tipos 2–26 (não-parlamentares) precisam de seed em `TipoAutor` com os IDs fixos (1–26). Isso não está nas tasks atuais.

**Ação necessária:** Adicionar seed de `TipoAutor` no TASK-001b T-14 com todos os 26 tipos e seus IDs de negócio.

---

### 1.4 Coautores

**Requisito:** "Pode ter vários coautores (opcional) – Com a mesma opção de tipos do Autor"
**Status:** ✅ Coberto — `MatterCoauthor` (novo EN) existe no schema. TASK-001b T-10 tem `AddAutorMateriaUseCase`.

**⚠️ Ponto de atenção:** O doc diz "mesmos tipos do Autor" — coautores podem ser AutorExterno também (não apenas Parliamentarian). A TASK-001b T-10 (`add-autor-materia.dto.ts`) usa `autorId` que aponta para `Autor`, o que é correto pois `Autor` já é polimórfico. OK.

---

### 1.5 Relator (múltiplos)

**Requisito:** "Matéria pode ter mais de 1 Relator (campo opcional)"
**Status:** ❌ **GAP CRÍTICO**

O schema atual tem apenas **um** relator:
- `rapporteurParliamentarianId String?` → um relator do modelo novo
- `relatorId String?` → um relator legado

O documento exige **múltiplos relatores**. Isso não está nas migrations nem nas tasks.

**Ação necessária:**
1. Migration M2 deve adicionar no model `MateriaAutorNew` (ou criar `MateriaRelator`) o papel `RELATOR` permitindo múltiplos
2. Ou: usar a tabela `MateriaAutorNew` com `papel = RELATOR` para múltiplos relatores — verificar se isso está claro na SPEC-001

**Análise:** A SPEC-001 tem `PapelAutorMateria { COAUTOR RELATOR REPRESENTANTE }` e `add-autor-materia.dto.ts` com o campo `papel`. Isso tecnicamente suporta múltiplos relatores via `MateriaAutorNew` com papel RELATOR. **MAS** a task não diz explicitamente que múltiplos relatores devem usar essa tabela — pode confundir o Claude Code que vai olhar para `rapporteurParliamentarianId`.

**Correção necessária na SPEC-001:** Adicionar nota explícita que múltiplos relatores usam `MateriaAutorNew` com `papel = RELATOR`, e que `rapporteurParliamentarianId` é campo legado a não usar em código novo.

---

### 1.6 Data do protocolo

**Requisito:** campo `Data do protocolo`
**Status:** ⚠️ Parcial — `numeroProtocolo Int?` existe mas **não há `dataProtocolo DateTime?`**

O schema tem o número do protocolo mas não a data. São campos distintos.

**Ação necessária:** Adicionar `dataProtocolo DateTime?` em `Materia` na migration M2.

---

### 1.7 Ementa

**Requisito:** campo `Ementa`
**Status:** ✅ Coberto — `ementa String` existe em `Materia`

---

### 1.8 Justificativa

**Requisito:** campo `Justificativa`
**Status:** ⚠️ Não está no schema atual — `Materia` não tem campo `justificativa`.

A TASK-001b menciona `justificativa` no View Model mas não há migration adicionando esse campo.

**Ação necessária:** Adicionar `justificativa String? @db.Text` em `Materia` na migration M2.

---

### 1.9 Texto Original (arquivo)

**Requisito:** "Texto Original Arquivo (pode ser PDF, DOC e outros)"
**Status:** ✅ Coberto — migration M2 adiciona `textoOriginalUrl String?`

---

## BLOCO 2 — NORMA JURÍDICA

### 2.1 Tipos de Norma (16 tipos)

**Requisito:** 16 tipos listados no doc

O modelo `TipoNorma` é global (sem `tenantId`) com `nome @unique`. Existe no schema.

**Status:** ⚠️ As tasks não têm seed para popular os 16 tipos de norma.

**Ação necessária:** Adicionar seed de `TipoNorma` no TASK-005 com os 16 tipos exatos do documento.

---

### 2.2 Ano, Número, Data, Esfera Federação

**Status:** ✅ Cobertos — existem em `Norma`: `numero · anoId · data · esferaFederacaoId`

---

### 2.3 Campo "Complementar?"

**Requisito:** campo booleano "Complementar? Sim/Não"
**Status:** ❌ **GAP** — não existe em `Norma` nem nas migrations

**Ação necessária:** Adicionar `complementar Boolean @default(false)` em `Norma` na migration M7.

---

### 2.4 Vínculo com Matéria (Tipo de Matéria, Ano Matéria, Matéria)

**Requisito:** campos de pesquisa que vinculam norma à matéria de origem
**Status:** ✅ Coberto — `materiaOrigemId String?` existe em `Norma`

O documento mostra esses como campos de filtro/pesquisa (não dados armazenados separadamente). O vínculo via `materiaOrigemId` atende.

---

### 2.5 Data Publicação, Veículo Publicação, Pg. Início, Pg. Fim

**Requisito:** campos de publicação oficial da norma
**Status:** ✅ Cobertos na migration M7 (`dataPublicacao · veiculoPublicacao` etc.) e via `PublicacaoOficial`

**⚠️ Ponto de atenção:** O documento trata `dataPublicacao` como campo da Norma (não tabela separada). A migration M7 deve garantir que esses campos existam diretamente em `Norma` além do model `PublicacaoOficial`. Isso já está na SPEC-005. ✅

---

### 2.6 Identificador (17+ valores)

**Requisito:** lista de identificadores: LEI ORGÂNICA, REGIMENTO INTERNO, CF, CE, RJU, CTM, PESSOAL, LICITAÇÕES, TRANSP. LEG., TRANSP. ADM., PARTICIPAÇÃO, CONTABILIDADE, LAI, LGPD, GOV. DIGITAL, ESTRUTURA ORGANIZACIONAL, OUTROS

**Status:** ⚠️ O model `IdentificadorNorma` existe mas não há seed com esses valores nas tasks.

**⚠️ Diferença do doc vs. tasks:** O documento tem "Diária" e "Procuradoria da Mulher" como identificadores adicionais nos dados da Norma Jurídica (não nos campos de Matéria). Isso não estava mapeado antes.

**Ação necessária:** Adicionar seed de `IdentificadorNorma` no TASK-005 com todos os valores.

---

### 2.7 URL externa, Texto Integral (arquivo), Áudio (arquivo)

**Requisito:** três campos de conteúdo digital
**Status:**
- `urlExternaPublicacao` ✅ — adicionado em M2/M7
- `textoIntegralUrl` ✅ — adicionado em M2
- `audioUrl` ✅ — adicionado em M2

**⚠️ Ponto de atenção:** O documento associa esses campos à **Norma Jurídica**, não só à Matéria. A migration M7 em TASK-001 não adiciona `textoIntegralUrl · audioUrl` em `Norma`. Só em `Materia`.

**Ação necessária:** Adicionar `textoIntegralUrl String?` e `audioUrl String?` também em `Norma` na migration M7.

---

### 2.8 Ementa e Observação

**Requisito:** `Ementa*` (obrigatória) e `Observação`
**Status:**
- `ementa String` ✅ existe em `Norma`
- `observacao/mensagem` ✅ `mensagem String?` existe em `Norma` (equivalente a observação)

---

## BLOCO 3 — ATO ADMINISTRATIVO

### 3.1 Tipos de Ato (4 tipos)

**Requisito:** Decreto Legislativo, Edital de convocação, Edital de publicação, Portaria
**Status:** ⚠️ O model `TipoAto` existe mas não há seed com esses 4 tipos nas tasks.

**Ação necessária:** Adicionar seed de `TipoAto` no TASK-005.

---

### 3.2 Classificação (11 classificações)

**Requisito:** 11 valores de classificação listados no doc
**Status:** ⚠️ `ClassificacaoAto` existe mas sem seed nas tasks.

**Ação necessária:** Adicionar seed de `ClassificacaoAto` com os 11 valores no TASK-005.

---

### 3.3 Identificador

**Requisito:** mesma lista da Norma
**Status:** ⚠️ O model `IdentificadorNorma` é usado por Norma, mas Ato usa campos separados sem FK para identificador.

**Ação necessária:** Verificar se `Ato` deve ter FK para `IdentificadorNorma` ou campo texto livre. O documento usa a mesma lista, então deve ser a mesma tabela.

---

### 3.4 Número, Data, Data Publicação

**Status:** ✅ `numero · dataInicio · dataPublicacaoInicio` existem em `Ato`

**⚠️ Ponto de atenção:** O doc usa "Data" (única) e "Data Publicação" (única). O schema tem `dataInicio` e `dataFim` + `dataPublicacaoInicio` e `dataPublicacaoFim` (dois campos cada). A semântica é diferente — o doc pede datas simples, o schema tem intervalos. Para Ato, "Data" provavelmente é a data do ato (único campo), não um intervalo.

**Ação necessária:** Renomear ou adicionar campo `dataAto DateTime?` em `Ato` na migration M7 para corresponder ao requisito do documento.

---

### 3.5 Anexo (arquivo), Texto, Ementa

**Requisito:** Anexo (obrigatório, DOC/PDF), Texto, Ementa
**Status:**
- Ementa: ❌ **Não existe em `Ato`** — o schema tem apenas `mensagem`
- Texto/Anexo: ❌ **Não existe em `Ato`** — sem `textoUrl` nem `anexoUrl`

**Ação necessária:** Adicionar em `Ato`:
- `ementa String?`
- `anexoUrl String?`
- `textoUrl String?`

Na migration M7.

---

## RESUMO DOS GAPS ENCONTRADOS

### ❌ Gaps não cobertos (precisam de task nova ou correção)

| # | Gap | Onde corrigir |
|---|-----|---------------|
| G1 | Siglas OFC, PVPLO, PLCTC ausentes no seed | TASK-001b T-14 |
| G2 | Seed de TipoAutor com 26 tipos e IDs de negócio | TASK-001b T-14 (novo item) |
| G3 | Múltiplos relatores — SPEC-001 ambígua | SPEC-001 (clarificar) |
| G4 | `dataProtocolo DateTime?` ausente em Materia | TASK-001 M2 |
| G5 | `justificativa String?` ausente em Materia | TASK-001 M2 |
| G6 | `complementar Boolean` ausente em Norma | TASK-001 M7 |
| G7 | `textoIntegralUrl · audioUrl` ausentes em Norma | TASK-001 M7 |
| G8 | Seed de TipoNorma com 16 tipos | TASK-005 |
| G9 | Seed de IdentificadorNorma com 17+ valores | TASK-005 |
| G10 | Seed de TipoAto com 4 tipos | TASK-005 |
| G11 | Seed de ClassificacaoAto com 11 valores | TASK-005 |
| G12 | `Ato` sem FK para `IdentificadorNorma` | TASK-001 M7 |
| G13 | `Ato` sem campo `dataAto` (usa `dataInicio` com semântica errada) | TASK-001 M7 |
| G14 | `Ato` sem `ementa`, `anexoUrl`, `textoUrl` | TASK-001 M7 |
| G15 | Seed de EsferaFederacao (Municipal, Estadual, Federal) | TASK-005 |

### ⚠️ Pontos de atenção (cobertos mas precisam de clareza)

| # | Ponto | Ação |
|---|-------|------|
| A1 | `rapporteurParliamentarianId` é legado — múltiplos relatores via `MateriaAutorNew` | Deixar claro na SPEC-001 |
| A2 | Campos de publicação (veículo, pg) devem existir tanto em Materia quanto em Norma | Confirmar migration M7 |
| A3 | `EsferaFederacao` com 3 valores fixos — candidato a enum | ADR pendente |

### ✅ Totalmente cobertos (não mexer)

Tipos de matéria (15 principais), autor polimórfico, coautores via `MatterCoauthor`, campos ementa/numero/ano, ciclo de vida da norma (migrations M7), publicações oficiais via `PublicacaoOficial`, texto original em Materia.
