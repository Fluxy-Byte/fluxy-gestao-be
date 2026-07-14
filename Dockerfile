# --- deps ---
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- runtime ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=6501

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generates the Prisma client into backend/generated/prisma (gitignored).
# No DATABASE_URL needed here — the pg driver adapter supplies the
# connection string at runtime, not at generate time.
RUN npx prisma generate

EXPOSE 6501
CMD ["npx", "tsx", "index.ts"]
