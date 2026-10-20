import { http, HttpResponse } from 'msw'
import type { ChangePasswordRequest, LoginRequest } from '@/features/auth/types'
import type { ChatStreamRequest, ConversationRecord } from '@/features/chat/types'
import { mockUser, MOCK_USERNAME, MOCK_PASSWORD, MOCK_TOKEN } from './data/auth'
import { mockChunks, mockDocuments, mockFiles, mockKnowledgeBase } from './data/document'

const ok = <T>(data: T) => HttpResponse.json({ code: 0, message: 'success', data })
const fail = (message: string, status = 400) =>
  HttpResponse.json({ code: status, message, data: null }, { status })
const records: ConversationRecord[] = []
function page<T>(items: T[], body: { page?: number; pageSize?: number }) {
  const page = body.page ?? 1
  const pageSize = Math.min(100, body.pageSize ?? 20)
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total: items.length,
    page,
    pageSize
  }
}
function auth(request: Request) {
  return request.headers.get('Authorization') === 'Bearer ' + MOCK_TOKEN
    ? null
    : fail('演示登录已失效', 401)
}
/** Read-only UI demo. Unsupported writes are blocked rather than sent to the live backend. */
export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    return body.username === MOCK_USERNAME && body.password === MOCK_PASSWORD
      ? ok({
          userId: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          accessToken: MOCK_TOKEN,
          tokenType: 'bearer',
          expiresIn: 3600
        })
      : fail('演示账号：admin / admin123', 401)
  }),
  http.post('/api/auth/logout', () => ok(null)),
  http.get('/api/users/info', ({ request }) => auth(request) ?? ok(mockUser)),
  http.post('/api/auth/change-password', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as ChangePasswordRequest
    return body.oldPassword === MOCK_PASSWORD && body.newPassword.length >= 8
      ? ok(null)
      : fail('旧密码不正确或新密码不足 8 位')
  }),
  http.post('/api/knowledge-bases/list', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as {
      query?: string
      status?: string
      page?: number
      pageSize?: number
    }
    const items =
      (!body.query || mockKnowledgeBase.name.includes(body.query)) &&
      (!body.status || body.status === 'ACTIVE')
        ? [mockKnowledgeBase]
        : []
    return ok(page(items, body))
  }),
  http.post('/api/knowledge-bases/detail', ({ request }) => auth(request) ?? ok(mockKnowledgeBase)),
  http.post(
    '/api/knowledge-bases/summary',
    ({ request }) =>
      auth(request) ??
      ok({
        knowledgeBase: mockKnowledgeBase,
        fileCount: 1,
        validDocumentCount: 1,
        failedDocumentCount: 0
      })
  ),
  http.post('/api/files/list', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as { fileStatus?: string; page?: number; pageSize?: number }
    return ok(
      page(
        mockFiles.filter((file) => !body.fileStatus || file.status === body.fileStatus),
        body
      )
    )
  }),
  http.post('/api/files/detail', ({ request }) => auth(request) ?? ok(mockFiles[0])),
  http.post('/api/documents/list', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as {
      knowledgeBaseId: number
      parseStatus?: string
      page?: number
      pageSize?: number
    }
    return ok(
      page(
        mockDocuments.filter(
          (doc) =>
            doc.knowledgeBaseId === body.knowledgeBaseId &&
            (!body.parseStatus || doc.parseStatus === body.parseStatus)
        ),
        body
      )
    )
  }),
  http.post('/api/documents/detail', ({ request }) => auth(request) ?? ok(mockDocuments[0])),
  http.post('/api/documents/chunks', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as { documentId: number; page?: number; pageSize?: number }
    return ok(page(body.documentId === 1 ? mockChunks : [], body))
  }),
  http.post('/api/conversations/list', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as { userId: number }
    return ok(records.filter((record) => record.userId === body.userId))
  }),
  http.post('/api/conversations/get_conversation', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as { conversationId: number }
    return ok(records.find((record) => record.id === body.conversationId) ?? null)
  }),
  http.delete('/api/conversations', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as { conversationId: number }
    const index = records.findIndex((record) => record.id === body.conversationId)
    if (index < 0) return fail('记录不存在', 404)
    records.splice(index, 1)
    return ok({ conversationId: body.conversationId, deleted: true })
  }),
  http.post('/api/conversations/ask/stream', async ({ request }) => {
    const error = auth(request)
    if (error) return error
    const body = (await request.json()) as ChatStreamRequest
    const answer = '这是本地 Mock 演示回答，并非后端模型生成。真实问答请关闭 VITE_ENABLE_MOCK。'
    const id = Math.max(0, ...records.map((record) => record.id)) + 1
    records.push({
      id,
      userId: body.userId,
      knowledgeBaseId: body.knowledgeBaseId,
      question: body.question,
      answer,
      sourceDocumentIds: [1],
      sessionId: body.conversation_session_id ?? null,
      status: 'generated',
      createdAt: new Date().toISOString()
    })
    const events = [
      {
        event: 'sources',
        source_documents: [
          {
            page_content: mockChunks[0].content,
            metadata: { document_id: 1, title: '演示文档' },
            score: 0.2
          }
        ]
      },
      { event: 'chunk', content: answer },
      { event: 'done', answer, success: true, conversation_id: id }
    ]
    return new HttpResponse(
      events.map((event) => 'data: ' + JSON.stringify(event) + '\n\n').join(''),
      { headers: { 'Content-Type': 'text/event-stream' } }
    )
  }),
  http.all('/api/*', () =>
    fail('Mock 仅支持只读预览和问答演示；写入操作请关闭 Mock 后连接真实后端', 501)
  )
]
