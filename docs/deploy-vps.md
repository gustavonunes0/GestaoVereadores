# Deploy VPS Hostinger — CâmaraGest / Baturité

Banco: Postgres (Compose ou gerenciado).  
VPS: Docker (web + api) + **Nginx Proxy Manager** (já em uso na Hostinger).

Referência do que já ocupa a VPS (`187.127.42.128`):

| Host NPM | Destino | Porta host |
|----------|---------|------------|
| `baturite.stellarsolucoes.com.br` | frontend gestao | **8080** |
| `apibaturite.stellarsolucoes.com.br` | api gestao | **3000** |
| `sindprf` / `sindigest` / `apisindigest` | SistemaSindicatos | **8081** / **3001** |
| Jitsi / meet | … | 443, 8000, 8444, 10000 |

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

---

## 2. `.env` na VPS (API / Compose)

```env
# Portas já usadas pela gestão (não colidir com sindicatos 8081/3001)
# WEB → 8080 · API → 3000

CORS_ORIGIN=https://camaragest.stellarsolucoes.com.br,https://baturite.stellarsolucoes.com.br

# Hosts do front (sem https://) — separados!
TENANT_SEED_HOSTS=baturite.stellarsolucoes.com.br
PLATFORM_SEED_HOSTS=camaragest.stellarsolucoes.com.br

JWT_SECRET=<openssl rand -hex 32>
```

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
cd /opt/GestaoVereadores   # ou caminho do repo
git pull
# confira .env (PLATFORM_SEED_HOSTS, TENANT_SEED_HOSTS, CORS_ORIGIN)

docker compose up --build -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
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
4. Network: `GET …/api/tenants/current` com `X-Tenant-Host: camaragest.stellarsolucoes.com.br` → `"kind":"platform"`
5. `GET …/api/tenants/current` com `X-Tenant-Host: baturite.stellarsolucoes.com.br` → `"kind":"tenant"`
6. Login plataforma: `superadmin@sigl.app` / senha seed (só em `camaragest…`)
7. Login câmara: usuário staff/parlamentar em `baturite…`

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
