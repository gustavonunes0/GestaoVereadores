FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY index.html main.js ./

EXPOSE 5173

CMD ["npm", "run", "dev"]
