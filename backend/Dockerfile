FROM node:20-alpine

WORKDIR /app

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
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
