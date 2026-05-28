FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# postinstall roda prisma generate; schema ainda não foi copiado
RUN npm ci --ignore-scripts

COPY prisma ./prisma/
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
