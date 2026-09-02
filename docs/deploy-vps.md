# Deploy VPS Hostinger — CâmaraGest / Baturité

Banco: Postgres (Compose ou gerenciado).  
VPS: Docker (web + api) + **Nginx Proxy Manager** (já em uso na Hostinger).

Referência do que já ocupa a VPS (`187.127.42.128`):

| Host NPM | Destino | Porta host |
|----------|---------|------------|
| `baturite.stellarsolucoes.com.br` | frontend gestao | **8080** |
| `apibaturite.stellarsolucoes.com.br` | api gestao | **3000** |
| `sindprf` / `sindigest` / `apisindigest` | SistemaSindicatos | **8081** / **3001** |
| `meet.stashsoftware.com.br` | jitsi-web (self-host) | **80** interno / NPM **443** |
| Jitsi mídia (JVB) | UDP direto na VPS | **10000/udp** (não passa no NPM) |

---

## Hosts deste produto

| Host | Papel | Tenant | Aponta para |
|------|--------|--------|-------------|
| `baturite.stellarsolucoes.com.br` | Câmara de Baturité (staff / parlamentar) | tenant da câmara | web `:8080` |
| `camaragest.stellarsolucoes.com.br` | Painel Stellar (SUPERADMIN) | plataforma | web `:8080` |
| `apibaturite.stellarsolucoes.com.br` | API compartilhada | — | api `:3000` |

O **mesmo** container web serve os dois hosts do front. O tenant é resolvido pelo hostname (`X-Tenant-Host` / Origin / Host).

> **Não** cadastre `camaragest…` em `tenant_domains` do tenant da câmara. Use `PLATFORM_SEED_HOSTS`.

Espelho do SindiGest:

| SindiGest | CâmaraGest |
|-----------|------------|
| `sindigest.stellarsolucoes.com.br` | `camaragest.stellarsolucoes.com.br` |
| `sindprf.stellarsolucoes.com.br` | `baturite.stellarsolucoes.com.br` |
| `apisindigest.stellarsolucoes.com.br` | `apibaturite.stellarsolucoes.com.br` |

---

## 1. DNS

No DNS de `stellarsolucoes.com.br` (A ou CNAME → IP da VPS `187.127.42.128`):

- `baturite` (já deve existir)
- `apibaturite` (já deve existir)
- `camaragest` (**criar**)

No DNS de `stashsoftware.com.br` (**Registro.br**, nameservers `*.sec.dns.br` — não Hostinger):

- `A` `meet` → `187.127.42.128` (Jitsi self-host)

---

## 2. `.env` na VPS (API / Compose)

Caminho real: `/opt/gestao-vereadores/GestaoVereadores`.

```env
# Portas já usadas pela gestão (não colidir com sindicatos 8081/3001)
# WEB → 8080 · API → 3000

CORS_ORIGIN=https://camaragest.stellarsolucoes.com.br,https://baturite.stellarsolucoes.com.br

# Hosts do front (sem https://) — separados!
TENANT_SEED_HOSTS=baturite.stellarsolucoes.com.br
PLATFORM_SEED_HOSTS=camaragest.stellarsolucoes.com.br

# Jitsi self-host (NÃO use meet.jit.si em produção)
JITSI_DOMAIN=meet.stashsoftware.com.br
JITSI_PUBLIC_HOST=meet.stashsoftware.com.br
JITSI_PUBLIC_URL=https://meet.stashsoftware.com.br
DOCKER_HOST_ADDRESS=187.127.42.128
JWT_APP_ID=gestao_vereadores
JWT_APP_SECRET=<mesmo-segredo-do-prosody>

JWT_SECRET=<openssl rand -hex 32>
```

Modelo completo: `deploy/jitsi-vps.env.example`.

**Importante:** a VPS usa `docker-compose.override.yml` (não versionado) para forçar `JITSI_DOMAIN` / `PUBLIC_URL`.  
**Não** recoloque `meet.jit.si` nem `JITSI_APP_ID: ""` nesse override — isso reativa o limite de ~5 min.

No build do frontend (se a API for host separado):

```env
VITE_API_URL=https://apibaturite.stellarsolucoes.com.br/api
VITE_SOCKET_URL=https://apibaturite.stellarsolucoes.com.br
VITE_PLATFORM_HOSTS=camaragest.stellarsolucoes.com.br
```

Com proxy nginx do front apontando `/api` para a API, `VITE_API_URL=/api` continua válido.

---

## 3. Subir / atualizar na VPS

```bash
cd /opt/gestao-vereadores/GestaoVereadores
# Backup do override (Jitsi) antes do pull
cp docker-compose.override.yml docker-compose.override.yml.bak-$(date +%Y%m%d) 2>/dev/null || true
git pull
# Confira .env + override: JITSI_DOMAIN=meet.stashsoftware.com.br (sem meet.jit.si)

docker compose up --build -d
docker compose exec api npx prisma migrate deploy
# seed só se necessário (idempotente, mas evita rodar em toda atualização)
# docker compose exec api npx prisma db seed

# NPM precisa estar na rede do Jitsi (senão Meet → 502)
docker network connect gestaovereadores_meet.jitsi nginx-proxy-manager-nginx-proxy-manager-1 2>/dev/null || true
```

