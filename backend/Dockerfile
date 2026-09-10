FROM node:20-alpine

WORKDIR /app

# Chromium do sistema — Puppeteer no Alpine (npm ci --ignore-scripts não baixa o Chrome).
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json package-lock.json ./
# postinstall roda scripts/ (Vercel); no image build o schema ainda não foi copiado
RUN npm ci --ignore-scripts

COPY prisma ./prisma/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

# generate + nest build direto — sem depender de backend/scripts (ops/local only)
RUN npx prisma generate
RUN npx nest build

ENV NODE_ENV=production
RUN mkdir -p /app/uploads
EXPOSE 3000

# migrate + seed em runtime (tem DATABASE_URL e postgres sobe primeiro)
CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || true) && (node prisma/ensure-platform-admin.cjs || true) && node dist/main.js"]
