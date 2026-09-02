# Harness SDD — Jitsi Self-Host

Índice Spec-Driven Development para transmissão de vídeo **ilimitada** via Jitsi Docker na VPS (CâmaraGest).

## Por que este harness

| Problema observado | Interpretação |
|--------------------|---------------|
| Auth forçada + ~5 minutos | Quase sempre `meet.jit.si` (free) **ou** self-host com JWT/NAT/TLS quebrado |
| Meta | Self-host na VPS: salas via JWT da API, duração indeterminada |

Documento de referência do produto/ops: `novo 7.txt` (handbook Jitsi Debian + Docker + JWT + reverse proxy).

## Artefatos

| Tipo | Caminho | Função |
|------|---------|--------|
| **Spec** | [`SPEC-010`](../../../backend/src/docs/specs/infra/SPEC-010-jitsi-self-host.md) | Requisitos, gaps, aceite, arquitetura |
| **Task / plano** | [`TASK-010`](../../../backend/src/docs/tasks/TASK-010-jitsi-self-host.md) | Checklist executável T-00…T-10 |
| **Skill (agente)** | [`jitsi-self-host` skill](../../../.cursor/skills/jitsi-self-host/SKILL.md) | Como o agente deve diagnosticar/corrigir |
| **Rule** | [`jitsi-self-host.mdc`](../../../.cursor/rules/jitsi-self-host.mdc) | Guardrails ao editar compose/token |
| **Env exemplo** | [`jitsi-vps.env.example`](../../../deploy/jitsi-vps.env.example) | Variáveis VPS |
| **Compose** | [`docker-compose.yml`](../../../docker-compose.yml) | Serviços `jitsi-*` |

## Fluxo SDD

```text
1. Spec (o quê / por quê / aceite)
        ↓
2. Task  (como / ordem / comandos)
        ↓
3. Skill+Rule (agente não inventa atalho para meet.jit.si)
        ↓
4. Execução na VPS + evidências no checklist go-live
```

## Ordem mínima de execução (humano ou agente)

1. **T-00** — Ver `domain` do endpoint de token (é `meet.jit.si`?).
2. Se sim → **T-02** (env API) antes de qualquer “otimização” de UI.
3. **T-04/T-05/T-06** — JWT + UDP/IP + TLS/NPM.
4. **T-08** — Prova ≥15 min com 2 usuários.

## Definição de pronto (DoD)

- [x] Spec STATUS → Aprovada após T-08 OK (prod `meet.stashsoftware.com.br`, ago/2026)
- [x] Checklist go-live da TASK-010 (JWT sync, NPM TLS, sem meet.jit.si)
- [x] `JITSI_DOMAIN` de produção = `meet.stashsoftware.com.br`
- [x] Sem corte por limite free em teste controlado

## Produção atual (referência)

| Item | Valor |
|------|--------|
| Meet | `https://meet.stashsoftware.com.br` |
| NPM upstream | IP do `jitsi-web` na rede `gestaovereadores_meet.jitsi` (ex. `172.19.0.2:80`) |
| Override VPS | `docker-compose.override.yml` (não versionado; modelo em `deploy/docker-compose.override.jitsi.example.yml`) |
| Env modelo | `deploy/jitsi-vps.env.example` |

**Proibido reativar:** override com `JITSI_DOMAIN: meet.jit.si` + `JITSI_APP_ID: ""`.

## Fora deste harness (por enquanto)

Gravação Jibri, SIP Jigasi, cluster multi-bridge, install apt Debian nativo.
