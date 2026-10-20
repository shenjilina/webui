import { describe, expect, it } from 'vitest'
import { groupConversations, conversationMessages } from './utils'
import type { ConversationRecord } from './types'
const row = (id: number, kb = 1, session: string | null = 's'): ConversationRecord => ({
  id,
  userId: 1,
  knowledgeBaseId: kb,
  sessionId: session,
  question: '问题' + id,
  answer: '回答' + id,
  sourceDocumentIds: [12],
  status: 'generated',
  createdAt: '2026-10-17 12:00:00'
})
describe('conversation history', () => {
  it('groups by both knowledge base and session and isolates legacy records', () => {
    const sessions = groupConversations([
      row(2),
      row(1),
      row(3, 2),
      row(4, 1, null),
      row(5, 1, null)
    ])
    expect(sessions).toHaveLength(4)
    expect(
      sessions.find((s) => s.knowledgeBaseId === 1 && s.sessionId === 's')?.records.map((r) => r.id)
    ).toEqual([1, 2])
  })
  it('restores both question and answer, without inventing source snippets', () => {
    const messages = conversationMessages([row(1)])
    expect(messages.map((m) => m.role)).toEqual(['user', 'assistant'])
    expect(messages[1]).toMatchObject({
      content: '回答1',
      conversationId: 1,
      sourceDocumentIds: [12]
    })
    expect(messages[1].references).toBeUndefined()
  })
})
