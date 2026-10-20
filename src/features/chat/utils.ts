import type { ChatMessage, ChatSession, ConversationRecord } from './types'
export function groupConversations(records: ConversationRecord[]): ChatSession[] {
  const groups = new Map<string, ChatSession>()
  for (const record of [...records].sort((a, b) => a.id - b.id)) {
    const id = record.knowledgeBaseId + ':' + (record.sessionId ?? 'record-' + record.id)
    const existing = groups.get(id)
    if (existing) {
      existing.records.push(record)
      existing.updatedAt = record.createdAt
    } else
      groups.set(id, {
        id,
        sessionId: record.sessionId,
        knowledgeBaseId: record.knowledgeBaseId,
        title: record.question,
        records: [record],
        createdAt: record.createdAt,
        updatedAt: record.createdAt
      })
  }
  return [...groups.values()].sort(
    (a, b) => b.records[b.records.length - 1].id - a.records[a.records.length - 1].id
  )
}
export function conversationMessages(records: ConversationRecord[]): ChatMessage[] {
  return [...records]
    .sort((a, b) => a.id - b.id)
    .flatMap((record) => [
      { id: 'user-' + record.id, role: 'user' as const, content: record.question },
      {
        id: 'assistant-' + record.id,
        role: 'assistant' as const,
        content: record.answer,
        conversationId: record.id,
        sourceDocumentIds: record.sourceDocumentIds,
        ...(record.status === 'failed' ? { error: '该次问答未成功，可重新提问' } : {})
      }
    ])
}