Validar mapeamento no banco:

```sql
SELECT d.host, t.name, t.id
FROM tenant_domains d
JOIN "Tenant" t ON t.id = d."tenantId"
WHERE d.host LIKE '%baturite%' OR d.host LIKE '%camara%'
ORDER BY d.host;
```

Esperado:

| host | papel |
|------|--------|
| `baturite.stellarsolucoes.com.br` | tenant da câmara |
| *(nenhuma linha)* `camaragest…` | plataforma via `PLATFORM_SEED_HOSTS` |

Se o host da câmara estiver errado:

```sql
INSERT INTO tenant_domains (id, "tenantId", host, primario, "createdAt")
VALUES (
  gen_random_uuid()::text,
  '<UUID_DO_TENANT_BATURITE>',
  'baturite.stellarsolucoes.com.br',
  true,
  NOW()
)
ON CONFLICT (host) DO UPDATE
SET "tenantId" = EXCLUDED."tenantId", primario = true;
```

Reinicie a API após mudar hosts: `docker compose restart api`.

---

## 4. Nginx Proxy Manager — Proxy Hosts

Mesmo padrão já usado no Baturité (`http://187.127.42.128:PORTA`).

### A) Front câmara (já existe)

| Campo | Valor |
|-------|--------|
| Domain Names | `baturite.stellarsolucoes.com.br` |
| Scheme | `http` |
| Forward Hostname / IP | `187.127.42.128` |
| Forward Port | `8080` |
| SSL | Let’s Encrypt + Force SSL |

### B) Front CâmaraGest (plataforma) — **criar**

| Campo | Valor |
|-------|--------|
| Domain Names | `camaragest.stellarsolucoes.com.br` |
| Scheme | `http` |
| Forward Hostname / IP | `187.127.42.128` |
| Forward Port | `8080` |
| SSL | Let’s Encrypt + Force SSL |

### C) API (já existe)

| Campo | Valor |
|-------|--------|
| Domain Names | `apibaturite.stellarsolucoes.com.br` |
| Scheme | `http` |
| Forward Hostname / IP | `187.127.42.128` |
| Forward Port | `3000` |
| SSL | Let’s Encrypt + Force SSL |

### D) Jitsi Meet (self-host) — **já em produção**

| Campo | Valor |
|-------|--------|
| Domain Names | `meet.stashsoftware.com.br` |
| Scheme | `http` |
| Forward Hostname / IP | IP do `jitsi-web` na rede Docker (ex. `172.19.0.2`) **ou** `gestaovereadores-jitsi-web-1` |
| Forward Port | `80` |
| Websockets Support | **ligado** |
| SSL | Let’s Encrypt + Force SSL + HTTP/2 |

O container NPM deve estar na rede `gestaovereadores_meet.jitsi`.  
Se o IP do `jitsi-web` mudar após recreate, atualize o Forward Hostname no NPM (ou use o nome do container se a resolução DNS Docker funcionar).

**Advanced** (API), se o NPM não repassar headers:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Tenant-Host $http_x_tenant_host;
```

---

## 5. Validar

1. `https://apibaturite.stellarsolucoes.com.br/api/health` → ok
2. `https://baturite.stellarsolucoes.com.br/` → login da câmara
3. `https://camaragest.stellarsolucoes.com.br/` → login da **plataforma** (super admin)
4. `https://meet.stashsoftware.com.br/` → Jitsi Meet (cadeado válido, sem “Congratulations”)
5. `docker compose exec api printenv JITSI_DOMAIN` → `meet.stashsoftware.com.br` (≠ `meet.jit.si`)
6. Network: `GET …/api/tenants/current` com `X-Tenant-Host: camaragest.stellarsolucoes.com.br` → `"kind":"platform"`
7. `GET …/api/tenants/current` com `X-Tenant-Host: baturite.stellarsolucoes.com.br` → `"kind":"tenant"`
8. Login plataforma: `superadmin@sigl.app` / senha seed (só em `camaragest…`)
9. Login câmara: usuário staff/parlamentar em `baturite…`
10. Sessão com vídeo ≥15 min sem corte de free tier

---

## 6. Depois: domínio próprio do cliente

1. DNS do cliente → `187.127.42.128`
2. NPM: novo Proxy Host → `187.127.42.128:8080`
3. `INSERT` em `tenant_domains` **do tenant da câmara** (não use `PLATFORM_SEED_HOSTS`)
4. API continua em `apibaturite...` (o front manda `X-Tenant-Host`)
5. Inclua o novo origin em `CORS_ORIGIN`

---

## Comandos úteis

```bash
docker compose logs -f api
docker compose up -d api
docker compose up --build -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
docker compose down
```
