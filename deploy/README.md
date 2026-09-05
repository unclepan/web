# uicu.club 部署指南

> 本项目由两个仓库组成，部署在**同一台腾讯云轻量服务器**上：
>
> | 仓库 | 角色 | 容器端口 | 宿主机端口 | 部署目录 |
> |------|------|----------|------------|----------|
> | **web**（本仓库） | Next.js 前端 | 3000 | 8000 | `~/app/web` |
> | **server** | NestJS 微服务后端 | 8001（网关） | 8001 | `~/app/server` |
>
> 两个仓库各自有独立的 GitHub Actions 流水线，push 到 `main` 即自动部署。
>
> **图标说明：**
> - 💻 = 在你的 **Mac 电脑**上操作
> - ⚠️ = 在**服务器**上操作（SSH 登录后）
> - 🌐 = 在**网页控制台**上操作（腾讯云 / GitHub）

---

## 一、架构概览

```
                    ┌──────────────────────────────────────────────┐
                    │        腾讯云轻量云服务器 (Ubuntu)             │
                    │                                              │
访客浏览器           │  ┌──────────┐                                │
   │                │  │  Nginx   │   ┌─────────────────────────┐ │
   │ HTTPS(443)     │  │  (门卫)   │──▶│ web 容器 (Next.js 前端)   │ │
   └───────────────▶│  │  :443    │   │ 容器 :3000 ← 宿主机 :8000 │ │
                    │  │  :80     │   └────────────┬────────────┘ │
                    │  └────┬─────┘                │ host.docker. │
                    │       │  /api、/uploads       │ internal:8001│
                    │       │ ┌────────────────────▼────────────┐ │
                    │       └▶│ server 网关容器 (NestJS)          │ │
                    │         │ 宿主机 :8001                     │ │
                    │         └───────────────┬─────────────────┘ │
                    │                         │ compose 内网       │
                    │   user:8004  work:8005(+TCP 8888)            │
                    │   answer:8003  analyse:8002                  │
                    │   docs:8006  contact:8007  newsletter:8008   │
                    │   poi:8009  admin:8010  redis:6379           │
                    │                         │ 外网连接            │
                    │  Certbot 管 SSL 证书     │                   │
                    └─────────────────────────┼───────────────────┘
                                              ▼
                                  ┌───────────────────────┐
                                  │  腾讯云 CynosDB MySQL  │
                                  └───────────────────────┘

Nginx 按路径分流：
  ├─ /api/auth/*  → 前端 :8000（Next.js Route Handler，写登录 Cookie）
  ├─ /api/*       → 后端网关 :8001（剥掉 /api 前缀）
  ├─ /uploads/*   → 后端网关 :8001
  └─ 其他路径      → 前端 :8000
```

---

## 二、服务器准备（仅需一次）

### 1. 买服务器 + 配防火墙 🌐

