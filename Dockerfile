# =====================================================================
# ControlBox Dockerfile
# Multi-stage build for production deployment
# =====================================================================

# ==== Base ====
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ==== Dependencies ====
FROM base AS deps
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY packages/dashboard/package*.json ./packages/dashboard/
COPY packages/server/package*.json ./packages/server/
RUN npm ci

# ==== Builder ====
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=deps /app/packages/dashboard/node_modules ./packages/dashboard/node_modules
COPY --from=deps /app/packages/server/node_modules ./packages/server/node_modules
COPY . .

# Build all packages
RUN npm run build

# ==== Dashboard Production ====
FROM nginx:alpine AS dashboard
COPY --from=builder /app/packages/dashboard/dist /usr/share/nginx/html
COPY packages/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ==== Server Production ====
FROM base AS server
WORKDIR /app

# Copy built files
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=deps /app/packages/server/node_modules ./node_modules

# Copy package files
COPY packages/server/package*.json ./

# Prisma
COPY packages/server/prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
