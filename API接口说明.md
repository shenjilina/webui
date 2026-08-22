# RAG 知识库前端系统 API 接口说明

> 本文档根据当前前端 API 封装、TypeScript 类型和 MSW Mock 整理。接口基础地址由 `VITE_API_BASE_URL` 配置，默认值为 `/api`。因此文档中的完整路径默认以 `/api` 开头。

## 1. 通用约定

### 1.1 请求头

除登录接口外，接口均需要携带登录凭证：

```http
Authorization: Bearer <token>
Content-Type: application/json
```

文件上传使用 `multipart/form-data`，SSE 问答使用 `POST` 请求并返回 `text/event-stream`。

### 1.2 通用返回结构

普通 HTTP 接口统一返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

`code = 0` 表示成功，非 0 表示业务失败。前端 API 封装会自动取出 `data` 字段，因此下文“返回参数”描述的是 `data` 的内容。

分页接口的 `data` 统一为：

```json
{
  "list": [],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

### 1.3 常量枚举

- 文档类型 `type`：`txt`、`md`、`pdf`
- 向量任务状态 `status` / `vectorStatus` / `taskStatus`：`pending`、`processing`、`success`、`failed`
- 分页参数 `page` 从 1 开始，`pageSize` 默认 20

## 2. 接口清单

### 2.1 认证与用户

#### 登录

| 项目 | 内容 |
|---|---|
| 接口名称 | 用户登录 |
| 请求类型 | `POST /api/auth/login` |
| 请求参数 | JSON：`username: string`，`password: string` |
| 返回参数 | `userId: number`、`username: string`、`email: string`、`accessToken: string`、`tokenType?: string`、`expiresIn: number` |

登录成功后，前端使用 `accessToken` 作为 Bearer Token，并请求“获取当前用户信息”接口同步完整资料。

#### 获取用户信息

| 项目 | 内容 |
|---|---|
| 接口名称 | 获取当前用户信息 |
| 请求类型 | `GET /api/users/info` |
| 请求参数 | 无（需 Authorization） |
| 返回参数 | `UserInfo`：`id: number`、`username: string`、`email: string`、`isActive: boolean`、`createdAt: string`、`updatedAt: string` |

#### 退出登录

| 项目 | 内容 |
|---|---|
| 接口名称 | 退出当前登录 |
| 请求类型 | `POST /api/auth/logout` |
| 请求参数 | 无（需 Authorization） |
| 返回参数 | `null` |

#### 修改密码

| 项目 | 内容 |
|---|---|
| 接口名称 | 修改密码 |
| 请求类型 | `PUT /api/auth/password` |
| 请求参数 | JSON：`oldPassword: string`、`newPassword: string` |
| 返回参数 | `null` |

### 2.2 文档管理

#### 获取文档分页列表

| 项目 | 内容 |
|---|---|
| 接口名称 | 文档分页列表 |
| 请求类型 | `GET /api/document/list` |
| 请求参数 | Query：`page: number`、`pageSize: number`、`keyword?: string` |
| 返回参数 | `PaginatedData<DocumentInfo>` |

`DocumentInfo`：`id`、`title`、`content`、`type`、`vectorStatus`、`taskStatus`、`createdAt`、`updatedAt`，均为字符串（其中 `type` 和状态字段使用上述枚举）。

#### 获取文档详情

| 项目 | 内容 |
|---|---|
| 接口名称 | 文档详情 |
| 请求类型 | `GET /api/document/{id}` |
| 请求参数 | Path：`id: string` |
| 返回参数 | `DocumentInfo` |

#### 创建文档

| 项目 | 内容 |
|---|---|
| 接口名称 | 创建文档 |
| 请求类型 | `POST /api/document` |
| 请求参数 | JSON：`title: string`、`content: string`、`type: txt\|md\|pdf` |
| 返回参数 | 新创建的 `DocumentInfo` |

#### 更新文档

| 项目 | 内容 |
|---|---|
| 接口名称 | 更新文档 |
| 请求类型 | `PUT /api/document/{id}` |
| 请求参数 | Path：`id: string`；JSON：`title: string`、`content: string` |
| 返回参数 | `null` |

#### 删除文档

| 项目 | 内容 |
|---|---|
| 接口名称 | 删除文档 |
| 请求类型 | `DELETE /api/document/{id}` |
| 请求参数 | Path：`id: string` |
| 返回参数 | `null` |

#### 上传文档

| 项目 | 内容 |
|---|---|
| 接口名称 | 文件上传 |
| 请求类型 | `POST /api/document/upload` |
| 请求参数 | `multipart/form-data`：`file: File`；允许 `.txt`、`.md`、`.pdf`，最大 10 MB |
| 返回参数 | 新上传的 `DocumentInfo` |

#### 获取问答文档选项

| 项目 | 内容 |
|---|---|
| 接口名称 | 获取问答范围文档选项 |
| 请求类型 | `GET /api/document/options` |
| 请求参数 | 无 |
| 返回参数 | `DocumentOption[]`，每项为 `{ id: string, title: string }` |

### 2.3 向量任务

#### 启动向量化任务

| 项目 | 内容 |
|---|---|
| 接口名称 | 启动文档向量化任务 |
| 请求类型 | `POST /api/vector/task/start` |
| 请求参数 | JSON：`documentId: string` |
| 返回参数 | `{ taskId: string }` |

#### 查询向量任务状态

| 项目 | 内容 |
|---|---|
| 接口名称 | 查询向量任务状态 |
| 请求类型 | `GET /api/vector/task/status` |
| 请求参数 | Query：`taskId: string` |
| 返回参数 | `{ taskId: string, status: pending\|processing\|success\|failed, documentId: string }` |

#### 重试向量任务

| 项目 | 内容 |
|---|---|
| 接口名称 | 重试失败的向量任务 |
| 请求类型 | `POST /api/vector/task/retry` |
| 请求参数 | JSON：`taskId: string` |
| 返回参数 | `null` |

### 2.4 结构化数据

#### 获取结构化数据列表

| 项目 | 内容 |
|---|---|
| 接口名称 | 结构化数据分页列表 |
| 请求类型 | `GET /api/struct/list` |
| 请求参数 | Query：`page: number`、`pageSize: number`、`keyword?: string` |
| 返回参数 | `PaginatedData<StructDataItem>` |

`StructDataItem`：`id`、`key`、`value`、`createdAt`、`updatedAt` 为字符串；`metadata?: string`。

#### 新增结构化数据

| 项目 | 内容 |
|---|---|
| 接口名称 | 新增结构化数据条目 |
| 请求类型 | `POST /api/struct` |
| 请求参数 | JSON：`key: string`、`value: string`、`metadata?: string` |
| 返回参数 | 新创建的 `StructDataItem` |

#### 更新结构化数据

| 项目 | 内容 |
|---|---|
| 接口名称 | 更新结构化数据条目 |
| 请求类型 | `PUT /api/struct/{id}` |
| 请求参数 | Path：`id: string`；JSON：`key: string`、`value: string`、`metadata?: string` |
| 返回参数 | `null` |

#### 删除结构化数据

| 项目 | 内容 |
|---|---|
| 接口名称 | 删除单条结构化数据 |
| 请求类型 | `DELETE /api/struct/{id}` |
| 请求参数 | Path：`id: string` |
| 返回参数 | `null` |

#### 批量删除结构化数据

| 项目 | 内容 |
|---|---|
| 接口名称 | 批量删除结构化数据 |
| 请求类型 | `DELETE /api/struct/batch` |
| 请求参数 | 设计参数为 `ids: string[]`。当前前端 API 函数未将该参数编码到请求中，Mock 读取 Query `ids=id1,id2`；对接后端时建议使用 `?ids=id1,id2`，或同步修改前端实现。 |
| 返回参数 | `null` |

#### 触发结构化数据向量化

| 项目 | 内容 |
|---|---|
| 接口名称 | 结构化数据向量化入库 |
| 请求类型 | `POST /api/struct/vectorize` |
| 请求参数 | JSON：`id: string` |
| 返回参数 | `null` |

### 2.5 智能问答与会话

#### 获取会话列表

| 项目 | 内容 |
|---|---|
| 接口名称 | 会话列表 |
| 请求类型 | `GET /api/chat/session/list` |
| 请求参数 | 无 |
| 返回参数 | `ChatSession[]`；每项为 `id`、`title`、`createdAt`、`updatedAt` |

#### 新建会话

| 项目 | 内容 |
|---|---|
| 接口名称 | 新建聊天会话 |
| 请求类型 | `POST /api/chat/session/new` |
| 请求参数 | 无 |
| 返回参数 | `ChatSession` |

#### 删除会话

| 项目 | 内容 |
|---|---|
| 接口名称 | 删除聊天会话 |
| 请求类型 | `DELETE /api/chat/session` |
| 请求参数 | Query：`sessionId: string` |
| 返回参数 | `null` |

#### 流式问答

| 项目 | 内容 |
|---|---|
| 接口名称 | RAG 流式问答 |
| 请求类型 | `SSE POST /api/chat/stream` |
| 请求参数 | JSON：`sessionId: string`、`question: string`、`documentIds?: string[]` |
| 返回参数 | SSE 事件流，见下表 |

SSE 响应头为 `Content-Type: text/event-stream`，每个事件以空行分隔，`data` 为 JSON：

| 事件类型 | data 参数 | 说明 |
|---|---|---|
| `message` | `{ content: string }` | 增量回答片段，按顺序拼接 |
| `references` | `{ items: ReferenceItem[] }` | 引用文档列表 |
| `done` | `{ sessionId: string }` | 流结束 |
| `error` | `{ code: number, message: string }` | 业务错误并终止流 |

`ReferenceItem`：`documentId: string`、`title: string`、`snippet: string`、`score: number`。

## 3. 错误与鉴权

- `401`：凭证无效或过期，前端清理本地登录状态并跳转登录页。
- `403`：无权限访问，保留登录状态。
- `404`：资源不存在。
- 网络错误或业务 `code != 0`：前端统一提示 `message`。
- SSE 请求支持 `AbortController` 主动中止，默认超时时间为 5 分钟，不自动重连。

## 4. 当前实现差异

1. 认证接口已对接后端：登录为 `/api/auth/login`，当前用户信息为 `/api/users/info`。
2. `batchDeleteStructData` 当前没有把 `BatchDeleteRequest.ids` 放入 DELETE 请求；同时 Mock 期望 Query 参数 `ids=id1,id2`。建议修正前端 API 封装或与后端确认请求格式。
