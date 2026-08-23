# ── Stage 1: compile TypeScript ──────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx tsc -p tsconfig.json

# ── Stage 2: production image ─────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 9002
# Environment variables are supplied by docker-compose (not a .env file).
CMD ["node", "dist/server.js"]

