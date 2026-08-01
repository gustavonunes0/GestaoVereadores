# TASK-007 — Portal Público da Sessão + Geração de PDF

**Spec:** `backend/src/docs/specs/transparencia/SPEC-007-portal-publico.md`
**Depende de:** nada para a Parte 1 (PDF); TASK-006 (Ata) para a rota `/:id/ata/pdf` da Parte 2 (as outras rotas da Parte 2 não dependem de Ata)
**Módulos:** novo `src/common/pdf/`, extensão de `src/legislativo/sessoes-plenarias/`, extensão de `src/relatorios/`

> **Status: Fase 1 e 2 implementadas; Fase 3 (relatórios em PDF) e rate limiting NÃO feitos —
> gaps reais, não deixar passar batido.**

---

## Fase 1 — Fundação de PDF

### T-01 · Instalar dependência
- [x] `npm install puppeteer` em `backend/package.json` (+ `npm approve-scripts puppeteer` — o
      projeto usa o gate de install scripts do npm 11; só aprovei o pacote que instalei, não os
      outros pendentes) + `npm rebuild puppeteer` para baixar o Chromium
- [ ] Verificar `Dockerfile` do backend — **não feito**. Ajustar dependências de sistema do
      Chromium antes de buildar a imagem de produção.

### T-02 · Serviço de geração
- [x] `src/common/pdf/pdf-generator.service.ts` — `gerarDeHtml(html, opcoes?): Promise<Buffer>`
- [x] `src/common/pdf/pdf.module.ts` — exporta `PdfGeneratorService`
- [x] Reusar uma única instância de browser Puppeteer entre chamadas (`browserPromise` +
      `onModuleDestroy`)

### T-03 · Templates
- [x] `src/common/pdf/templates/lista-presenca.template.ts`
- [x] `src/common/pdf/templates/resumo-sessao.template.ts`
- [x] `src/common/pdf/templates/ata-sessao.template.ts`
- [x] (extra, não especificado) `src/common/pdf/templates/page-wrapper.ts` — layout HTML
      compartilhado pelos três templates acima

