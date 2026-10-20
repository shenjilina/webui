# Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
> **Goal:** 将现有前端接入真实 FastAPI 接口。
> **Architecture:** 保留特性模块结构，用适配函数连接后端问答记录和 UI 会话；公共层处理 HTTP/SSE、分页与鉴权。
> **Tech Stack:** React 19, TypeScript, Vite, React Query, Zustand, Vitest, pnpm 10.12.0.
> **Spec:** docs/superpowers/specs/2026-10-17-backend-integration.md

## Global Constraints

按 AGENTS.md 风格；不添加业务层到 app 的依赖；不用 any；不更改后端、不提交秘密、不自动提交。

## Task 1: 公共请求与契约

Files: src/shared/utils/{http,sse,apiError,pagination}.ts and adjacent tests, docs/openapi.json, vite.config.ts, .env.example.

- [x] 写错误解析、SSE、分页失败测试并执行验证失败。
- [x] 实现统一错误/鉴权、真实 SSE 事件与资源释放、分页聚合，运行测试。

## Task 2: 认证与用户边界

Files: src/features/auth/{api,hooks,pages,types}, src/shared query cache.

- [x] 写认证请求契约测试并验证失败。
- [x] 实现注册、密码长度、登出清理 query/chat、401 不误报登录失败。
- [x] 运行聚焦测试。

## Task 3: 文档与知识库

Files: src/features/document/{api,hooks,types,components,pages}, src/features/knowledge/{api,hooks}.

- [x] 写分页与文件参数契约测试并验证失败。
- [x] 移除文件知识库参数、恢复文件刷新/状态轮询、明确资源归属与删除确认，处理多页。
- [x] 分块预览分页及错误/空状态。

## Task 4: 问答、历史及 UI

Files: src/features/chat/{api,types,utils,store,hooks,components,pages}, src/app/layout/components/ChatSessionPanel.tsx.

- [x] 写记录分组、历史还原、参数和状态转换测试并验证失败。
- [x] 实现记录 API、UUID 会话、知识库选择、topK、SSE、历史及删除；流期间防切换，取消/退出不串写。
- [x] 用测试验证断流、取消、失败会话隔离。

## Task 5: 分块页与验收

Files: src/features/struct/pages/StructData.tsx, src/app/layout/MainLayout.tsx, README.md.

- [x] 替换无后端支持的结构化页面为知识库/文档/分块分页查看。
- [x] 运行全部测试、lint、build，修复本次引入的问题。
- [x] 自审 diff，对照 OpenAPI 的全部在用路由并记录真实联调范围。

## 验证说明

- 本计划各实现项已完成。红绿验证主要用于最初的错误解析/SSE/分页/文档参数与分组测试，以及审查发现的会话删除互斥；后续请求契约与缓存回归部分为直接通过的补充覆盖，不能称所有用例均经过红绿。
- 真实 OpenAPI 与快照语义相同，共 34 个路径；健康检查 200；开发首页 200，开发代理的受保护接口无凭据返回后端 401。
- 未使用真实账号、未自动创建业务数据；上传/解析/RAG 鉴权全链路和可视化验收尚未执行，手工步骤见 README。
- 代码审查的三项 P2 已处理：删除/发送互斥；解析使详情与分块缓存失效；源文件区脱离知识库选择独立展示。
- 格式遵循仓库 CRLF 配置，差异检查使用 git -c core.whitespace=cr-at-eol diff --check。

## ????????2026-10-17?

- pnpm test?15 ??????39 ????????
- pnpm lint???????????
- pnpm build?TypeScript ? Vite ???????? 0??? JS ? 1.14 MB??? chunk ?? 500 kB ???????
- pnpm ???? onlyBuiltDependencies ?????????????????????????
- git -c core.whitespace=cr-at-eol diff --check????
- ?????????????????? UI ????????????????????
- ????????????????????
