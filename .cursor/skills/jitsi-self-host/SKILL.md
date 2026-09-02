---
name: jitsi-self-host
description: >-
  Configure and harden self-hosted Jitsi Meet (Docker) for CâmaraGest plenary
  video: JWT auth, PUBLIC_URL, JVB advertise IPs, UDP 10000, TLS/NPM proxy,
  and elimination of meet.jit.si 5-minute free limit. Use when the user mentions
  Jitsi, transmissão de sessão, meet.jit.si, 5 minutos, JWT Jitsi, JVB, or
  self-hosting video on the VPS.
---

# Jitsi Self-Host (CâmaraGest)

## When to use

- Chamadas cortam ~5 minutos
- “Força autenticação” / waiting for moderator
- Configurar/corrigir containers `jitsi-*` na VPS
- Alinhar `JITSI_DOMAIN` / JWT entre API e Prosody
- Proxy NPM + WebSockets (`/xmpp-websocket`, `/colibri-ws`)

## Read first

1. Spec: `backend/src/docs/specs/infra/SPEC-010-jitsi-self-host.md`
2. Task: `backend/src/docs/tasks/TASK-010-jitsi-self-host.md`
3. Env exemplo: `deploy/jitsi-vps.env.example`
4. Compose: serviços `jitsi-web`, `jitsi-prosody`, `jitsi-jicofo`, `jitsi-jvb`
5. Código: `get-jitsi-token.use-case.ts`

## Non-negotiables

1. **Produção Baturité nunca deve usar `meet.jit.si`** — limite gratuito ~5 min.
2. Self-host = duração ilimitada (só hardware/rede).
3. `JITSI_APP_ID`/`SECRET` da API **iguais** a `JWT_APP_ID`/`SECRET` do Prosody.
4. Mídia WebRTC usa **UDP 10000** (não passa pelo proxy HTTP); abrir firewall.
5. `DOCKER_HOST_ADDRESS` / `JVB_ADVERTISE_IPS` = **IP público** da VPS.
6. Não “consertar” 5 min só no frontend — corrigir `domain` + stack.

## Diagnostic algorithm

```text
GET jitsi-token.domain
  ├─ meet.jit.si     → set JITSI_DOMAIN to self-host; recreate api (TASK T-02)
  ├─ IP:8444 / meet.* → check JWT, UDP 10000, advertise IP, TLS (T-04..T-06)
  └─ token null on self-host → missing APP_ID/SECRET or code path treating as public
```

## Preferred production topology

Nginx Proxy Manager (TLS) → `jitsi-web:8000` HTTP  
JVB UDP 10000 publicado no host  
API emite JWT; IFrame usa `domain` sem `https://`

## Out of scope unless asked

Jibri, Jigasi, Etherpad, multi-region OCTO, Debian apt install (prefer Docker já no repo).

## Response style

- Prefer checklist actionable (comandos VPS) over theory.
- Cite SPEC-010 / TASK-010 item IDs (T-00…).
- If changing compose/env, list exact keys and recreate targets.
