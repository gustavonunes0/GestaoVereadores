# SPEC-010 — Jitsi Meet Self-Hosted (VPS Docker)

**Status:** Rascunho / Pronta para execução | **Versão:** 1.0  
**Área:** Infra + Sessões Plenárias (transmissão)  
**Spec path:** `backend/src/docs/specs/infra/SPEC-010-jitsi-self-host.md`  
**Task:** `backend/src/docs/tasks/TASK-010-jitsi-self-host.md`  
**Skill:** `.cursor/skills/jitsi-self-host/SKILL.md`  
**Fonte:** `novo 7.txt` (handbook Jitsi: Debian, Docker, auth JWT, reverse proxy) + stack atual `docker-compose.yml`

---

## Background

A CâmaraGest usa Jitsi para transmissão de sessão plenária (`GetJitsiTokenUseCase` + embed no frontend).

**Sintoma atual na VPS:** chamada força autenticação e/ou **corta ~5 minutos**.

**Causa típica (não é bug do Nest):** o navegador está usando o **Jitsi público** `meet.jit.si` (limite gratuito ~5 min) **ou** o self-host Docker na VPS não está saudável (JWT/PUBLIC_URL/UDP/cert), e o fluxo cai no público / falha de mídia.

**Objetivo:** self-host Docker na VPS (`jitsi-web` + `prosody` + `jicofo` + `jvb`) com salas criadas pela API via **JWT**, duração **indeterminada** (limitada só por hardware/rede), sem depender de `meet.jit.si`.

---

## Diagnóstico (mapa causa → efeito)

| Sintoma | Causa provável | Evidência |
|--------|----------------|-----------|
| ~5 minutos e desconecta | Domínio = `meet.jit.si` | `JITSI_DOMAIN` na API / Network tab no browser |
| Pede login / “waiting for moderator” | `ENABLE_AUTH=1` sem JWT válido no client | Token `null` ou `iss`/`secret` diferente do Prosody |
| Áudio/vídeo some com 3+ pessoas | `JVB_ADVERTISE_IPS` / `DOCKER_HOST_ADDRESS` errado; UDP 10000 fechado | Doc Docker: NAT/LAN |
| Cadeado / “certificado inválido” | Self-signed em `:8444` | Browser; apps mobile exigem CA válida |
| JWT rejeitado | `JWT_APP_ID`/`SECRET` API ≠ Prosody; `sub` errado | Logs Prosody; payload JWT |

---

## Escopo

### In scope
1. Stack Docker Jitsi na mesma VPS do compose (já parcialmente no repo).
2. Auth **JWT** alinhada à API (`JITSI_APP_ID` / `JITSI_APP_SECRET` = `JWT_APP_ID` / `JWT_APP_SECRET`).
3. Rede: `PUBLIC_URL`, IP público anunciado pelo JVB, portas 443/TCP (ou 8444) + **10000/UDP**.
4. TLS de produção: Let’s Encrypt **ou** certificado via **Nginx Proxy Manager** já existente (recomendado no doc: proxy + `DISABLE_HTTPS` no web interno).
5. Critérios de aceite: sessão > 15 min com ≥2 participantes sem corte por “free tier”.
6. Documentação operacional VPS + harness SDD (este spec + task + skill).

### Out of scope (fase 2)
- Jibri (gravação) / Jigasi (SIP) / Etherpad / whiteboard.
- Cluster multi-JVB / OCTO / regiões.
- Migrar para install Debian nativo (apt) — só se Docker for inviável.

---

## Requisitos funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF-01 | API retorna `domain` apontando **somente** para o host self-hosted (nunca `meet.jit.si` em produção Baturité) | P0 |
| RF-02 | API emite JWT válido (`aud`, `iss`, `sub`, `room`, `context.user`) quando domain é self-hosted | P0 |
| RF-03 | Prosody/web validam o mesmo `JWT_APP_ID` / `JWT_APP_SECRET` | P0 |
| RF-04 | Participantes autenticados (token) entram na sala; duração sem limite artificial de produto | P0 |
| RF-05 | Com ≥2 participantes, áudio/vídeo estáveis (JVB anuncia IP público correto) | P0 |
| RF-06 | Operador staff pode ser `moderator: true` no JWT | P1 |
| RF-07 | Domínio amigável `meet.<dominio>` com TLS válido (NPM ou Let’s Encrypt) | P1 |
| RF-08 | Healthcheck / checklist pós-deploy documentado | P1 |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| RNF-01 | VPS: preferir ≥4 GB RAM / 4 vCPU dedicados para Jitsi+API+Postgres (doc: 4 GB mínimo realista; 8 GB ideal) |
| RNF-02 | Firewall: 80/tcp, 443/tcp (ou 8444), **10000/udp**, SSH |
| RNF-03 | Não misturar `meet.jit.si` e self-host no mesmo ambiente de produção |
| RNF-04 | Senhas internas Jicofo/JVB geradas (não placeholders) — doc Docker `gen-passwords` |

