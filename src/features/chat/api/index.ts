import { post, del } from '@/shared/utils/http'
import { startSSEStream, type SSEStreamOptions } from '@/shared/utils/sse'
import type { ChatStreamRequest, ConversationRecord } from '../types'
export function listConversations(userId: number): Promise<ConversationRecord[]> {
  return post('/conversations/list', { userId })
}
export function getConversation(conversationId: number): Promise<ConversationRecord> {
  return post('/conversations/get_conversation', { conversationId })
}
export function deleteConversation(
  conversationId: number
): Promise<{ conversationId: number; deleted: boolean }> {
  return del('/conversations', { conversationId })
}
export function chatStream(
  data: ChatStreamRequest,
  callbacks: Pick<SSEStreamOptions, 'onMessage' | 'onReferences' | 'onDone' | 'onError'>,
  signal?: AbortSignal
): Promise<void> {
  return startSSEStream({ url: '/conversations/ask/stream', body: data, ...callbacks, signal })
}
