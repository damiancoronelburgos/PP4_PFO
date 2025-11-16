FROM node:20-bookworm-slim

WORKDIR /app/server

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY scripts ./scripts
COPY .env.example ./.env.example

RUN mkdir -p uploads/avatars

EXPOSE 3000
CMD ["node", "src/server.js"]