# REVIEW-002 — AutorExterno: Cruzamento com Requisitos do Documento Operacional

**Documento analisado:** `legislativo_.docx`
**Contexto:** Os 26 tipos de autor definidos no documento determinam os campos,
o modelo de dados e o seed necessário para `AutorExterno`, `TipoAutor` e `Autor`.

---

## 1. O que o documento define sobre autores

```
- 1 Matéria tem 1 autor principal
- Tipo do Autor:
    ID  1: Parlamentar
    ID  2: Frente Parlamentar
    ID  3: Comissão
    ID  4: Órgão
    ID  5: Bancada Parlamentar
    ID  6: Bloco Parlamentar
    ID  7: Poder Executivo Municipal
    ID  8: Presidente do Sindicato dos Professores
    ID  9: Secretário
    ID 10: Sociedade
    ID 11: Coordenadora do CEO
    ID 12: Coordenadora de Saúde Bucal do Município
    ID 13: Advogado Município
    ID 14: Presidente do Sindicato dos Servidores
    ID 15: Presidente da OAB
    ID 16: Secretário de Cultura
    ID 17: Mesa Diretora
    ID 20: Comissão de Justiça e Redação (CJR)
    ID 21: Procurador
    ID 22: Liderança Regional
    ID 23: Deputado Federal
    ID 24: Presidente Municipal do PSL
    ID 25: Sindicato dos Servidores
    ID 26: Tribunal de Contas do Estado do Ceará
- Coautores: múltiplos, mesmos tipos
- Relator: opcional, pode ter mais de 1
```

**Lacunas na numeração:** IDs 18 e 19 não aparecem no documento.
Podem existir no sistema legado — consultar a câmara antes de assumir que são inválidos.

---

## 2. Mapeamento: qual entidade representa cada tipo

| ID | Nome | Entidade correta | Categoria |
|----|------|-----------------|-----------|
| 1 | Parlamentar | `Parliamentarian` (novo EN) | Pessoa física com login |
| 2 | Frente Parlamentar | `AutorExterno` | Entidade coletiva |
| 3 | Comissão | `AutorExterno` | Entidade coletiva |
| 4 | Órgão | `AutorExterno` | Entidade coletiva |
| 5 | Bancada Parlamentar | `AutorExterno` | Entidade coletiva |
| 6 | Bloco Parlamentar | `AutorExterno` | Entidade coletiva |
| 7 | Poder Executivo Municipal | `AutorExterno` | Órgão institucional |
| 8 | Presidente do Sindicato dos Professores | `AutorExterno` | Cargo + pessoa |
| 9 | Secretário | `AutorExterno` | Cargo + pessoa |
| 10 | Sociedade | `AutorExterno` | Entidade genérica |
| 11 | Coordenadora do CEO | `AutorExterno` | Cargo + pessoa |
| 12 | Coordenadora de Saúde Bucal do Município | `AutorExterno` | Cargo + pessoa |
| 13 | Advogado Município | `AutorExterno` | Cargo + pessoa + registro profissional |
| 14 | Presidente do Sindicato dos Servidores | `AutorExterno` | Cargo + pessoa |
| 15 | Presidente da OAB | `AutorExterno` | Cargo + pessoa + registro profissional |
| 16 | Secretário de Cultura | `AutorExterno` | Cargo + pessoa |
| 17 | Mesa Diretora | `AutorExterno` | Órgão (já existe `Board` mas `Autor` não aponta para ele) |
| 20 | Comissão de Justiça e Redação (CJR) | `AutorExterno` | Comissão específica |
| 21 | Procurador | `AutorExterno` | Cargo + pessoa |
| 22 | Liderança Regional | `AutorExterno` | Cargo + pessoa |
| 23 | Deputado Federal | `AutorExterno` | Cargo + pessoa + partido + UF |
| 24 | Presidente Municipal do PSL | `AutorExterno` | Cargo + pessoa + partido |
| 25 | Sindicato dos Servidores | `AutorExterno` | Entidade |
| 26 | Tribunal de Contas do Estado do Ceará | `AutorExterno` | Órgão institucional |