---

## Arquitetura alvo

```text
Browser (CâmaraGest)
    │ HTTPS
    ▼
Nginx Proxy Manager (já na VPS)  ──TLS Let's Encrypt──►  meet.baturite... (ou IP)
    │ HTTP interno (opcional)
    ▼
jitsi-web (:8000)  ←── JWT no IFrame/External API
    │
    ├── jitsi-prosody (XMPP + JWT)
    ├── jitsi-jicofo
    └── jitsi-jvb (:10000/udp)  ←── mídia WebRTC (fora do proxy HTTP)

API Nest
    └── GET .../jitsi-token → { domain, roomName, token }
```

**Auth escolhida (já no compose):** `ENABLE_AUTH=1`, `AUTH_TYPE=jwt`, `ENABLE_GUESTS=1`  
→ primeiro a entrar com JWT válido “abre” a sala; convidados podem entrar depois (conforme guests).  
Para plenária, **todos** os usuários logados na CâmaraGest devem receber JWT da API (não depender de guest anônimo).

---

## Gaps vs compose atual

| Item doc / produção | Estado no repo | Ação |
|---------------------|----------------|------|
| `PUBLIC_URL` | Sim (`JITSI_PUBLIC_HOST`:`HTTPS_PORT`) | Confirmar valor real na VPS |
| `JVB_ADVERTISE_IPS` (ex-DOCKER_HOST_ADDRESS) | Só `DOCKER_HOST_ADDRESS` | Alinhar ao IP público VPS; preferir `JVB_ADVERTISE_IPS` se imagem suportar |
| JWT secrets sincronizados | Exemplo em `deploy/jitsi-vps.env.example` | Garantir `.env` VPS = API |
| TLS válido | Porta 8444 self-signed | Preferir proxy NPM + domínio |
| Portas UDP 10000 | Mapeadas no compose | Abrir no firewall cloud/VPS |
| `JITSI_DOMAIN` API | Interpolado no compose | **Não** deixar `meet.jit.si` em prod |
| Volumes CONFIG rootless (stable-11146+) | Volumes nomeados antigos `stable-9779` | Avaliar upgrade imagem + layout `storage/`/`tmp/` numa fase |

---

## Contrato API (já existente — validar)

`GetJitsiTokenUseCase` deve:

1. `domain !== 'meet.jit.si'` em produção tenant Baturité.
2. Assinar JWT com `secret = JITSI_APP_SECRET`, `iss = JITSI_APP_ID`, `sub` = `JITSI_SUB` (default `*` ou `meet.jitsi`).
3. `room` = nome estável da sessão (já: `sessao-{id curto}`).
4. `expiresIn` ≥ duração típica de sessão (hoje `2h` — ok; opcional renovar no front).

---

## Critérios de aceite

1. Com `JITSI_DOMAIN` = host self-hosted, Network do browser **não** chama `meet.jit.si`.
2. Chamada com 2 browsers ≥ **15 minutos** contínuos sem desconexão por limite de produto.
3. Terceiro participante entra e vê/ouve (prova JVB/NAT).
4. JWT inválido → acesso negado; JWT válido → entra.
5. Checklist VPS preenchido em `TASK-010` (portas, env, logs).

---

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Confundir auth interna XMPP com “login Google” | Documentar: auth é JWT da API, não conta Jitsi pública |
| Cert self-signed bloqueia mobile | Domínio + Let’s Encrypt via NPM |
| UDP bloqueado por provedor | Testar 10000/udp; fallback TURN só se necessário (fase 2) |
| Imagem antiga vs doc novo rootless | Pin de versão documentado; upgrade planejado |

---

## Referências

- Handbook: https://jitsi.github.io/handbook/docs/devops-guide/
- Docker quick start / JWT / reverse proxy: conteúdo consolidado em `novo 7.txt`
- Código: `get-jitsi-token.use-case.ts`, `docker-compose.yml` serviços `jitsi-*`
- Env: `deploy/jitsi-vps.env.example`
