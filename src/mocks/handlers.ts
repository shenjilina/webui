import { http, HttpResponse, delay } from 'msw'
import type { LoginRequest, ChangePasswordRequest } from '@/features/auth/types'
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  VectorTaskStartResponse,
  VectorTaskStatusResponse,
} from '@/features/document/types'
import type { CreateStructDataRequest, UpdateStructDataRequest } from '@/features/struct/types'
import type { ChatStreamRequest } from '@/features/chat/types'
import type { VectorTaskStatusType, DocumentTypeType } from '@/shared/utils/constants'
import { mockUser, MOCK_USERNAME, MOCK_PASSWORD, MOCK_TOKEN } from './data/auth'
import { mockDocuments } from './data/document'
import { mockStructData } from './data/struct'
import { mockChatSessions, mockAnswerChunks, mockReferences } from './data/chat'

/* ------------------- 通用工具 ------------------- */

/** 包装成功响应（符合 ApiResponse 结构：code=0） */
function ok<T>(data: T) {
  return HttpResponse.json({ code: 0, message: 'success', data })
}

/** 包装业务错误响应 */
function fail(message: string, code = 1) {
  return HttpResponse.json({ code, message, data: null })
}

/** 鉴权检查：缺少 Bearer Token 时返回 401 */
function unauthorizedIfNoAuth(request: Request): Response | null {
  if (!request.headers.get('Authorization')) {
    return HttpResponse.json({ code: 401, message: '未授权', data: null }, { status: 401 })
  }
  return null
}

/** 模拟网络延迟 */
const NET_DELAY = 300

/** 自增 ID 生成器 */
let idSeed = 100
function nextId(prefix: string) {
  idSeed += 1
  return `${prefix}-${String(idSeed).padStart(3, '0')}`
}

/* ------------------- 向量任务状态模拟 ------------------- */

/** taskId -> { documentId, polls }，轮询推进状态：pending → processing → success */
const vectorTaskStates = new Map<string, { documentId: string; polls: number }>()

/* ------------------- Handlers ------------------- */

