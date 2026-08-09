# LightRAG WebUI 项目 Rules

> 本文档基于项目实际代码与配置文件归纳，供 AI 编码助手与开发者遵循。
> 未检测到的约定会明确标注「未检测到相关约定」。

---

## 1. 项目基本信息

- **项目名称**：`lightrag-webui`（`package.json`，private 包，version `0.0.0`）
- **用途**：基于 React 的 Web 界面，用于与 LightRAG 后端（FastAPI）交互。
- **主要功能**：
  - 文档管理（上传/扫描/删除/清空，`DocumentManager`）
  - 知识图谱可视化（Sigma.js，`GraphViewer`）
  - 检索测试/对话（`RetrievalTesting`）
  - API 文档站点（iframe 嵌入，`ApiSite`）
  - 登录/鉴权（JWT + guest 模式）、后端健康检查
- **前端框架**：React 19（`react-jsx` transform）
- **构建工具**：Vite 8（`@vitejs/plugin-react`、`@tailwindcss/vite`）
- **包管理器偏好**：
  - **推荐 Bun**：`bun install --frozen-lockfile`（存在 `bun.lock`）
  - 兼容 npm / pnpm（仓库同时存在 `pnpm-lock.yaml`）
  - 测试（`bun test`）**仅 Bun 支持**；其余脚本 Bun 与 npm 均可

---

## 2. 技术栈约定

