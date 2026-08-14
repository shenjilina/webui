import { get, post, del } from '@/shared/utils/http'
import type { ChatSession, ChatStreamRequest } from '../types'
import { startSSEStream, type SSEStreamOptions } from '@/shared/utils/sse'

/** 会话列表 */
export function getChatSessionList(): Promise<ChatSession[]> {
  return get<ChatSession[]>('/chat/session/list')
}

/** 新建会话 */
export function createChatSession(): Promise<ChatSession> {
  return post<ChatSession>('/chat/session/new')
}

/** 删除会话 */
export function deleteChatSession(sessionId: string): Promise<void> {
  return del<void>(`/chat/session?sessionId=${sessionId}`)
}

/** 流式问答 */
export function chatStream(
  data: ChatStreamRequest,
  callbacks: Pick<SSEStreamOptions, 'onMessage' | 'onReferences' | 'onDone' | 'onError'>,
  signal?: AbortSignal,
): Promise<void> {
  return startSSEStream({
    url: '/chat/stream',
    body: data as unknown as Record<string, unknown>,
    ...callbacks,
    signal,
  })
}
