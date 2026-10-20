import { beforeEach, expect, it } from 'vitest'
import { useChatStore } from './chatStore'
import { groupConversations } from '../utils'
beforeEach(() => useChatStore.getState().reset())
it('creates local UUID sessions, isolates knowledge bases and blocks switching during generation', () => {
  useChatStore.getState().newSession(7)
  const initial = useChatStore.getState().currentSessionId
  expect(useChatStore.getState().conversationSessionId).toMatch(/^[0-9a-f-]{36}$/)
  useChatStore.getState().setIsStreaming(true)
  useChatStore.getState().newSession(8)
  expect(useChatStore.getState().currentSessionId).toBe(initial)
  useChatStore.getState().setIsStreaming(false)
  useChatStore.getState().newSession(8)
  expect(useChatStore.getState().knowledgeBaseId).toBe(8)
  expect(useChatStore.getState().currentSessionId).not.toBe(initial)
  expect(useChatStore.getState().messages).toEqual([])
})
it('restores question and answer while preventing streaming history replacement', () => {
  const [session] = groupConversations([
    {
      id: 1,
      userId: 2,
      knowledgeBaseId: 3,
      question: 'Q',
      answer: 'A',
      sourceDocumentIds: [4],
      status: 'failed',
      sessionId: null,
      createdAt: '2026-10-17'
    }
  ])
  useChatStore.getState().newSession(9)
  useChatStore.getState().setIsStreaming(true)
  useChatStore.getState().selectSession(session)
  expect(useChatStore.getState().knowledgeBaseId).toBe(9)
  useChatStore.getState().setIsStreaming(false)
  useChatStore.getState().selectSession(session)
  expect(useChatStore.getState().messages.map((message) => message.content)).toEqual(['Q', 'A'])
  useChatStore.getState().reset()
  expect(useChatStore.getState()).toMatchObject({
    messages: [],
    currentSessionId: null,
    knowledgeBaseId: null,
    isStreaming: false
  })
})

it('blocks new sessions and history switching while records are being deleted', () => {
  useChatStore.getState().newSession(7)
  const initial = useChatStore.getState().currentSessionId
  useChatStore.getState().setIsDeleting(true)
  useChatStore.getState().newSession(8)
  expect(useChatStore.getState().currentSessionId).toBe(initial)
  expect(useChatStore.getState().isDeleting).toBe(true)
  useChatStore.getState().setIsDeleting(false)
  useChatStore.getState().newSession(8)
  expect(useChatStore.getState().knowledgeBaseId).toBe(8)
})