| 领域 | 技术 | 说明 |
|---|---|---|
| 语言 | TypeScript ~6.0，`strict: true` | 含 `noUnusedLocals`/`noUnusedParameters` |
| UI 组件库 | Radix UI 原语 + shadcn/ui 风格封装 | `components.json`：style `new-york`、baseColor `zinc`、cssVariables |
| 样式 | Tailwind CSS v4（`@import 'tailwindcss'` + `@plugin`） | 另保留 v3 风格 `tailwind.config.js` 供插件使用 |
| 图标 | `lucide-react` | shadcn `iconLibrary: lucide` |
| 状态管理 | Zustand 5 | 自研 `createSelectors` 模式（见 §6） |
| 路由 | react-router-dom v7（`HashRouter`） | 仅 `/login` 与受保护主界面两条路由 |
| 国际化 | i18next + react-i18next | 中/英双语，`src/locales/*.json` |
| 图谱 | sigma v3 + graphology + @react-sigma/* | 多种布局算法包 |
| 表格 | @tanstack/react-table | 配合 `components/ui/DataTable.tsx` |
| HTTP | axios（统一实例 + 拦截器） | 流式接口用原生 `fetch` |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex/raw | KaTeX 经 `resolve.dedupe: ['katex']` 保证单实例 |
| Toast | sonner（`<Toaster>` 挂载于 `AppRouter`） | |
| 表单校验 | **未检测到 zod 等 schema 校验库**，表单用受控组件手写 | |
| 命令面板/搜索 | cmdk、minisearch | |

---

## 3. 目录结构规则

```
src/
├── api/          # 后端 API 封装与类型定义（lightrag.ts 单一入口）
├── components/   # 可复用组件
│   ├── ui/       # shadcn/ui 基础组件（Button、Dialog、Tabs、Table...）
│   ├── graph/    # 图谱相关组件（控制、图例、属性面板、搜索）
│   ├── documents/# 文档管理对话框
│   ├── retrieval/# 检索/对话组件
│   ├── status/   # 后端状态指示组件
│   └── icons/    # 自定义图标组件
├── contexts/     # React Context（当前仅 TabVisibility）
├── features/     # 页面级功能模块（一个 tab 一个文件）
├── hooks/        # 自定义 hooks（useDebounce、useLightragGraph...）
├── lib/          # 常量、纯工具函数、路径前缀、运行时配置
├── locales/      # i18n 文案（en.json / zh.json）
├── services/     # 非 React 服务（navigation.ts 导航服务）
├── stores/       # Zustand stores（graph / settings / state）
├── types/        # 第三方库类型补丁（katex.d.ts）
└── utils/        # 业务工具类（axios 封装、剪贴板、图颜色、搜索历史、remark 插件）
```

**新增文件放置规则**：
- 后端接口调用与响应类型 → `src/api/lightrag.ts`（不新建 api 文件，除非体量过大）
- 页面/一级功能模块 → `src/features/`（PascalCase 单文件）
- 通用无业务组件 → `src/components/ui/`；业务组件按域放入 `graph/`、`documents/`、`status/`、`retrieval/`
- 全局共享状态 → `src/stores/`；跨树 React 状态 → `src/contexts/`
- 纯函数/常量/路径处理 → `src/lib/`；与业务耦合的工具 → `src/utils/`
- 可复用副作用逻辑 → `src/hooks/`
- **`src/lib/pathPrefix.ts` 必须保持零依赖**（被 `vite.config.ts` 在 Node 端导入，不能用 `@/` 别名与 UI 类型）

---

## 4. 代码风格规范

**格式化（Prettier，`.prettierrc.json`）**：
- 无分号（`semi: false`）、单引号、2 空格缩进、`printWidth: 100`
- 无尾随逗号（`trailingComma: none`）、换行符 **CRLF**
- 启用 `prettier-plugin-tailwindcss`（Tailwind 类名自动排序，勿手工排序类名）

**ESLint（`eslint.config.js`）**：
- `@stylistic/indent: 2`、`@stylistic/quotes: single`（error 级）
- 启用 `react-hooks` 推荐规则、`react` recommended + jsx-runtime
- `react-refresh/only-export-components`：warn，允许常量导出（`allowConstantExport`）
- `@typescript-eslint/no-explicit-any`：**已关闭**（代码中允许 `any`，但应优先用具体类型）
- 风格冲突以 `eslint-config-prettier` 为准（格式类规则归 Prettier）

**命名与写法**：
- 组件文件：PascalCase `.tsx`（`Button.tsx`、`GraphViewer.tsx`），**默认导出组件**（`export default Button`），`forwardRef` 组件设置 `displayName`
- 类型：`export type XxxType = {...}`（API 响应类型带 `Lightrag` 前缀，如 `LightragGraphType`）
- API 函数：camelCase 动词开头，`async` 箭头函数 `export const getXxx = async (): Promise<T> => {...}`
- 常量：`src/lib/constants.ts` 中 camelCase（`healthCheckInterval`）
- store：`useXxxStore`（`useSettingsStore`、`useAuthStore`、`useBackendState`）
- hooks：`useXxx`
- 导入路径：src 内一律用 `@/` 别名；`vite.config.ts` 内必须用相对路径
- 导入顺序（无插件强制，沿用现有惯例）：react → 第三方库 → `@/` 内部模块 → 类型/样式
- 变体样式用 `class-variance-authority`（`cva`）定义，类名合并统一用 `cn()`（`clsx` + `tailwind-merge`）

---

## 5. 组件开发规范

- **优先复用 `src/components/ui/` 现有组件**（Button、Dialog、AlertDialog、Tabs、Select、DataTable、Tooltip、Popover、Input、Textarea、Progress 等），不要重复造轮子；新增基础组件遵循 shadcn/ui new-york 风格放入该目录。
- **Dialog 约定**：用 `@radix-ui/react-dialog` 封装的 `ui/Dialog`；业务对话框放在对应域目录（如 `components/documents/ClearDocumentsDialog.tsx`），props 采用受控模式：
  ```ts
  interface Props { open: boolean; onOpenChange: (open: boolean) => void; /* 业务数据 */ }
  ```
- **Props 设计**：接口紧贴组件定义，命名为 `XxxProps`；尽量扩展原生属性（`React.ButtonHTMLAttributes<HTMLButtonElement>`）+ `VariantProps<typeof xxxVariants>`；用 `asChild` + `Slot` 支持组合。
- **Table**：使用 `ui/DataTable`（@tanstack/react-table），列定义与分页控制参考 `DocumentManager` 与 `ui/PaginationControls`。
- **Tooltip**：Button 已内置 `tooltip` prop，直接传字符串即可，无需外层再包 Tooltip。
- **图标**：一律使用 `lucide-react`；自定义复合图标放 `components/icons/`。
- **forwardRef 组件**必须显式 `displayName`；组件文件除默认导出外只允许导出变体/类型（受 react-refresh 规则约束，必要时加 `// eslint-disable-next-line react-refresh/only-export-components`）。
- 防抖/节流使用 `src/hooks/useDebounce` 与 `src/lib/utils.ts` 的 `throttle`。

