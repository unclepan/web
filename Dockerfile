# syntax=docker/dockerfile:1.7

# ── 全局构建参数 ──────────────────────────────────────────────
ARG NODE_VERSION=24-alpine
ARG PNPM_VERSION=11.7.0

# ════════════════════════════════════════════════════════════
# 第一阶段：deps（安装依赖）
# ════════════════════════════════════════════════════════════
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ════════════════════════════════════════════════════════════
# 第二阶段：builder（构建项目）
# ════════════════════════════════════════════════════════════
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

ARG PNPM_VERSION
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ── 阿里云验证码（NEXT_PUBLIC_* 在 next build 时内联进客户端 bundle，
#     必须由 build-arg 传入真实值；不传则为空串，本地 docker build 也不报错）──
ARG NEXT_PUBLIC_ALI_CAPTCHA_PREFIX
ARG NEXT_PUBLIC_ALI_CAPTCHA_SCENE_ID
ARG NEXT_PUBLIC_ALI_CAPTCHA_REGION
ENV NEXT_PUBLIC_ALI_CAPTCHA_PREFIX=$NEXT_PUBLIC_ALI_CAPTCHA_PREFIX
ENV NEXT_PUBLIC_ALI_CAPTCHA_SCENE_ID=$NEXT_PUBLIC_ALI_CAPTCHA_SCENE_ID
ENV NEXT_PUBLIC_ALI_CAPTCHA_REGION=$NEXT_PUBLIC_ALI_CAPTCHA_REGION

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ════════════════════════════════════════════════════════════
# 第三阶段：runner（运行时镜像）
# ════════════════════════════════════════════════════════════
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>{if(r.status>=500)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