在[腾讯云轻量应用服务器控制台](https://console.cloud.tencent.com/lighthouse)新建：

- 镜像：系统镜像 → **Ubuntu 22.04 LTS**
- 套餐：**2 核 4 GB**（要跑前端 + 后端 10 个微服务容器，2G 内存不够）
- 地域：**广州**（与 COS / CynosDB 同地域）
- 登录方式：**SSH 密钥**（创建密钥对后自动下载 `xxx.pem` 私钥到 Mac）

防火墙规则（控制台 → 服务器详情 → 防火墙）：

| 端口 | 来源 | 用途 |
|------|------|------|
| 22 | 你的 IP | SSH 登录 |
| 80 | 0.0.0.0/0 | HTTP + 申请证书验证 |
| 443 | 0.0.0.0/0 | HTTPS |

> ❌ 不要开放 3000 / 8000 / 8001 / 6379 / 8888。前端与后端网关只让本机 Nginx 访问，微服务与 Redis 只在容器内网通信。

### 2. SSH 登录服务器 💻

```bash
# 私钥固定存放 + 改权限（不改权限 SSH 会拒绝使用）
mv ~/Downloads/xxx.pem ~/.ssh/uicu-server.pem
chmod 400 ~/.ssh/uicu-server.pem

# 登录（IP 换成你的公网 IP）
ssh -i ~/.ssh/uicu-server.pem ubuntu@你的公网IP
```

> ⚠️ 以下第 3~5 步命令都在**服务器**上执行。

### 3. 安装 Nginx + Certbot + Docker ⚠️

```bash
sudo apt update && sudo apt upgrade -y

# Nginx（反向代理）+ Certbot（HTTPS 证书）+ certbot 的 nginx 插件
sudo apt install -y nginx certbot python3-certbot-nginx
```

```bash
# Docker（使用清华镜像源，国内更快；海外服务器换成 download.docker.com）
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 当前用户免 sudo 用 docker + 开机自启
sudo usermod -aG docker $USER
newgrp docker
sudo systemctl enable --now docker nginx

# 验证
docker --version && docker compose version
```

> 不需要装 Node.js（镜像内置）、MySQL（用 CynosDB）、Redis（容器内跑）。

### 4. 开启 CynosDB 外网访问 🌐

数据库只有后端 server 连接（前端不直连）。

1. [CynosDB 控制台](https://console.cloud.tencent.com/cynosdb) → 你的集群 → 「外网地址」→ 开启
2. 得到外网地址和端口，形如 `gz-cynosdbmysql-grp-xxxx.sql.tencentcdb.com:25xxx`
3. 拼接连接串（后面配 Secrets 用）：

```
mysql://用户名:密码@外网地址:端口/数据库名
```

### 5. 创建部署目录 ⚠️

```bash
mkdir -p ~/app/web      # 前端
mkdir -p ~/app/server   # 后端
```

---

## 三、配置 GitHub Secrets 🌐

两个仓库**分别**配置。入口：仓库 → Settings → Secrets and variables → Actions → New repository secret。

### web 仓库（9 个）

| Secret | 值 | 说明 |
|--------|-----|------|
| `DEPLOY_SSH_HOST` | 服务器公网 IP | |
| `DEPLOY_SSH_USER` | `ubuntu` | |
| `DEPLOY_SSH_PRIVATE_KEY` | `xxx.pem` 私钥文件全部内容 | |
| `DEPLOY_GHCR_USERNAME` | GitHub 用户名 | 服务器拉镜像用 |
| `DEPLOY_GHCR_TOKEN` | GitHub PAT（勾选 `read:packages`） | Settings → Developer settings → PAT (classic) |
| `DEPLOY_ENV_FILE` | 见下方模板 | |
| `ALI_CAPTCHA_PREFIX` | 阿里云验证码身份标 | 构建期内联进前端 bundle，缺失则验证码不显示 |
| `ALI_CAPTCHA_SCENE_ID` | 阿里云验证码场景 ID | 同上 |
| `ALI_CAPTCHA_REGION` | `cn` 或 `sgp` | 同上 |

**web 的 `DEPLOY_ENV_FILE`**：

```
HOST_PORT=8000
BACKEND_URL=http://host.docker.internal:8001
```

> `BACKEND_URL` 让前端容器经宿主机访问后端网关（两个 compose 项目不在同一内网）。默认值就是这个，写上是为了显式。`IMAGE=...` 由 CI 自动写入，不用手填。

### server 仓库（6 个）

| Secret | 值 | 说明 |
|--------|-----|------|
| `DEPLOY_SSH_HOST` / `DEPLOY_SSH_USER` / `DEPLOY_SSH_PRIVATE_KEY` | 同 web | |
| `DEPLOY_GHCR_USERNAME` / `DEPLOY_GHCR_TOKEN` | 同 web | |
| `DEPLOY_ENV_FILE` | 见下方模板 | |

**server 的 `DEPLOY_ENV_FILE`**（字段以 server 仓库 `.env.example` 为准）：

```
DATABASE_URL=mysql://用户名:密码@CynosDB外网地址:端口/数据库名
SESSION_SECRET=随机字符串
JWT_SECRET=随机字符串
COS_SECRET_ID=腾讯云SecretId
COS_SECRET_KEY=腾讯云SecretKey
COS_REGION=ap-guangzhou
SMTP_HOST=SMTP服务器
SMTP_PORT=465
SMTP_USER=发件邮箱
SMTP_PASS=邮箱授权码
FRONTEND_URL=https://uicu.club
LOG_LEVEL=info
```

> 随机密钥生成：`openssl rand -base64 32`

---

## 四、配置 Nginx + 申请证书

### 1. 启用 Nginx 配置 ⚠️

本仓库已备好配置模板 `deploy/nginx-web.conf.example`（域名已固化 `uicu.club www.uicu.club`，路径分流已配好）：

```bash
# 把本仓库 clone 到服务器，或手动 scp 这个文件上去
sudo cp ~/app/web/deploy/nginx-web.conf.example /etc/nginx/sites-available/web
sudo ln -s /etc/nginx/sites-available/web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 2. 域名解析 🌐

在域名 DNS 管理页添加两条 A 记录：`@` 和 `www` → 服务器公网 IP。

```bash
# 验证解析生效（Mac 或服务器上都行）
dig uicu.club +short
```

### 3. 申请 HTTPS 证书 ⚠️

```bash
sudo certbot --nginx -d uicu.club -d www.uicu.club
# 按提示：输邮箱 → Y → N → 选 2（强制 HTTPS 跳转）

# 验证自动续期正常
sudo certbot renew --dry-run
```

---

## 五、触发部署 💻

> ⚠️ **顺序：先 server，再 web**。否则前端上线后调 `/api` 会因后端没起来而报错。

```bash
# 1) server 仓库
git push origin main
# 等 Actions 跑完（仓库 Actions 页面看进度）

# 2) web 仓库
git push origin main
```

流水线会自动：构建镜像 → 推送 GHCR → SSH 到服务器写 `.env` → `docker compose pull && up -d`。

验证：

```bash
# 💻 Mac 上
curl -I https://uicu.club                    # 前端 200
curl -I https://uicu.club/api/docs/articles  # 后端经反代也通

# ⚠️ 服务器上
cd ~/app/web && docker compose ps            # app Up (healthy)
cd ~/app/server && docker compose ps         # 全部 Up
```

---

## 六、日常运维

### 常用命令 ⚠️

```bash
ssh -i ~/.ssh/uicu-server.pem ubuntu@你的公网IP

# 前端
cd ~/app/web
docker compose ps
docker compose logs --tail 100 app
docker compose logs -f app              # 实时跟随，Ctrl+C 退出

# 后端
cd ~/app/server
docker compose ps
docker compose logs -f server           # 网关日志
docker compose logs -f user             # 单个微服务
docker compose restart user             # 重启单个微服务

# Nginx
sudo nginx -t && sudo systemctl reload nginx

# 磁盘清理（不影响运行中的容器）
docker system prune -f
```

### 回滚 ⚠️

CI 每次打两个镜像 tag：`:latest`（滚动）和 `:main-<短sha>`（不可变）。回滚 = 把 `.env` 里的 `IMAGE` 改成旧 sha tag：

```bash
cd ~/app/web   # 或 ~/app/server

# 旧 sha 在 GitHub 仓库 commit 历史里看前 7 位
sed -i '/^IMAGE=/d' .env
echo "IMAGE=ghcr.io/<owner>/web:main-<旧sha>" >> .env   # 后端则 .../server:main-<旧sha>
docker compose up -d
```

### 本地 Docker 测试 💻

```bash
# 前端（web 仓库）：http://localhost:8000
docker compose up -d --build

# 后端（server 仓库）：一次起 10 个微服务 + redis
docker compose up -d --build
```

> 只起前端时所有 `/api` 调用失败属预期（后端没跑）。本地联调需两端都起，前端经 `host.docker.internal:8001` 访问后端网关。

---

## 七、故障排查

| 症状 | 排查 |
|------|------|
| 前端 200 但接口全报错 | 后端没起：`cd ~/app/server && docker compose ps` |
| 整站 502 | 两端 `docker compose ps` + `logs` 找 crash 原因 |
| `xxx service unavailable: connect ECONNREFUSED` | 对应微服务挂了，`docker compose restart <服务名>` |
| 验证码不显示 | web 仓库 Secrets 的 `ALI_CAPTCHA_*` 没配（构建期内联，改后要重新 push） |
| 证书过期 | `sudo certbot renew && sudo systemctl reload nginx` |
| CI 拉镜像超时 | 国内拉 GHCR 偶发抖动，workflow 已内置 5 次重试；仍失败在 Actions 页 Re-run |
| 改 compose 里的端口不生效 | 微服务监听端口由各 `main.ts` 的 `<SERVICE>_PORT` 决定；compose 里的 `PORT` 仅供 HEALTHCHECK |