---

## 6. 状态管理规范

**Zustand（首选，`src/stores/`）**：
- 创建模式固定：先定义 `interface XxxState`（字段 + setter/action），`create<XxxState>()(...)`，再经 `createSelectors()` 包装导出：
  ```ts
  const useXxxStoreBase = create<XxxState>()(set => ({...}))
  export const useXxxStore = createSelectors(useXxxStoreBase)
  ```
- 组件内读取用自动 selector：`useSettingsStore.use.theme()`（避免整 store 订阅）
- 事件回调/非组件代码中用 `useXxxStore.getState().action(...)` 与 `useXxxStore.setState(...)`
- 需要持久化的 store 用 `persist` + `createJSONStorage(() => localStorage)`（`settings.ts`），storage key 为 `xxx-storage`；运行时临时状态（如刷新触发器）不要持久化
- store 拆分：`settings`（用户偏好，持久化）、`state`（认证/后端健康，运行时）、`graph`（图谱交互，运行时）

**React Context（`src/contexts/`）**：
- 仅用于跨组件树的轻量共享（当前只有 `TabVisibilityProvider`）；全局/复杂/需持久化的状态一律用 store
- Context 类型定义放 `contexts/types.ts`，hook 放 `useXxx.ts`（`useTabVisibility.ts`）

**主题**：`ThemeProvider`（class 模式 dark）+ `src/stores/settings` 的 `theme` 字段。

---

## 7. API 调用规范

所有接口集中在 `src/api/lightrag.ts`：

- **请求封装**：axios 实例与拦截器封装在 `src/utils/axios.ts`（默认导出实例，另命名导出 `silentRefreshGuestToken` 供流式请求复用）；接口函数集中在 `src/api/lightrag.ts` 导入使用。`baseURL` 用 `backendBaseUrl`（来自运行时注入配置，见 §13），**禁止硬编码 URL 前缀**。
- **拦截器**：
  - request 拦截器注入 API Key / Bearer token；需跳过时用 header `X-Skip-Interceptor: 'true'`
  - response 拦截器处理 token 续期、guest token 刷新、401 登出跳转（经 `navigationService`）
- **接口函数**：每个接口一个导出异步函数，命名 `getXxx / postXxx / deleteXxx / checkXxx`，返回 `Promise<具体类型>`（返回 `response.data`），类型以 `Lightrag*` / `*Request` / `*Response` 命名并 export。
- **错误处理**：
  - 健康检查等允许失败的调用内部 try/catch，用 `errorMessage(error)`（`@/lib/utils`）归一化消息返回
  - 业务错误消息常量导出（如 `InvalidApiKeyError`、`RequireApiKeError`），由 UI 层匹配处理
- **流式接口**（如 query stream）用原生 `fetch` + 模板字符串拼接 `${backendBaseUrl}/...`，因此前缀必须经 `normalizeApiPrefix` 处理（避免 `//path` 协议相对路径问题）。
- **测试 hook**：为可测性，内部注入点以 `__xxxForTests` 命名导出（如 `__setPaginatedDocumentsPostForTests`），生产代码不得调用。

