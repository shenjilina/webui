# 后端接口对接设计（用户已确认）

以 docs/openapi.json（2026-10-17 从运行中的后端获取）为契约。
保留 React 19 / TypeScript / React Query / Zustand，开发代理到 127.0.0.1:8000，默认关闭 mock。
认证：登录、注册、用户详情、修改密码、退出，HTTP 和 SSE 共用鉴权失效处理；退出清理用户数据缓存。
知识库：分页查询、创建、编辑、状态、摘要、名称确认删除；文件是用户级资源，文档才属于知识库。
文件文档：上传每项结果、关联创建、解析、重试、删除源文件与文档、状态轮询、分块分页；不使用未声明参数。
问答：用户选择 ACTIVE 知识库和 topK；用本地 UUID 开始会话，通过 conversation_session_id 传递。历史按 sessionId 和 knowledgeBaseId 分组，删除逐条问答记录；失败部分保留并刷新。
SSE：后端 data JSON 的 event 字段为 sources/chunk/error/done，载荷使用 source_documents/page_content、content、conversation_id。error 后继续消费 done。超时、取消、断流、401、UTF-8 分片都需要测试。
结构化数据改为文档分块查看，保留旧路由兼容，不再提供无后端支持的 CRUD/向量化功能。
安全：不修改后端、不读取密钥、不自动创建真实账号或测试业务数据、不自动提交。
验收：契约/转换/流式/状态测试、pnpm test、pnpm lint、pnpm build；真实受保护业务链路未登录则明确标注。
