export interface ConversationRecord {
  id: number
  userId: number
  knowledgeBaseId: number
  question: string
  answer: string
  sourceDocumentIds: number[]
  sessionId: string | null
  status: 'generated' | 'failed'
  createdAt: string
}
export interface ChatSession {
  id: string
  sessionId: string | null
  knowledgeBaseId: number
  title: string
  records: ConversationRecord[]
  createdAt: string
  updatedAt: string
}
export interface ChatStreamRequest {
  userId: number
  knowledgeBaseId: number
  question: string
  topK?: number
  conversation_session_id?: string
}
export interface ReferenceItem {
  documentId: string
  title: string
  snippet: string
  score: number | null
}
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: ReferenceItem[]
  sourceDocumentIds?: number[]
  conversationId?: number
  isStreaming?: boolean
  error?: string
}