---

## 8. 路由与页面组织规范

- 使用 **HashRouter**（`AppRouter.tsx`），适配任意反向代理挂载路径；不要改成 BrowserRouter。
- 路由极简：`/login` → `LoginPage`；`/*` → 鉴权后渲染 `<App/>`；未认证强制重定向 `/login`。
- **主界面不用路由切换页面**，而是 `Tabs`（`App.tsx`）切换四大功能模块，当前 tab 存于 `useSettingsStore.currentTab`：
  - `documents` → `DocumentManager`
  - `knowledge-graph` → `GraphViewer`
  - `retrieval` → `RetrievalTesting`
  - `api` → `ApiSite`
- 页面级模块放 `src/features/`，一个文件一个模块，默认导出。
- 非组件代码中导航通过 `src/services/navigation.ts` 的 `navigationService`（在 `AppRouter` 中注入 `useNavigate`）。
- token 存于 `localStorage['LIGHTRAG-API-TOKEN']`，勿改 key 名。

---

## 9. 国际化规范

- 文案文件：`src/locales/en.json`（英文为 fallback）与 `zh.json`，**新增/修改文案必须双语同步**。
- 顶层 key 按功能域划分（现有）：`settings`、`header`、`login`、`common`、`documentPanel`、`graphPanel`、`retrievePanel`、`apiSite`、`apiKeyAlert`、`pagination`。新功能域新增同名顶层 key，内部用小写 camelCase 二级/三级 key，如 `t('documentPanel.clearAll')`。
- 组件内：`const { t } = useTranslation()`；**禁止在组件中硬编码用户可见文案**。
- i18n 配置（`src/i18n.ts`）：语言存于 settings store（`settings-storage` 的 `state.language`），`fallbackLng: 'en'`、`returnEmptyString: false`、`returnNull: false`；语言切换由 store 订阅驱动，勿在组件里直接 `i18n.changeLanguage`。
- 仅支持 `en` / `zh` 两种语言，类型约束为 `'en' | 'zh'`。

---

## 10. 样式规范

- **只用 Tailwind 工具类**，不写独立 CSS 文件；全局样式/CSS 变量集中在 `src/index.css`（Tailwind v4 `@import 'tailwindcss'` + `@plugin` 写法）。
- 类名合并一律用 `cn(...)`；类名顺序交给 `prettier-plugin-tailwindcss`。
- **颜色用语义 token**：`bg-background`、`text-foreground`、`border-border`、`bg-primary`、`text-muted-foreground`、`bg-card`、`bg-popover`、`bg-destructive` 等（HSL 变量，见 `index.css`）；避免写死 hex（图谱专用颜色常量例外，放 `lib/constants.ts`）。
- **暗色模式**：class 策略（`@custom-variant dark (&:is(.dark *))`，html 加 `.dark`）；需要区分主题时用 `dark:` 前缀或主题变量，不要用 JS 判断写死颜色（图谱 canvas 例外，通过 `useTheme` 判断）。
- 圆角用 `rounded-sm/md/lg`（映射 `--radius` 变量）；动画用 `tailwindcss-animate` 提供的类。
- Markdown 渲染区域使用 `@tailwindcss/typography` 的 `prose` 体系（变量 `--tw-prose-*`）。
- 响应式使用标准断点前缀（如 `md:inline-block`）；未检测到容器查询等高级约定。

---

## 11. 测试规范

- **测试框架**：`bun:test`（`import { describe, expect, test } from 'bun:test'`），无 Jest/Vitest。
- **文件位置与命名**：与被测源文件同目录同名加 `.test.ts`（`src/api/lightrag.test.ts`、`src/lib/pathPrefix.test.ts`、`src/features/documentStatusFilters.test.ts`）。
- **测试重点**（现有用例归纳）：纯函数边界（空值/斜杠归一化）、请求生命周期（abort/超时/重试）等逻辑行为；依赖浏览器 API 时在 `beforeAll` 中 mock `localStorage/sessionStorage`。
- 测试专用注入点以 `__xxxForTests` 命名导出，测试后在 `afterEach` 中 reset。
- 纯 TS 逻辑测试文件可加 `/// <reference types="bun" />`。
- 组件级/快照测试：**未检测到相关约定**（无 testing-library 依赖）。

