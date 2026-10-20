import { create } from 'zustand'
import type { ChatMessage, ChatSession } from '../types'
import { conversationMessages } from '../utils'
interface ChatState {
  currentSessionId: string | null
  conversationSessionId: string | null
  knowledgeBaseId: number | null
  messages: ChatMessage[]
  isStreaming: boolean
  isDeleting: boolean
  setIsDeleting: (value: boolean) => void
  setMessages: (updater: ChatMessage[] | ((previous: ChatMessage[]) => ChatMessage[])) => void
  setIsStreaming: (value: boolean) => void
  newSession: (knowledgeBaseId?: number | null) => void
  selectSession: (session: ChatSession) => void
  reset: () => void
}
const empty = {
  currentSessionId: null,
  conversationSessionId: null,
  knowledgeBaseId: null,
  messages: [] as ChatMessage[],
  isStreaming: false,
  isDeleting: false
}
export const useChatStore = create<ChatState>()((set, get) => ({
  ...empty,
  setMessages: (updater) =>
    set((state) => ({
      messages: typeof updater === 'function' ? updater(state.messages) : updater
    })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  newSession: (knowledgeBaseId = get().knowledgeBaseId) => {
    if (get().isStreaming || get().isDeleting) return
    const sessionId = crypto.randomUUID()
    set({
      ...empty,
      knowledgeBaseId,
      conversationSessionId: sessionId,
      currentSessionId: knowledgeBaseId === null ? sessionId : knowledgeBaseId + ':' + sessionId
    })
  },
  selectSession: (session) => {
    if (!get().isStreaming && !get().isDeleting)
      set({
        currentSessionId: session.id,
        conversationSessionId: session.sessionId,
        knowledgeBaseId: session.knowledgeBaseId,
        messages: conversationMessages(session.records)
      })
  },
  reset: () => set({ ...empty })
}))
