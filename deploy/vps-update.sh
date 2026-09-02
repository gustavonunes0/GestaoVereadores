#!/usr/bin/env bash
# Atualização segura na VPS — preserva Jitsi (override + .env) e valida pós-deploy.
# Uso: cd /opt/gestao-vereadores/GestaoVereadores && bash deploy/vps-update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EXPECTED_PUBLIC_URL="${JITSI_PUBLIC_URL_EXPECTED:-https://meet.stashsoftware.com.br}"
EXPECTED_DOMAIN="${JITSI_DOMAIN_EXPECTED:-meet.stashsoftware.com.br}"
OVERRIDE="docker-compose.override.yml"
STAMP="$(date +%Y%m%d-%H%M%S)"
BAK="${OVERRIDE}.bak-pre-update-${STAMP}"

echo "==> [1/6] Backup do override (não versionado)"
if [[ -f "$OVERRIDE" ]]; then
  cp -a "$OVERRIDE" "$BAK"
  echo "    salvo: $BAK"
else
  echo "    AVISO: $OVERRIDE ausente — será recriado do exemplo se necessário"
fi

echo "==> [2/6] Garantir JITSI_* no .env (independente do override)"
touch .env
ensure_env() {
  local key="$1" val="$2"
  if grep -q "^${key}=" .env 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
}
ensure_env JITSI_PUBLIC_URL "$EXPECTED_PUBLIC_URL"
ensure_env JITSI_PUBLIC_HOST "$EXPECTED_DOMAIN"
ensure_env JITSI_DOMAIN "$EXPECTED_DOMAIN"

echo "==> [3/6] git pull"
git pull --ff-only

echo "==> [4/6] Restaurar / completar override com Jitsi + Postgres"
# Nunca deixe só postgres: sem PUBLIC_URL o Meet volta com :8444 e quebra atrás do NPM.
if [[ ! -f "$OVERRIDE" ]] || ! grep -q 'PUBLIC_URL:' "$OVERRIDE"; then
  echo "    override incompleto ou ausente — reescrevendo template seguro"
  if [[ -f "$BAK" ]] && grep -q 'PUBLIC_URL:' "$BAK"; then
    cp -a "$BAK" "$OVERRIDE"
    echo "    restaurado do backup $BAK"
  else
    cat > "$OVERRIDE" <<EOF
services:
  postgres:
    ports:
      - "0.0.0.0:5433:5432"

  api:
    environment:
      JITSI_DOMAIN: ${EXPECTED_DOMAIN}
      JITSI_APP_ID: gestao_vereadores
      JITSI_APP_SECRET: troque-por-um-segredo-forte
      JITSI_SUB: "*"
      CORS_ORIGIN: https://camaragest.stellarsolucoes.com.br,https://baturite.stellarsolucoes.com.br,http://localhost:5173

  jitsi-web:
    environment:
      PUBLIC_URL: ${EXPECTED_PUBLIC_URL}
EOF
    echo "    escrito template com PUBLIC_URL + postgres 5433"
  fi
fi

# Bloqueia override só-postgres (causa do incidente)
if ! grep -q 'PUBLIC_URL:' "$OVERRIDE"; then
  echo "ERRO: $OVERRIDE sem PUBLIC_URL — abortando para não quebrar o Meet"
  exit 1
fi
if grep -qE 'PUBLIC_URL:.*:8444' "$OVERRIDE"; then
  echo "ERRO: PUBLIC_URL com :8444 no override — use ${EXPECTED_PUBLIC_URL}"
  exit 1
fi

echo "==> [5/6] Build e up"
docker compose up --build -d
docker compose exec -T api npx prisma migrate deploy || true
docker network connect gestaovereadores_meet.jitsi nginx-proxy-manager-nginx-proxy-manager-1 2>/dev/null || true

echo "==> [6/6] Validar Jitsi"
sleep 3
PUBLIC_URL="$(docker exec gestaovereadores-jitsi-web-1 printenv PUBLIC_URL 2>/dev/null || true)"
JITSI_DOMAIN="$(docker exec gestaovereadores-api-1 printenv JITSI_DOMAIN 2>/dev/null || true)"

echo "    PUBLIC_URL=$PUBLIC_URL"
echo "    JITSI_DOMAIN=$JITSI_DOMAIN"

ok=1
[[ "$PUBLIC_URL" == "$EXPECTED_PUBLIC_URL" ]] || ok=0
[[ "$JITSI_DOMAIN" == "$EXPECTED_DOMAIN" ]] || ok=0
if [[ "$PUBLIC_URL" == *":8444"* ]]; then ok=0; fi

if [[ "$ok" -ne 1 ]]; then
  echo
  echo "FALHOU validação Jitsi. Restaurando override do backup e recreating..."
  if [[ -f "$BAK" ]]; then
    cp -a "$BAK" "$OVERRIDE"
  fi
  docker compose up -d api jitsi-web
  echo "Revise: cat $OVERRIDE && grep JITSI_ .env"
  exit 1
fi

echo
echo "OK — update concluído sem quebrar o Meet."
echo "Teste: $EXPECTED_PUBLIC_URL"