### T-04 · Testes
- [ ] `pdf-generator.service.spec.ts` — **escrito e depois removido**: Jest não consegue
      transformar `puppeteer` (pacote ESM-only, `"type": "module"`, falha com "Unexpected token
      'export'" mesmo com `transformIgnorePatterns` padrão) — precisaria de config extra de Jest
      para ESM que não foi feita, e rodar Chromium real em todo `jest` destoaria do padrão de
      testes rápidos/mockados do projeto
- [x] Teste manual: **feito fora do Jest** — script Node standalone (`require('puppeteer')` via
      CommonJS) confirmou que o Chromium baixa, abre e gera um PDF válido (`%PDF-` no header,
      38KB), rodando com `NODE_PATH` apontando para `node_modules` do backend. Script descartado
      após a verificação (não commitado).

---

## Fase 2 — Rotas públicas de sessão

### T-05 · Use cases de leitura pública
- [x] `get-resumo-publico-sessao.use-case.ts`
  - Busca sessão por `id`, sem tenant (confirmado que `agenda-legislativa/public` e `normas/public`
    também não filtram por tenant — busca é só pelo `id`, UUID não enumerável)
  - Rejeita (404) se `sessao.statusSessao !== ENCERRADA`
  - Monta: mesa diretora (via `Board`/`BoardMember`, não o `MesaDiretora` legado — está morto no
    código real), presença (nome + partido + `situacao`, **sem** `justificativa`), matérias com `resultado`
- [x] `get-lista-presenca-pdf.use-case.ts` — reusa os dados de `get-resumo-publico-sessao` +
      `lista-presenca.template.ts` + `PdfGeneratorService`
- [x] `get-ata-pdf.use-case.ts` — busca `Ata` por `sessaoPlenariaId` direto via Prisma (sem tenant,
      mesmo padrão); 404 se não existe ou não está `APROVADA`/`PUBLICADA`

### T-06 · View model público
- [ ] `resumo-sessao-publico.view-model.ts` — **não criado como classe separada**: o use case
      retorna um objeto tipado (`ResumoPublicoDados`) já auditado campo a campo (sem CPF,
      `justificativa` ou `tenantId`), mas não há uma classe `ViewModel` dedicada como convenção do
      resto do projeto usa

### T-07 · Controller
- [x] Em `sessoes.controller.ts`, seguir exatamente o padrão de `agenda.controller.ts:53`:
  ```ts
  import { Public } from '../../../auth/decorators/public.decorator'; // ajustar profundidade real do path

  @Public()
  @Get(':id/resumo-publico')
  resumoPublicoHandler(@Param('id', ParseUUIDPipe) id: string) {
    return this.getResumoPublicoSessao.execute(id);
  }

  @Public()
  @Get(':id/lista-presenca/pdf')
  async listaPresencaPdfHandler(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: FastifyReply,
  ) {
    const pdf = await this.getListaPresencaPdf.execute(id);
    res.type('application/pdf').send(pdf);
  }

  @Public()
  @Get(':id/ata/pdf')
  async ataPdfHandler(@Param('id', ParseUUIDPipe) id: string, @Res() res: FastifyReply) {
    const pdf = await this.getAtaPdf.execute(id);
    res.type('application/pdf').send(pdf);
  }
  ```
  > Confirmar se o projeto usa Fastify (`FastifyReply`) ou Express (`Response`) — checar
  > `main.ts`/outros controllers que já usam `@Res()` para manter consistência.

### T-08 · Rate limiting — **NÃO FEITO** (gap real de segurança antes de deploy)
- [ ] Confirmar se `@nestjs/throttler` já está instalado (`grep throttler backend/package.json`)
- [ ] Se não estiver: `npm install @nestjs/throttler`
- [ ] Aplicar `@Throttle({ default: { limit: 30, ttl: 60000 } })` (ou equivalente) nas 3 rotas
      públicas novas

---

## Fase 3 — Relatórios administrativos em PDF — **NÃO INICIADA**

### T-09 · Novos endpoints em `relatorios.controller.ts`
- [ ] `POST /relatorios/atividade-legislativa/completo/pdf` — mesmo DTO, chama
      `RelatoriosService.atividadeCompleto()` e formata resultado via novo template PDF
- [ ] `POST /relatorios/presenca/pdf` — idem para presença
- [ ] **Não remover** os endpoints JSON existentes (continuam intactos — não foram tocados)

### T-10 · Templates dos relatórios
- [ ] `src/relatorios/templates/atividade-legislativa.template.ts`
- [ ] `src/relatorios/templates/presenca.template.ts` (pode reaproveitar
      `lista-presenca.template.ts` de T-03 se o formato servir para ambos os casos — avaliar)

### T-11 · Testes
- [ ] `GET /:id/resumo-publico` sem token → 200 — implementado, não testado via HTTP real
- [ ] `GET /:id/resumo-publico` de sessão `AGENDADA` → 404 — implementado, não testado via HTTP real
- [ ] Response do resumo público não contém `justificativa` nem CPF — auditado por leitura de código, sem teste de contrato automatizado
- [ ] `GET /:id/ata/pdf` de ata `RASCUNHO` → 404 — implementado, não testado via HTTP real
- [ ] Isolamento de tenant nas rotas públicas — não aplicável da forma como foi desenhado (rotas não filtram por tenant, mesmo padrão de `agenda/public`/`normas/public` — ver T-05)

---

## Checklist
- [x] `puppeteer` instalado e gerando PDF válido em dev (verificado manualmente, ver T-04)
- [ ] Dockerfile do backend ajustado para dependências do Chromium — não feito
- [ ] 3 rotas públicas (`resumo-publico`, `lista-presenca/pdf`, `ata/pdf`) funcionam sem JWT — implementadas, não testadas via HTTP real (nenhum servidor foi iniciado)
- [ ] Rate limit aplicado nas rotas públicas antes de qualquer deploy — **não feito, bloqueante para produção**
- [x] Nenhum dado sensível (CPF, justificativa de falta) vaza no resumo público — auditado campo a campo no use case
- [ ] Relatórios administrativos existentes continuam funcionando (JSON, intactos) + nova opção PDF — **PDF não implementado** (Fase 3 inteira pendente)
