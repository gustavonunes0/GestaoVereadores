# TASK-010 — Execução: Jitsi Self-Hosted ilimitado na VPS

**Spec:** `backend/src/docs/specs/infra/SPEC-010-jitsi-self-host.md`  
**Skill:** `.cursor/skills/jitsi-self-host/SKILL.md`  
**Depende de:** Stack Docker já presente (`jitsi-web|prosody|jicofo|jvb`); NPM opcional na VPS  
**Objetivo:** Eliminar limite de ~5 min (`meet.jit.si`) e estabilizar salas JWT na VPS sem corte artificial.

---

## Fase 0 — Diagnóstico (obrigatório antes de mudar compose)

### T-00 · Confirmar o que o browser usa
- [ ] Abrir sessão em produção → DevTools → Network / console Jitsi
- [ ] Anotar `domain` retornado por `GET .../jitsi-token` (campo `domain`)
- [ ] Se `domain` contém `meet.jit.si` → **causa do 5 min confirmada** (ir para Fase 1A)
- [ ] Se `domain` é IP:8444 / meet.* → self-host; ir para Fase 1B (JWT/NAT/TLS)

### T-01 · Inventário VPS
- [ ] `docker compose ps` — status dos 4 serviços jitsi-*
- [ ] `.env` na raiz do compose: `JITSI_DOMAIN`, `JITSI_PUBLIC_HOST`, `DOCKER_HOST_ADDRESS`, `JWT_APP_*`
- [ ] Env do container **api**: `JITSI_DOMAIN` (não só o `.env` local do PC)
- [ ] Firewall: `80/tcp`, `443/tcp` e/ou `8444/tcp`, **`10000/udp`**, SSH
- [ ] Recursos: RAM/CPU livres (meta ≥4 GB para stack completa)

**Saída:** 1 parágrafo “Achado” + caminho Fase 1A ou 1B.

---

## Fase 1A — Forçar self-host na API (quando domínio ainda é público)

### T-02 · Env API produção
- [ ] No `.env` / compose da VPS:  
  `JITSI_DOMAIN=<host-publico-sem-https>`  
  Exemplos válidos: `meet.baturite.stellarsolucoes.com.br` **ou** `187.127.42.128:8444`  
  **Proibido em prod:** `meet.jit.si`, `localhost:8444`
- [ ] `JITSI_APP_ID` = `JWT_APP_ID`  
- [ ] `JITSI_APP_SECRET` = `JWT_APP_SECRET` (mesmo valor no Prosody)
- [ ] `JITSI_SUB=*` (ou `meet.jitsi` se a instalação exigir)
- [ ] `docker compose up -d --force-recreate api`
- [ ] Revalidar token endpoint → `domain` self-hosted + `token` string não-nula

### T-03 · Guardrail código (opcional mas recomendado)
- [ ] Em produção (`NODE_ENV=production`), log/warn se `JITSI_DOMAIN` for `meet.jit.si`
- [ ] (Opcional) flag `JITSI_ALLOW_PUBLIC=0` que falha startup se domain público

---

## Fase 1B — Endurecer stack Docker Jitsi (quando já aponta para VPS)

### T-04 · Secrets e auth JWT
- [ ] Trocar placeholders `troque-por-*` / `jicofopass` por senhas fortes
- [ ] Confirmar compose: `ENABLE_AUTH=1`, `AUTH_TYPE=jwt`, `ENABLE_GUESTS=1` (ou política plenária sem guests)
- [ ] Recreate: `jitsi-web jitsi-prosody jitsi-jicofo jitsi-jvb`
- [ ] Teste: JWT inválido não entra; JWT da API entra

### T-05 · Rede / NAT / mídia
- [ ] `DOCKER_HOST_ADDRESS` = IP público da VPS (`187.127.42.128` ou equivalente)
- [ ] Se imagem suportar: adicionar `JVB_ADVERTISE_IPS=<IP_PUBLICO>` (doc Docker atual)
- [ ] Abrir **UDP 10000** no firewall do provedor e na VPS
- [ ] Teste 3 participantes: A+B+C com vídeo (prova bridge)

### T-06 · TLS e URL pública
**Opção preferida (NPM já na VPS):**
- [ ] Criar host `meet.<dominio>` no Nginx Proxy Manager → `http://127.0.0.1:8000` (HTTP_PORT do jitsi-web)
- [ ] Let’s Encrypt no NPM
- [ ] WebSocket: garantir proxy de `/xmpp-websocket` e `/colibri-ws` (upgrade headers) — ver SPEC-010
- [ ] Compose: considerar `DISABLE_HTTPS=1` no jitsi-web se TLS fica só no NPM; `PUBLIC_URL=https://meet.<dominio>`
- [ ] API: `JITSI_DOMAIN=meet.<dominio>` (**sem** porta se 443)

**Opção alternativa:** `ENABLE_LETSENCRYPT` no próprio jitsi-web (HTTP 80/443 exclusivos — pode conflitar com NPM).

### T-07 · Cert self-signed (só se ainda usar :8444)
- [ ] Documentar aceite one-time no browser
- [ ] Não esperar apps mobile oficiais funcionarem sem CA pública

---

## Fase 2 — Aceite e observação

### T-08 · Teste de duração
- [ ] 2 usuários ≥ 15 min (meta: 60 min em sessão real)
- [ ] Sem mensagem de limite free / redirect para meet.jit.si
- [ ] Re-join após refresh com novo token OK

### T-09 · Observabilidade mínima
- [ ] `docker compose logs -f jitsi-prosody jitsi-jvb jitsi-jicofo` durante teste
- [ ] Anotar erros JWT / ICE failed / UDP
- [ ] (Opcional fase 3) log-analyser Grafana do handbook

### T-10 · Documentação
- [ ] Atualizar `deploy/jitsi-vps.env.example` com domínio final + `JVB_ADVERTISE_IPS`
- [ ] Checklist “go-live” no final deste arquivo (preencher data/responsável)

---

## Fase 3 — Melhorias (não bloqueiam aceite P0)

- [ ] Upgrade imagens `stable-9779` → release recente + layout CONFIG rootless (`storage/`, `tmp/`)
- [ ] TURN se redes corporativas bloquearem UDP
- [ ] Jibri gravação (1 Jibri = 1 reunião; RAM alta — só se produto exigir)
- [ ] Renovação de JWT no frontend perto do `expiresIn`

---

## Ordem de execução sugerida (1 sessão de trabalho)

```text
T-00 → T-01 → (se meet.jit.si) T-02 → T-04 → T-05 → T-06 → T-08 → T-10
                 (se já self-host) T-04 → T-05 → T-06 → T-08 → T-10
```

---

## Comandos úteis (VPS)

```bash
cd /opt/gestao-vereadores/GestaoVereadores   # ou path real

# Status
docker compose ps
docker compose logs --tail=100 jitsi-prosody jitsi-jvb

# Recreate após .env
docker compose up -d --force-recreate api jitsi-web jitsi-prosody jitsi-jicofo jitsi-jvb

# Porta UDP (exemplo ufw)
sudo ufw allow 10000/udp
sudo ufw status verbose
```

---

## Checklist go-live

| Item | OK? | Data |
|------|-----|------|
| `JITSI_DOMAIN` ≠ meet.jit.si | | |
| Token JWT não-nulo | | |
| UDP 10000 aberto | | |
| IP anunciado = público | | |
| TLS válido (ou aceite documentado) | | |
| Teste ≥15 min / 2+ users | | |

**Responsável:** _____________  
**Ambiente:** VPS Baturité / CâmaraGest
