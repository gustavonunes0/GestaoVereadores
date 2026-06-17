FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# postinstall roda prisma generate; schema ainda não foi copiado
RUN npm ci --ignore-scripts

COPY prisma ./prisma/
COPY scripts ./scripts/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV SIGL_USE_LOCAL_DB=true
EXPOSE 3000

CMD ["sh", "-c", "node scripts/resolve-vercel-env.cjs && npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
