# web — 通用前端工程

基于 Next.js 16（App Router）+ React 19 + TypeScript 的通用前端工程，包含营销页、认证、问卷编辑、工作台、问卷填写与统计等模块。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16（App Router、Turbopack） |
| UI | Tailwind CSS 4、shadcn/ui（radix-nova 风格）、Radix UI、lucide-react |
| 状态管理 | React Context + useReducer（编辑器） |
| 可视化 | ECharts |
| 富文本 | Quill（react-quill） |
| 拖拽 | dnd-kit |
| 国际化 | 自研 i18n（`src/i18n`，`useLocale` hook，中文 / English） |
| 测试 | Vitest + Testing Library（jsdom） |
| 包管理 | pnpm |

## 快速开始

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动开发服务器（http://localhost:3000）
```

其他常用命令：

```bash
pnpm build      # 生产构建
pnpm start      # 启动生产服务器
pnpm lint       # ESLint 检查
pnpm test       # Vitest watch 模式（文件变动自动重跑）
pnpm test:run   # 运行全部测试一次（CI 友好）
pnpm test:coverage  # 运行测试并输出覆盖率报告到 /coverage
```

安装新的 shadcn/ui 组件：

```bash
npx shadcn@4.12.0 add <component>
```

## 目录结构

```
src/
├── app/                    # App Router 页面
│   ├── (marketing)/        # 营销页（首页等，未做 i18n）
│   ├── (auth)/             # 登录 / 注册等认证页
│   ├── editor/             # 问卷编辑器
│   ├── workspace/          # 工作台
│   ├── share/              # 问卷分享 / 填写页
│   ├── s/                  # 短链跳转
│   └── api/                # API 路由
├── components/
│   ├── editor/             # 编辑器核心（画布、题型、面板）
│   │   └── components/     # 题型注册中心（WorkXxx/，见下方）
│   ├── survey/             # 问卷填写 / 统计组件
│   ├── ui/                 # shadcn/ui 组件
│   └── layout/ · sections/ · providers/
├── i18n/                   # 自研国际化（useLocale、en / zh-CN 字典）
├── lib/                    # API 封装、工具函数、问卷统计
└── proxy.ts
```

### 编辑器与题型扩展

编辑器状态由 Context + useReducer 管理（`PUSH_PAST` → `CHANGE_COMPONENT_PROPS` 撤销 / 更新模式）。

题型统一放在 `src/components/editor/components/`，每个题型一个 `WorkXxx/` 目录，包含 4 个文件：

- `interface.ts` — props 类型 + 默认值
- `Component.tsx` — 渲染组件（编辑态 + 分享态）
- `PropComponent.tsx` — 右侧属性配置面板
- `index.tsx` — 题型配置导出（title / type / Component / PropComponent / defaultProps / Icon）

新题型需在 `components/index.tsx` 的 `componentConfList` / `componentConfGroup`（按 `groupKey` 分组）中注册。

### 国际化

- `useLocale()` 返回 `{ t, locale, setLocale, ready }`，`t` 接收 selector 函数：`t((m) => m.namespace.key)`
- 变量插值用 `format(t((m) => m.ns.key), { var: value })`
- 字典：`src/i18n/locales/en.ts`（类型源）+ `zh-CN.ts`
- 命名空间：`nav`、`home`、`editor`、`survey`、`workspace`、`authPages`、`auth`、`notFound`、`footer`、`common`

## 环境变量

本地开发在 `.env.local` 中配置（参考部署文档了解生产环境变量 HOST_PORT / IMAGE）。

## 测试

- 测试文件与源码同目录，后缀 `*.test.ts(x)` / `*.spec.ts(x)`
- jsdom 环境、`@/*` 路径别名、jest-dom 匹配器均已在 `vitest.config.ts` / `vitest.setup.ts` 中配置

## 部署

生产环境使用 Docker + docker-compose 部署（容器内监听 3000，宿主机映射 8000，由 Nginx 按域名反代）。

```bash
docker compose up -d --build                    # 本地：构建并后台启动
docker compose pull && docker compose up -d     # 远端：拉新镜像并滚动更新
docker compose logs -f app                      # 跟随日志
docker compose down                             # 停止并清理容器
```

详细部署步骤见 [deploy/README.md](deploy/README.md)。