---

## 3. Categorias de AutorExterno

A análise revela **três categorias funcionalmente distintas**:

### Categoria A — Entidade coletiva (sem pessoa física identificada)
IDs: 2, 3, 4, 5, 6, 7, 10, 17, 20, 25, 26

Campos necessários: apenas `nome` e `tipoAutorId`. Sem CPF, sem cargo individual.

Exemplos no banco real: "Frente pela Educação", "Comissão de Finanças", "Poder Executivo de Fortaleza"

### Categoria B — Cargo ocupado por pessoa física
IDs: 8, 9, 11, 12, 14, 16, 21, 22, 23, 24

Campos necessários: `nome` (da pessoa), `cargo` (o título do cargo), `instituicao` (onde trabalha), `cpf?`, `email?`, `telefone?`

Exemplos: `nome="João Silva"`, `cargo="Secretário de Educação"`, `instituicao="Prefeitura de Juazeiro do Norte"`

### Categoria C — Cargo com registro profissional
IDs: 13 (Advogado), 15 (Presidente da OAB)

Campos necessários: tudo da Categoria B + `registro` (número OAB, ex: "OAB/CE 12345")

### Categoria D — Cargo político externo
IDs: 23 (Deputado Federal), 24 (Presidente de partido)

Campos necessários: tudo da Categoria B + `partido` + `uf` (para deputado federal)

---

## 4. Gaps no modelo `AutorExterno` proposto nas tasks

