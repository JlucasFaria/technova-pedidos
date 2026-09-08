# ---------------------------------------------------------------------------
# Imagem da API de pedidos da TechNova.
# Build em multiplos estagios para manter a imagem final pequena e sem
# dependencias de desenvolvimento.
# ---------------------------------------------------------------------------

# Estagio 1 - instalacao das dependencias de producao
FROM node:26-alpine AS dependencias

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Estagio 2 - imagem final de execucao
FROM node:26-alpine AS producao

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Executa a aplicacao com o usuario sem privilegios que ja existe na imagem base
COPY --from=dependencias /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY public ./public

USER node

EXPOSE 3000

# Verificacao de saude do container consumindo o proprio endpoint da API
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
