/** 会话信息 */
export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

/** 流式问答请求 */
export interface ChatStreamRequest {
  sessionId: string
  question: string
  documentIds?: string[]
}

/** 溯源引用 */
export interface ReferenceItem {
  documentId: string
  title: string
  snippet: string
  score: number
}
