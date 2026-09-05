import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone: 让 Next.js 产出一个自包含的 server.js + 最小 node_modules
  // Docker 镜像只需拷贝 .next/standalone + .next/static + public 即可运行
  output: "standalone",

  // 明确指定 Turbopack 根目录，消除多 lockfile 警告
  turbopack: {
    root: process.cwd(),
  },

  // 反向代理：仅本地开发时把 /api/** 转发到后端，避免跨域
  // 生产环境不在这里转发——由 Nginx 直接把 /api、/uploads 反代到后端 8001
  // （见 web/deploy/nginx-web.conf.example），Next.js 不额外兜一层
  // 本地开发：走 http://localhost:8001（可用 BACKEND_URL 覆盖）
  async rewrites() {
    // 生产构建（docker 容器，NODE_ENV=production）交给 Nginx 处理，这里不注入 rewrite
    if (process.env.NODE_ENV === "production") {
      return [];
    }
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8001";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