---

## 12. 开发与构建命令

| 命令 | 说明 |
|---|---|
| `bun install --frozen-lockfile` | 安装依赖（推荐） |
| `bun run dev` / `npm run dev` | 启动开发服务器 |
| `bun run dev:bun` | 显式用 Bun 运行 vite（`bunx --bun vite`） |
| `bun run build` / `npm run build` | 生产构建，输出到 `../lightrag/api/webui` |
| `bun run preview` | 预览生产构建 |
| `bun run lint` | ESLint 检查（`eslint .`） |
| `bun test` / `bun test --watch` / `bun test --coverage` | 运行测试（仅 Bun） |

注意事项：
- Bun 构建失败时回退 `npm install && npm run build`（README 明示）。
- `vite.config.ts` 中**禁止使用 `@/` 别名导入**（Node 加载时无法解析；Bun 会掩盖问题），必须用相对路径。
- Windows 环境注意 CRLF（Prettier 已强制 `endOfLine: crlf`）。

---

## 13. 项目特殊注意事项

- **路径别名**：`@` → `./src`，同时在 `tsconfig.json paths` 与 `vite.config.ts resolve.alias` 维护，改动需两处同步。
- **运行时路径前缀（关键机制）**：
  - API/WebUI 前缀不在构建时注入，而是**请求时**由 FastAPI 替换 `index.html` 中的 `<!-- __LIGHTRAG_RUNTIME_CONFIG__ -->` 占位符为 `window.__LIGHTRAG_CONFIG__`。
  - 前端唯一读取点是 `src/lib/runtimeConfig.ts`；对外经 `src/lib/constants.ts` 的 `backendBaseUrl` / `webuiPrefix`（经 `normalizeApiPrefix` / `normalizeWebuiPrefix` 归一化）。
  - 开发环境由 `vite.config.ts` 的 `lightragRuntimeConfigPlugin` 用 `VITE_DEV_API_PREFIX` 做同样注入，保证 dev/prod 行为一致。
  - 新增对前缀的使用时必须走上述常量，不要自读 env 或 window。
- **环境变量**（`.env.development`）：`VITE_BACKEND_URL`、`VITE_API_PROXY=true`、`VITE_API_ENDPOINTS`（代理端点白名单，逗号分隔）。本地样板：`env.local.sample` / `env.development.smaple`（注意文件名拼写如此）。
- **构建输出**：`outDir: ../lightrag/api/webui`（同级 Python 包目录），`emptyOutDir: true`；`base: './'` 相对路径资源，要求服务端在 `/` 结尾的 URL 提供 index.html。
- **KaTeX 单实例**：`resolve.dedupe: ['katex']`，mhchem 扩展在 `main.tsx` 注册，勿移除。
- **类型声明**：`src/vite-env.d.ts`（Vite 环境类型）、`src/types/katex.d.ts`（第三方补丁）；`window.__LIGHTRAG_CONFIG__` 的 global 声明在 `runtimeConfig.ts`。
- **依赖锁定**：仓库存在 `bun.lock` 与 `pnpm-lock.yaml` 两份锁文件；README 推荐 Bun。增删依赖后需同步更新所用包管理器的锁文件。
- **`package.json` 无 type-check 脚本**：`tsconfig` 为 `noEmit`，类型检查依赖编辑器/`tsc --noEmit`（未配置为 npm script，未检测到相关约定）。
- **CI/CD、commit 规范、e2e 测试**：未检测到相关约定（仓库无 `.github/`、lint-staged、husky 等配置）。
