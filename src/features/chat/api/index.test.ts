import { beforeEach, expect, it, vi } from 'vitest'
import { chatStream, deleteConversation, getConversation, listConversations } from './index'
import { del, post } from '@/shared/utils/http'
import { startSSEStream } from '@/shared/utils/sse'
vi.mock('@/shared/utils/http', () => ({ post: vi.fn(), del: vi.fn() }))
vi.mock('@/shared/utils/sse', () => ({ startSSEStream: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
it('uses record-based history and DELETE body, not a session resource', () => {
  listConversations(7)
  expect(post).toHaveBeenCalledWith('/conversations/list', { userId: 7 })
  getConversation(12)
  expect(post).toHaveBeenCalledWith('/conversations/get_conversation', { conversationId: 12 })
  deleteConversation(12)
  expect(del).toHaveBeenCalledWith('/conversations', { conversationId: 12 })
})
it('sends documented stream fields and cancellation signal unchanged', () => {
  const body = {
    userId: 7,
    knowledgeBaseId: 8,
    question: '问题',
    topK: 4,
    conversation_session_id: 'uuid'
  }
  const callbacks = { onMessage: vi.fn(), onReferences: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  const signal = new AbortController().signal
  chatStream(body, callbacks, signal)
  expect(startSSEStream).toHaveBeenCalledWith({
    url: '/conversations/ask/stream',
    body,
    ...callbacks,
    signal
  })
})
