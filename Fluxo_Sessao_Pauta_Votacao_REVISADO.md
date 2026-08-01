# Fluxo Sessão → Expediente → Ordem do Dia → Votação (revisão)

> Base: `Fluxo Sessão → Pauta → Votação.txt` (regra atual do sistema) cruzado com
> vídeos/áudios enviados pela Câmara mostrando o sistema em uso real (tela do
> Painel de Controle / Painel Digital da sessão plenária).
>
> Objetivo deste documento: apontar **onde a regra atual já cobre** o que a
> Câmara mostrou, **onde há lacuna de modelagem**, e **o que precisa ser
> decidido** antes de alterar código.

---

## 1. O que a Câmara confirmou como fluxo real

```
Sessão
 └─ EXPEDIENTE
      1. Chamada dos Vereadores
      2. Abertura da Sessão
      3. Leitura e discussão da Ata da sessão anterior
      4. Leitura do material do Expediente
      5. Orador do Expediente
 └─ ORDEM DO DIA
      • Matérias / Atos / Normas que entram em pauta
      • Votação das matérias
```

Isso bate com o diagrama de alto nível do `.txt` (`Definir fase EXPEDIENTE /
ORDEM_DO_DIA`), mas o `.txt` **não detalha os 5 sub-passos do Expediente** —
ele só descreve `fase` como troca de um enum (`PATCH /:id/fase`).

Nos vídeos, cada um desses 5 passos aparece na tela como um **item de
checklist com estado próprio**:

| Elemento visto na tela | Evidência |
|---|---|
| Status por passo | badge "● EXECUTADO" |
| Timestamp da ação | "AÇÃO EXECUTADA: 22/06/2026 18:56:02" |
| Mensagem de resultado | "CHAMADA DOS VEREADORES EXECUTADA COM SUCESSO" / "SESSÃO INICIADA COM SUCESSO" |
| Ação reversível (chamada) | botão "REINICIAR CHAMADA" |
| Texto legal ligado à etapa | "DE ACORDO COM O ART. 82 DO REGIMENTO INTERNO, PASSAMOS À ORDEM DO DIA" |
| Botão "MOSTRAR MENSAGEM" | parece exibir/ocultar o texto que vai para o telão/TV de retorno |

**Conclusão:** o Expediente não é uma fase única e sim uma **sub-máquina de
estados sequencial**, cada passo com seu próprio status, timestamp,
responsável e mensagem pública.

---

## 2. Gaps identificados frente ao modelo atual (`PautaItem` genérico)

O `.txt` define `PautaItem` com tipos `LEITURA / COMUNICACAO / DELIBERACAO`
e regra "Item LEITURA / COMUNICACAO não vota". Isso cobre parcialmente os
passos 3 e 4 (leitura de ata, leitura de material), mas **não cobre**:

### 2.1 Chamada dos Vereadores (roll call)
- Não existe menção a isso no modelo de dados atual — é tratado separado de
  `PresencaSessao`?
- Pergunta em aberto: **"Chamada dos Vereadores" registra `PresencaSessao`
  automaticamente, ou são duas coisas desconectadas hoje?** Se forem
  desconectadas, é um bug de integridade (presença podendo divergir da
  chamada oficial que aparece no painel).
- "Reiniciar Chamada" — não há use case equivalente listado no `.txt`
  (`RegistrarPresencaUseCase`? não aparece). Precisa mapear ou criar.

### 2.2 Abertura da Sessão
- Já coberto: `AbrirSessaoUseCase` (`POST /:id/abrir`). ✅ bate com o que a
  tela mostra ("SESSÃO INICIADA COM SUCESSO").

### 2.3 Leitura e discussão da Ata da sessão anterior
- Aparece um componente **"Controle de Atas"**, listando a sessão anterior
  ("22ª Sessão Ordinária...") com status **"VOTAÇÃO ENCERRADA"** e botão
  **"Selecionar"**.
- O `.txt` **não tem entidade `Ata`** no modelo de dados. Isso é uma lacuna
  real: hoje aparentemente a Ata é vinculada a uma sessão anterior e pode
  ser "selecionada" para leitura/discussão na sessão atual — mas não há
  como saber, pela regra documentada, se a Ata é:
  - (a) gerada automaticamente ao encerrar a sessão anterior, ou
  - (b) uma matéria/documento cadastrado manualmente.
- **Ação sugerida:** adicionar entidade `Ata` (1:1 com `SessaoPlenaria`
  encerrada) + regra de que a leitura da ata na sessão N referencia a Ata
  da sessão N-1.

### 2.4 Leitura do material do Expediente
- Tela mostra "Documentos para Leitura no Expediente" com botão
  **"+ ADICIONAR MATÉRIA"** e uma matéria listada (ex.: "PLOE Nº 22/2026",
  autor, ofício, etapa "Concluída").
- Isso confirma que materiais lidos no Expediente **são `PautaItem` do tipo
  `LEITURA`**, já coberto pela regra existente — ok, sem gap aqui, só
  precisa deixar explícito no fluxo que "Adicionar Matéria" dentro do
  Expediente usa o mesmo `AddPautaItemUseCase` do `.txt`.

### 2.5 Orador do Expediente
- Painel "Oradores" com **"Nenhum orador inscrito"**, botão **"Incluir
  Orador"** e um **cronômetro** (ex. `00:03`, contando).
