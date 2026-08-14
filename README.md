# RAG 智能知识库前端

基于 Vite + React 19 + TypeScript + TailwindCSS 4 + ShadCN UI 的 RAG 知识库管理系统前端，支持文档管理、结构化数据管理与 SSE 流式智能问答。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（使用 Mock 数据，无需后端）
pnpm dev:mock

# 启动开发服务器（连接真实后端，默认代理到 http://localhost:8000）
pnpm dev

# 生产构建
pnpm build
```

Mock 环境登录账号：`admin` / `admin123`

## 环境变量配置

环境变量通过 `.env.*` 文件按环境注入，Vite 构建时自动加载对应文件：

| 文件 | 生效时机 |
|------|----------|
| `.env.development` | `pnpm dev` / `pnpm dev:mock`（开发模式） |
| `.env.test` | `vite build --mode test` |
| `.env.production` | `pnpm build`（生产模式） |
| `.env.local` | 任意模式的本地覆盖（已 gitignore） |

### 变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | API 基础地址，axios baseURL 与 SSE 请求均基于此 | `/api` |
| `VITE_ENABLE_MOCK` | 是否启用 MSW mock 服务（`true`/`false`） | `true` |
| `VITE_APP_TITLE` | 应用标题（注入 `document.title`） | `RAG 智能知识库` |
| `VITE_SSE_TIMEOUT` | SSE 流式超时时间（毫秒） | `300000` |

代码中统一通过 `src/utils/constants.ts` 导出的常量访问（`API_BASE_URL`、`ENABLE_MOCK`、`APP_TITLE`、`SSE_TIMEOUT`），类型定义见 `src/vite-env.d.ts`。

## Mock 服务（MSW）

项目使用 [MSW (Mock Service Worker)](https://mswjs.io/) 在浏览器层拦截请求，无需后端即可完整体验所有功能。

### 启用条件

仅当 **开发模式（`import.meta.env.DEV`）** 且 **`VITE_ENABLE_MOCK=true`** 时启动，见 `src/main.tsx` 中的 `bootstrap()`。生产构建中 mock 代码会被 tree-shaking 移除。

### 目录结构

```
src/mocks/
├── handlers.ts      # 所有 API 接口的 mock handlers
├── browser.ts       # 浏览器环境 MSW 初始化（setupWorker）
└── data/            # mock 数据（按模块拆分）
    ├── auth.ts      # 用户信息、登录凭证、token
    ├── document.ts  # 文档列表
    ├── struct.ts    # 结构化数据
    └── chat.ts      # 会话、流式回答分片、溯源引用
```

### 覆盖的接口

- **登录认证**：登录（校验 admin/admin123）、获取用户信息、修改密码
- **文档管理**：分页列表（支持关键字过滤）、详情、创建、更新、删除、文件上传、问答范围选项
- **向量化任务**：发起任务、状态轮询（模拟 pending → processing → success 推进）、失败重试
- **结构化数据**：分页列表、创建（键唯一校验）、更新、删除、批量删除、触发向量化
- **智能问答**：会话列表、新建会话、删除会话、SSE 流式问答（分片推送 message → references → done 事件）

所有响应遵循项目统一结构 `{ code: 0, message: 'success', data: ... }`；缺少 Authorization 头的受保护接口返回 401。

### Service Worker 文件

MSW 依赖 `public/mockServiceWorker.js`（已纳入版本控制）。若升级 MSW 版本或文件缺失，执行：

```bash
pnpm msw:init
```

### 关闭 Mock

将 `.env.development` 中 `VITE_ENABLE_MOCK` 改为 `false` 并重启开发服务器，请求将经 Vite 代理转发到 `http://localhost:8000` 的真实后端。

## 项目结构

采用 **Feature-based（业务模块）+ Layer-based（职责分层）** 混合架构：

```
src/
├── app/                 # 应用层：入口 main.tsx、路由 router/、布局 layout/
├── features/            # 业务功能模块（各自包含 api/hooks/types/store/components/pages）
│   ├── auth/            #   登录认证、个人中心
│   ├── chat/            #   智能问答（含 SSE 流式组件）
│   ├── document/        #   文档管理、向量化任务
│   └── struct/          #   结构化数据
├── shared/              # 全局共享层：utils（http/sse/storage 等）、components/ui（ShadCN）、
│   ...                  #   hooks、store（theme）、types、lib
└── mocks/               # MSW mock 服务
```

约定：feature 模块内部使用相对路径引用，跨模块一律通过 `@/` 别名（指向 `src/`）引用；业务代码不得反向依赖 app 层。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（端口 3000） |
| `pnpm dev:mock` | 初始化 MSW worker 并启动开发服务器 |
| `pnpm build` | TypeScript 检查 + 生产构建 |
| `pnpm preview` | 预览生产构建产物 |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm msw:init` | 重新生成 MSW Service Worker 文件 |
