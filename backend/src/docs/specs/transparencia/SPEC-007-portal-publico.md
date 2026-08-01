# SPEC-007 — Portal Público da Sessão + Geração de PDF

**Status:** Aprovada | **Versão:** 1.0
**Submódulos afetados:** `src/legislativo/sessoes-plenarias/`, `src/relatorios/`, novo `src/common/pdf/`
**Depende de:** ADR-012 (decisão de lib de PDF já tomada — Puppeteer); TASK-006 (Ata) para a exportação de ata em PDF, não bloqueante para o resto
**Prioridade:** P0 — gap de conformidade legal (LAI, Lei 12.527/2011), não só de feature-parity
**Decisão relacionada:** ADR-012

---

## Background

`relatorio_sessao.md` confirma um padrão deliberado no IntGest: **Resumo**, **Relatórios** e
**Lista de Presença** são acessíveis sem login (testado em várias sessões — 50, 191, 192 — mesmo
comportamento; sessões inexistentes retornam 404). Câmaras municipais brasileiras têm obrigação
legal de publicidade ativa de atos legislativos (Lei de Acesso à Informação). Hoje, no
GestaoVereadores, **zero rotas de sessão são públicas** — confirmado via grep de `@Public()`: só
existem em `agenda-legislativa/public` e `normas/public`. Todo dado de sessão (inclusive resumo,
presença e relatórios) exige JWT.

Adicionalmente, `relatorios.controller.ts` retorna hoje **JSON cru** para os 3 relatórios que
existem (`atividade-legislativa/completo`, `atividade-legislativa/geral`, `presenca`) — o
frontend (`RelatoriosPage.tsx`) literalmente faz `<pre>{JSON.stringify(result, null, 2)}</pre>`.
Não existe geração de PDF em lugar nenhum do projeto.

## Parte 1 — Geração de PDF (fundação, feita uma vez, reusada por tudo)

Ver ADR-012: Puppeteer, não pdfkit/pdf-lib.

```
src/common/pdf/
├── pdf-generator.service.ts     ← único ponto de geração — recebe HTML, devolve Buffer
├── templates/
│   ├── ata-sessao.template.ts       ← usado por Ata (TASK-006)
│   ├── lista-presenca.template.ts
│   └── resumo-sessao.template.ts
└── pdf.module.ts
```

```ts
// pdf-generator.service.ts — contrato mínimo
@Injectable()
export class PdfGeneratorService {
  async gerarDeHtml(html: string, opcoes?: { formato?: 'A4'; paisagem?: boolean }): Promise<Buffer> {
    // puppeteer.launch() → page.setContent(html) → page.pdf() → close()
  }
}
```

Instalar: `npm install puppeteer` no `backend/package.json`.

**Nota de infra:** Puppeteer baixa um Chromium embutido na instalação — confirmar que o
`Dockerfile` do backend tem as dependências de sistema necessárias (fontconfig, libX11 etc. —
comum em imagens `node:slim`; ajustar para `node` completo ou instalar libs se necessário) antes
de ir para produção.

## Parte 2 — Rotas públicas de sessão

Reaproveitar exatamente o padrão já usado em `agenda.controller.ts:53`
(`import { Public } from '.../auth/decorators/public.decorator'`, decorator `@Public()` acima do
`@Get`).

| Método | Rota | Guard | Retorna |
|---|---|---|---|
| GET | `/legislative/sessoes-plenarias/:id/resumo-publico` | `@Public()` | JSON: mesa diretora, presença (nome+partido+situação), matérias da pauta com resultado |
| GET | `/legislative/sessoes-plenarias/:id/lista-presenca/pdf` | `@Public()` | PDF via `PdfGeneratorService` + `lista-presenca.template.ts` |
| GET | `/legislative/sessoes-plenarias/:id/ata/pdf` | `@Public()` | PDF — só se `Ata.status IN (APROVADA, PUBLICADA)`, senão 404 (não vazar rascunho) |

### Regra de visibilidade
Só sessões com `statusSessao === ENCERRADA` aparecem no resumo público — sessão em andamento ou
agendada retorna 404 nessas rotas (dado ainda não é definitivo/público). Isso é diferente do
IntGest (que expõe a sessão em qualquer estado), mas é a opção mais segura por padrão — se o time
decidir expor sessões em andamento, é mudança de uma condição, documentar quando decidido.

### O que NUNCA vai no resumo público
- CPF de parlamentar ou qualquer dado do `TenantUser`/`Parliamentarian` além de nome e partido
- `justificativa` de falta (pode conter dado de saúde/pessoal sensível — LGPD) — só a `situacao`
  (`PRESENTE`/`AUSENTE`/`JUSTIFICADO`), nunca o texto da justificativa
- Qualquer dado de outro tenant — o filtro `{ id, tenantId }` continua obrigatório mesmo em rota
  pública; `tenantId` aqui vem resolvido a partir do subdomínio/contexto público, nunca de
  parâmetro confiável do cliente (mesma preocupação da regra 2 do CLAUDE.md, adaptada: em rota
  pública não há JWT, então o tenant precisa ser resolvido de forma seguindo o mesmo padrão já
  usado por `normas/public` e `agenda-legislativa/public` — auditar como esses dois resolvem
  tenant antes de implementar, para manter consistência)

## Parte 3 — Relatórios administrativos existentes ganham exportação em PDF

`relatorios.controller.ts` (autenticado, sem mudança de guard) ganha uma variante de export:

| Método | Rota nova | Baseado em |
|---|---|---|
| POST | `/relatorios/atividade-legislativa/completo/pdf` | mesmo `RelatorioAtividadeCompletoDto`, formata via template PDF em vez de retornar JSON |
| POST | `/relatorios/presenca/pdf` | mesmo `RelatorioPresencaDto` |

Não remover os endpoints JSON existentes (podem ser usados por integrações futuras/exports CSV) —
só adicionar a variante PDF ao lado.

## Rate limiting nas rotas públicas

Rotas `@Public()` são superfície de scraping. O IntGest mitiga isso com `robots.txt` bloqueando
scrapers conhecidos. Recomendação mínima: aplicar um throttler (`@nestjs/throttler`, se já não
estiver no projeto — confirmar) nas 3 rotas públicas novas, algo como 30 req/min por IP. Não é
bloqueante para o MVP da feature, mas não subir para produção sem isso.

## Gathering Results

- [ ] `GET /:id/resumo-publico` funciona sem token, sessão `ENCERRADA`
- [ ] `GET /:id/resumo-publico` de sessão `AGENDADA`/`ABERTA` → 404
- [ ] `GET /:id/resumo-publico` nunca inclui `justificativa` de falta nem CPF
- [ ] `GET /:id/lista-presenca/pdf` retorna `Content-Type: application/pdf` válido
- [ ] `GET /:id/ata/pdf` de Ata `RASCUNHO` → 404 (não vaza rascunho)
- [ ] Rotas públicas isolam tenant corretamente (sessão de outro tenant → 404, nunca vazamento)
- [ ] Rate limit configurado nas 3 rotas públicas antes de deploy em produção