export const handlers = [
  /* ========== 登录认证 ========== */

  http.post('/api/auth/login', async ({ request }) => {
    await delay(NET_DELAY)
    const body = (await request.json()) as LoginRequest
    if (body.username === MOCK_USERNAME && body.password === MOCK_PASSWORD) {
      return ok({
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        accessToken: MOCK_TOKEN,
        tokenType: 'bearer',
        expiresIn: 3600,
      })
    }
    return fail('用户名或密码错误')
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    return ok(null)
  }),

  http.get('/api/users/info', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    return ok(mockUser)
  }),

  http.put('/api/auth/password', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    const body = (await request.json()) as ChangePasswordRequest
    if (!body.oldPassword || !body.newPassword) {
      return fail('密码不能为空')
    }
    if (body.newPassword.length < 6) {
      return fail('新密码长度不能少于 6 位')
    }
    return ok(null)
  }),

  /* ========== 文档管理 ========== */

  http.get('/api/document/list', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 20
    const keyword = url.searchParams.get('keyword') || ''

    const filtered = keyword
      ? mockDocuments.filter((d) => d.title.includes(keyword) || d.content.includes(keyword))
      : mockDocuments
    const list = filtered.slice((page - 1) * pageSize, page * pageSize)

    return ok({ list, total: filtered.length, page, pageSize })
  }),

  // 静态路由必须优先于 /api/document/:id 注册
  http.get('/api/document/options', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    return ok(mockDocuments.map((d) => ({ id: d.id, title: d.title })))
  }),

  http.post('/api/document/upload', async ({ request }) => {
    await delay(NET_DELAY * 2)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return fail('未接收到文件')
    }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const now = new Date().toISOString()
    const doc = {
      id: nextId('doc'),
      title: file.name.replace(/\.[^.]+$/, ''),
      content: `[mock] 上传文件 ${file.name} 的内容占位文本。`,
      type: (ext === 'md' || ext === 'pdf' ? ext : 'txt') as DocumentTypeType,
      vectorStatus: 'pending' as const,
      taskStatus: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }
    mockDocuments.unshift(doc)
    return ok(doc)
  }),

  http.post('/api/document', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const body = (await request.json()) as CreateDocumentRequest
    if (!body.title?.trim()) {
      return fail('文档标题不能为空')
    }
    const now = new Date().toISOString()
    const doc = {
      id: nextId('doc'),
      title: body.title,
      content: body.content,
      type: body.type,
      vectorStatus: 'pending' as const,
      taskStatus: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }
    mockDocuments.unshift(doc)
    return ok(doc)
  }),

  http.get('/api/document/:id', async ({ params, request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const doc = mockDocuments.find((d) => d.id === params.id)
    if (!doc) {
      return HttpResponse.json({ code: 404, message: '文档不存在', data: null }, { status: 404 })
    }
    return ok(doc)
  }),

  http.put('/api/document/:id', async ({ params, request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const doc = mockDocuments.find((d) => d.id === params.id)
    if (!doc) {
      return HttpResponse.json({ code: 404, message: '文档不存在', data: null }, { status: 404 })
    }
    const body = (await request.json()) as UpdateDocumentRequest
    doc.title = body.title
    doc.content = body.content
    doc.updatedAt = new Date().toISOString()
    return ok(null)
  }),

  http.delete('/api/document/:id', async ({ params, request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const index = mockDocuments.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ code: 404, message: '文档不存在', data: null }, { status: 404 })
    }
    mockDocuments.splice(index, 1)
    return ok(null)
  }),

  /* ========== 向量化任务 ========== */

  http.post('/api/vector/task/start', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const body = (await request.json()) as { documentId: string }
    const doc = mockDocuments.find((d) => d.id === body.documentId)
    if (!doc) {
      return fail('文档不存在')
    }
    const taskId = nextId('task')
    vectorTaskStates.set(taskId, { documentId: doc.id, polls: 0 })
    doc.taskStatus = 'pending'
    doc.vectorStatus = 'pending'
    const data: VectorTaskStartResponse = { taskId }
    return ok(data)
  }),

  http.get('/api/vector/task/status', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId') || ''
    const task = vectorTaskStates.get(taskId)
    if (!task) {
      return fail('任务不存在')
    }

    // 轮询推进状态：第 1 次 pending → 第 2 次 processing → 第 3 次起 success
    task.polls += 1
    let status: VectorTaskStatusType
    if (task.polls <= 1) {
      status = 'pending'
    } else if (task.polls === 2) {
      status = 'processing'
    } else {
      status = 'success'
    }

    const doc = mockDocuments.find((d) => d.id === task.documentId)
    if (doc) {
      doc.taskStatus = status
      doc.vectorStatus = status
    }

    const data: VectorTaskStatusResponse = { taskId, status, documentId: task.documentId }
    return ok(data)
  }),

  http.post('/api/vector/task/retry', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const body = (await request.json()) as { taskId: string }
    const task = vectorTaskStates.get(body.taskId)
    if (task) {
      task.polls = 0
    }
    return ok(null)
  }),

  /* ========== 结构化数据 ========== */

  http.get('/api/struct/list', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 20
    const keyword = url.searchParams.get('keyword') || ''

    const filtered = keyword
      ? mockStructData.filter((s) => s.key.includes(keyword) || s.value.includes(keyword))
      : mockStructData
    const list = filtered.slice((page - 1) * pageSize, page * pageSize)

    return ok({ list, total: filtered.length, page, pageSize })
  }),

  http.post('/api/struct', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const body = (await request.json()) as CreateStructDataRequest
    if (!body.key?.trim() || !body.value?.trim()) {
      return fail('键和值不能为空')
    }
    if (mockStructData.some((s) => s.key === body.key)) {
      return fail(`键 "${body.key}" 已存在`)
    }
    const now = new Date().toISOString()
    const item = {
      id: nextId('struct'),
      key: body.key,
      value: body.value,
      metadata: body.metadata,
      createdAt: now,
      updatedAt: now,
    }
    mockStructData.unshift(item)
    return ok(item)
  }),

  http.post('/api/struct/vectorize', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    const body = (await request.json()) as { id: string }
    if (!mockStructData.some((s) => s.id === body.id)) {
      return fail('条目不存在')
    }
    return ok(null)
  }),

  http.delete('/api/struct/batch', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const ids = url.searchParams.get('ids')?.split(',').filter(Boolean) ?? []
    for (let i = mockStructData.length - 1; i >= 0; i--) {
      if (ids.includes(mockStructData[i].id)) {
        mockStructData.splice(i, 1)
      }
    }
    return ok(null)
  }),

  http.put('/api/struct/:id', async ({ params, request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const item = mockStructData.find((s) => s.id === params.id)
    if (!item) {
      return HttpResponse.json({ code: 404, message: '条目不存在', data: null }, { status: 404 })
    }
    const body = (await request.json()) as UpdateStructDataRequest
    item.key = body.key
    item.value = body.value
    item.metadata = body.metadata
    item.updatedAt = new Date().toISOString()
    return ok(null)
  }),

  http.delete('/api/struct/:id', async ({ params, request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const index = mockStructData.findIndex((s) => s.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ code: 404, message: '条目不存在', data: null }, { status: 404 })
    }
    mockStructData.splice(index, 1)
    return ok(null)
  }),

  /* ========== 智能问答 ========== */

  http.get('/api/chat/session/list', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError
    return ok(mockChatSessions)
  }),

  http.post('/api/chat/session/new', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const now = new Date().toISOString()
    const session = {
      id: nextId('session'),
      title: '新的会话',
      createdAt: now,
      updatedAt: now,
    }
    mockChatSessions.unshift(session)
    return ok(session)
  }),

  http.delete('/api/chat/session', async ({ request }) => {
    await delay(NET_DELAY)
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    const index = mockChatSessions.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      mockChatSessions.splice(index, 1)
    }
    return ok(null)
  }),

  /** SSE 流式问答 mock：分片推送 message → references → done */
  http.post('/api/chat/stream', async ({ request }) => {
    const authError = unauthorizedIfNoAuth(request)
    if (authError) return authError

    const body = (await request.json()) as ChatStreamRequest
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const push = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        // 模拟首 token 延迟
        await delay(500)
        for (const chunk of mockAnswerChunks) {
          push('message', { content: chunk })
          await delay(100)
        }

        // 溯源引用
        push('references', { items: mockReferences })
        await delay(150)

        // 结束事件
        push('done', { sessionId: body.sessionId })
        controller.close()
      },
    })

    return new HttpResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }),
]