O modelo proposto na Migration M3 é:
```prisma
model AutorExterno {
  id          String    @id @default(uuid())
  tenantId    String
  tipoAutorId String
  nome        String
  cargo       String?
  instituicao String?
  cpf         String?
  email       String?
  isRemoved   Boolean   @default(false)
  removedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Gap AE-01 — Falta `telefone` ❌
Autores externos frequentemente são identificados por telefone, especialmente cargos (Secretário, Procurador). O campo `email?` existe mas `telefone?` não.

### Gap AE-02 — Falta `registro` para profissionais liberais ❌
Os tipos ID 13 (Advogado) e ID 15 (Presidente da OAB) precisam de número de registro OAB. Sem isso, não há como identificar unicamente o profissional nem atender requisitos de autenticidade de assinatura de matérias.

### Gap AE-03 — Falta `partido` e `uf` para representantes políticos externos ❌
O tipo ID 23 (Deputado Federal) precisa de `partido` e `uf` (estado) para identificação correta. O tipo ID 24 (Presidente Municipal do PSL) precisa do `partido`. Sem esses campos, não há como distinguir "Deputado Federal pelo Ceará" de "Deputado Federal por São Paulo".

### Gap AE-04 — Falta `idNegocio` para migração do sistema legado ❌
O sistema legado (SIGL) usa os IDs 1–26 como identificadores fixos de negócio. Para migrar dados históricos corretamente, é necessário armazenar o `idNegocio` no `TipoAutor`. Sem isso, a importação de dados legados vai quebrar.

### Gap AE-05 — `TipoAutor` está por tenant mas deveria ter modo global ❌

**Problema atual:**
```prisma
model TipoAutor {
  tenantId String  // NOT NULL — obrigatório
  @@unique([tenantId, nome])
}
```

Os 26 tipos do documento são **iguais em todas as câmaras** (são definidos pela lei e regimento). Tornar `tenantId` NOT NULL força criar os mesmos 26 tipos para cada tenant individualmente no seed, gerando duplicação massiva de dados e inconsistência.

**Consequência prática:** Se uma câmara tiver 2 tenants (matriz e filial), os tipos precisam ser criados duas vezes. Se houver 100 câmaras no SaaS, 2.600 registros idênticos.

**Solução:** Tornar `tenantId` nullable: `NULL` = tipo global (vale para todos os tenants), preenchido = tipo customizado do tenant específico.

### Gap AE-06 — Não há vínculo com entidades existentes para IDs 2, 3, 17 ⚠️

Os tipos ID 2 (Frente Parlamentar), ID 3 (Comissão) e ID 17 (Mesa Diretora) têm entidades correspondentes no schema (`ParliamentaryFront`, `Committee`, `Board`). Quando uma Frente Parlamentar assina uma matéria como `AutorExterno`, não há como rastrear de qual `ParliamentaryFront` específica se trata.

**Análise de custo-benefício:** Implementar FKs opcionais para essas entidades (`frontId?`, `committeeId?`, `boardId?`) adiciona complexidade. Para uma primeira versão, armazenar o nome como texto livre (`nome = "Frente pela Educação Inclusiva"`) é suficiente e rastreável.

**Recomendação:** Deixar como texto livre por ora. Adicionar FKs opcionais em versão futura se houver demanda de relatório cruzado.

---

## 5. Gaps no modelo `Autor`

O model `Autor` tem campo `nome String` que é obrigatório. Este campo é o nome de exibição do autor. Porém, quando `autorExternoId` for preenchido, o nome já vem do `AutorExterno.nome` — o campo `Autor.nome` fica redundante e pode divergir.

### Gap AU-01 — `Autor.nome` é redundante quando `autorExternoId` preenchido ⚠️

**Análise:** Não é um bloqueio para a implementação, mas é um risco de inconsistência: o nome pode ser atualizado no `AutorExterno` mas não refletir no `Autor.nome`.

**Recomendação:** Tornar `Autor.nome` nullable e sempre resolver o nome via `AutorResolverService.resolverNome()`. O View Model monta o nome dinamicamente sem armazenar.

---

## 6. Gaps no `AutorResolverService`

A task atual define:

```typescript
// domain/services/autor-resolver.service.ts
validar(autorId, tenantId): Promise<void>  // valida exatamente 1 FK
resolverNome(autor: Autor): string          // retorna nome de exibição
```

### Gap ARS-01 — `resolverNomeCompleto` não considera cargo e instituição ❌

Para `AutorExterno` de Categoria B (cargo + pessoa), o nome de exibição correto é:
`"João Silva — Secretário de Educação (Prefeitura de Juazeiro do Norte)"`

E não apenas `"João Silva"`. A task não especifica esse comportamento.

### Gap ARS-02 — Sem método de busca por tipo de autor ❌

O frontend precisa listar autores disponíveis filtrados por tipo. Por exemplo, ao escolher tipo "Deputado Federal", deve listar apenas `AutorExterno` com `tipoAutor.idNegocio = 23`. Não há use case de listagem de `AutorExterno` nas tasks.

---

## 7. Resumo consolidado de todos os gaps

| # | Gap | Severidade | Onde corrigir |
|---|-----|-----------|---------------|
| AE-01 | Falta `telefone` em `AutorExterno` | 🟡 Médio | Migration M3 |
| AE-02 | Falta `registro` (OAB, CRM) em `AutorExterno` | 🔴 Alto — IDs 13 e 15 | Migration M3 |
| AE-03 | Falta `partido` e `uf` em `AutorExterno` | 🔴 Alto — IDs 23 e 24 | Migration M3 |
| AE-04 | Falta `idNegocio` em `TipoAutor` para migração legada | 🔴 Alto | Migration M3 |
| AE-05 | `TipoAutor.tenantId` NOT NULL impede tipos globais | 🔴 Crítico | Migration M3 |
| AE-06 | Sem FK para `ParliamentaryFront`, `Committee`, `Board` | 🟢 Baixo | Versão futura |
| AU-01 | `Autor.nome` redundante com `AutorExterno.nome` | 🟡 Médio | Migration M3 |
| ARS-01 | `resolverNome` não compõe cargo+pessoa | 🔴 Alto | TASK-001b T-04 |
| ARS-02 | Sem use case de listagem de `AutorExterno` | 🔴 Alto | TASK-001b (novo T-15) |
| TPA-01 | IDs 18 e 19 — lacuna na numeração, origem desconhecida | 🟡 Médio | Investigar c/ câmara |
