# RAG 智能知识库前端

Vite + React 19 + TypeScript 前端，按照 FastAPI OpenAPI 对接认证、知识库、源文件、文档分块与 SSE 问答。

## 连接真实后端

要求 Node.js 与 pnpm 10.12.0。先启动后端，确认接口文档可访问：
http://127.0.0.1:8000/docs#/

```powershell
pnpm install
# 首次配置（已有 .env.local 时不要覆盖）
Copy-Item .env.example .env.local
pnpm dev
```

访问 http://127.0.0.1:3000 。使用真实后端账号登录，也可通过注册页自行注册。
默认不开启 Mock；开发服务器将 /api 代理到 http://127.0.0.1:8000。
不要把密码、Token 或本地环境文件提交到仓库。

### 环境变量

| 变量              | 默认值         | 说明                       |
| ----------------- | -------------- | -------------------------- |
| VITE_API_BASE_URL | /api           | HTTP 与 SSE 共用的基础路径 |
| VITE_ENABLE_MOCK  | false          | 仅开发模式可开启演示 Mock  |
| VITE_APP_TITLE    | RAG 智能知识库 | 应用标题                   |
| VITE_SSE_TIMEOUT  | 300000         | SSE 整体超时，毫秒         |

Vite 自动读取对应模式的 .env 文件；.env.local 可覆盖本地配置。修改后需重启开发服务器。

## 已对接功能与资源边界

- **认证**：登录、注册、个人资料、改密、退出；受保护接口 401 清理登录状态与缓存。
- **知识库**：分页查询、新增、编辑、启用/禁用/归档、统计、输入名称确认删除。
- **源文件**：属于当前用户，不属于某个知识库；多文件上传使用重复的 files 字段，逐个展示接受/拒绝结果。支持 PDF、DOCX、TXT、MD、MARKDOWN，默认上限 100MB，最终以后端配置为准。
- **文档**：属于知识库；从已上传文件创建文档、解析/重试、状态刷新、删除与详情。公开知识库文档不依赖当前用户拥有源文件。
- **文档分块**：保留 /document/struct 路由，替换原来没有后端支持的结构化数据 CRUD，提供只读文档分块分页浏览。
- **问答**：选择已启用知识库、TopK 1–20、问题最多 2000 字、流式回答、停止生成、历史恢复与删除。未提供文档范围筛选或服务端创建空会话的虚假操作。
- **会话**：后端保存的是一条条问答记录，前端按知识库和 sessionId 分组；无 sessionId 的旧记录分别展示。删除一组会话时逐条调用删除接口，部分失败后刷新历史。
- **引用**：sources/chunk/error/done 使用实际 data-only SSE 协议；检索分数为距离，越小越相近。历史只包含来源文档 ID 时不伪造引用原文。

停止客户端生成不保证服务端停止或不保存记录；请刷新历史确认。解析、删除等权限最终由后端校验。

## Mock 演示（不是后端联调）

在 .env.local 设置 VITE_ENABLE_MOCK=true，然后：

```bash
pnpm dev:mock
```

该命令只初始化 MSW worker 并启动 Vite，**不会自动设置 VITE_ENABLE_MOCK**。
演示账号：admin / admin123（不是后端账号）。
Mock 支持认证演示、知识库/文件/文档/分块只读浏览，以及内存问答历史、流式演示和历史删除。
注册、上传、解析、知识库写操作等未实现的请求返回 501，明确提示需要真实后端，不会穿透 Mock 修改后端数据。
关闭 Mock 时将 VITE_ENABLE_MOCK 改回 false 并重启；浏览器如残留旧 worker，可在开发者工具中注销对应 Service Worker 后刷新。

## 开发与验证命令

| 命令               | 用途                                         |
| ------------------ | -------------------------------------------- |
| pnpm dev           | 开发服务器，默认端口 3000                    |
| pnpm dev:mock      | 初始化 MSW 并启动开发服务器，需手动启用 Mock |
| pnpm test          | Vitest 单元/请求契约测试                     |
| pnpm test:watch    | 测试监听                                     |
| pnpm test:coverage | 覆盖率（需对应 Vitest coverage provider）    |
| pnpm lint          | ESLint                                       |
| pnpm build         | TypeScript 检查与生产打包                    |
| pnpm preview       | 本地预览构建；不提供开发代理                 |
| pnpm msw:init      | 重新生成 public/mockServiceWorker.js         |

接口快照在 docs/openapi.json。测试包括错误解析、401 分流、分页、SSE 协议/中断/取消/超时、API 请求参数、会话分组与状态，以及在用 API 路由对照 OpenAPI 的审计。
这些检查不能替代真实账号与真实文件的端到端验收。

### 真实后端手工验收

1. 关闭 Mock，登录真实账号；检查个人资料和登录失效后的跳转。
2. 创建知识库，上传允许的文件，确认逐文件结果，创建文档并触发解析。
3. 等待解析结束，检查统计、详情及多页分块；用公开知识库验证非所有者只读浏览。
4. 选知识库发送问题，检查分片、引用、完成后历史恢复；测试停止、失败、刷新及知识库隔离。
5. 仅在可删除的测试数据上验证删除确认、历史删除与失败重试；改密/注销由使用者自行验收。

当前未使用真实凭据或自动创建真实业务数据，鉴权后的上传→解析→检索问答全链路仍需上述验收。

## 生产部署

```bash
pnpm build
```

部署 dist/，配置 SPA history fallback，并将 /api 反向代理到后端。
Vite 的 server.proxy 仅在开发服务器生效，pnpm preview 也不会代理后端。
如使用绝对 API 地址，需要后端允许正确的 CORS 来源。
SSE 路径需关闭代理响应缓冲（如 Nginx proxy_buffering off），配置足够长的读取超时，避免缓存或压缩导致分片积压。

## 目录

- src/app：入口、路由、布局
- src/features/auth：认证
- src/features/knowledge：知识库 API 与 hooks
- src/features/document：文件、文档与分块
- src/features/chat：SSE、问答、历史和会话状态
- src/features/struct：兼容旧路由的只读分块页
- src/shared：HTTP/SSE、错误处理、分页、UI
- src/mocks：与当前契约匹配的有限演示
- docs/superpowers：设计、实施计划及验证记录

feature 内使用相对引用，跨 feature 用 @/；业务层不得依赖 app 层。