- **Não existe entidade de Orador/Inscrição de Orador no modelo atual.**
  Isso é a lacuna mais clara: falta uma entidade tipo
  `OradorInscricao (parlamentarianId, pautaItemId ou sessaoId, fase,
  ordemInscricao, tempoConcedidoSegundos, tempoUsadoSegundos, status)`.
- Também aparece "Incluir Orador" **de novo depois**, na Ordem do Dia
  (bloco de votação) — ou seja, oradores podem se inscrever tanto no
  Expediente quanto durante a Ordem do Dia. A regra de negócio precisa
  declarar isso explicitamente (tempo de fala pode ser diferente por fase).

---

## 3. Ordem do Dia — ponto de atenção estrutural importante

- Mensagem fixa ligada ao artigo do regimento: **"De acordo com o Art. 82
  do Regimento Interno, passamos à Ordem do Dia."** — sugere que existem
  (ou deveriam existir) **templates de mensagem vinculados a artigos do
  Regimento Interno**, reaproveitáveis por Câmara/município (cada Câmara
  tem seu próprio regimento, artigo pode mudar).
- **"BLOCOS PARA VOTAÇÃO"** — isso é o achado mais importante do vídeo.
  A regra atual diz:
  > "1 votação por item de pauta" (Etapa 3, regras)
  Mas a tela mostra explicitamente uma seção chamada **"Blocos para
  Votação"**, sugerindo que **múltiplas matérias podem ser agrupadas em um
  único bloco e votadas juntas** (comum em Câmaras: votação em bloco de
  itens em regime de urgência ou pareceres favoráveis unânimes).

  **Isso contradiz ou estende a regra documentada?** Precisa ser
  esclarecido com o time/Câmara antes de qualquer mudança de schema:
  - Se for **agrupamento visual apenas** (a votação ainda é individual por
    item, só exibida agrupada na tela) → não precisa mudar o modelo,
    apenas o front.
  - Se for **votação real em bloco** (um único voto do parlamentar vale
    para N matérias) → precisa de uma nova entidade `BlocoVotacao (N
    PautaItem ── 1 Votacao)`, o que muda a constraint atual de
    "`Votacao` único por `pautaItemId`" para permitir N:1.

---

## 4. Encerramento

- Confirmado: mensagem fixa "Declaro encerrada a presente sessão", editável
  via "EDITAR" / "MOSTRAR MENSAGEM". Bate com `EncerrarSessaoUseCase` do
  `.txt`. ✅ sem gap.

---

## 5. Painel de Controle (achado novo, fora do fluxo documentado)

O segundo vídeo mostra um menu de ações do presidente/staff durante a
sessão, não mencionado em nenhum lugar do `.txt`:

| Botão | Provável função | Mapeamento no `.txt`? |
|---|---|---|
| Sirene | Alerta sonoro (chamar atenção do plenário) | ❌ não documentado |
| Pausar | Suspender sessão | ✅ provável = `SuspenderSessaoUseCase` |
| Presidência | Transferir/assumir presidência da sessão | ❌ não documentado |
| Refresh | Atualizar estado do painel | (técnico, não é regra de negócio) |
| Mesa | Configuração da mesa diretora? | ❌ não documentado |
| Mensagem | Enviar mensagem ao painel público/TV | ❌ não documentado (mas relacionado ao `useSessaoRealtime` / WebSocket citado no `.txt`) |
| Controle | Genérico — não dá pra saber sem abrir | ❌ |
| Microfones | Controle de microfones dos parlamentares | ❌ não documentado |
| Status | Ver status geral da sessão | provável leitura, não escrita |

**Ação sugerida:** cada botão precisa ser mapeado a um use case real (se já
existe) ou marcado como funcionalidade a ser formalizada na regra de
negócio — hoje o `.txt` só cobre o ciclo de vida "grande" da sessão
(abrir/suspender/encerrar/cancelar), não esses controles operacionais em
tempo real.

---

## 6. Resumo — o que fazer com isso

1. **Confirmar com a Câmara/time técnico** as 3 perguntas em aberto:
   - Chamada dos Vereadores gera `PresencaSessao` automaticamente?
   - Existe entidade `Ata` hoje, ou "Controle de Atas" é gambiarra de
     front sobre `PautaItem` antigo?
   - "Blocos para Votação" é agrupamento visual ou votação agregada real?
2. **Formalizar entidades que faltam:**
   - `AtoExpediente` (ou expandir `PautaItem` com sub-tipo) para os 5 passos
     fixos do Expediente, cada um com status/timestamp/mensagem.
   - `Ata` vinculada 1:1 à sessão encerrada.
   - `OradorInscricao` (fase, tempo concedido/usado, ordem).
   - Opcional: `TemplateMensagem` vinculado a artigo do Regimento Interno,
     por Câmara.
3. **Mapear os botões do Painel de Controle** a use cases existentes ou
   novos, mesmo que a implementação já exista — a regra de negócio
   documentada precisa refletir a realidade do sistema em produção.
4. **Decidir a questão de "Blocos para Votação"** antes de tocar em
   `Votacao`/`PautaItem`, porque muda uma constraint de unicidade
   (`1 votação por item` → possivelmente `N itens por votação`).

---

*Próximo passo sugerido: se você confirmar as respostas das 3 perguntas em
aberto (seção 6.1), eu atualizo o modelo de dados e as tabelas de
rotas/use-cases do documento original com as entidades novas.*
