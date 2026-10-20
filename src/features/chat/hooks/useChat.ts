import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatStream } from '../api'
import { useChatStore } from '../store/chatStore'
import { useUserStore } from '@/features/auth/store/userStore'
import type { ChatMessage } from '../types'
export type { ChatMessage } from '../types'
let activeController: AbortController | null = null
export function stopChatStream() {
  activeController?.abort()
  activeController = null
  const store = useChatStore.getState()
  store.setMessages((messages) =>
    messages.map((message) =>
      message.isStreaming
        ? {
            ...message,
            isStreaming: false,
            error: '已停止生成；服务端可能仍保存记录，请刷新历史确认'
          }
        : message
    )
  )
  store.setIsStreaming(false)
}
if (typeof window !== 'undefined') {
  const clear = () => {
    stopChatStream()
    useChatStore.getState().reset()
  }
  window.addEventListener('auth:unauthorized', clear)
  window.addEventListener('auth:logout', clear)
}
export function useChat() {
  const state = useChatStore()
  const client = useQueryClient()
  const sendMessage = useCallback(
    async (question: string, knowledgeBaseId: number, topK = 4) => {
      const userId = useUserStore.getState().userInfo?.id
      const store = useChatStore.getState()
      if (!userId || store.isStreaming || store.isDeleting) return
      question = question.trim()
      if (!question || question.length > 2000 || !Number.isInteger(topK) || topK < 1 || topK > 20) {
        toast.error('问题需为 1–2000 字，TopK 需为 1–20')
        return
      }
      if (
        !store.currentSessionId ||
        store.knowledgeBaseId !== knowledgeBaseId ||
        !store.conversationSessionId
      )
        store.newSession(knowledgeBaseId)
      const session = useChatStore.getState()
      const sessionId = session.currentSessionId
      const assistantId = crypto.randomUUID()
      session.setMessages((messages) => [
        ...messages,
        { id: crypto.randomUUID(), role: 'user', content: question },
        { id: assistantId, role: 'assistant', content: '', isStreaming: true }
      ])
      session.setIsStreaming(true)
      const controller = new AbortController()
      activeController = controller
      const update = (fn: (message: ChatMessage) => ChatMessage) => {
        if (controller.signal.aborted || useChatStore.getState().currentSessionId !== sessionId)
          return
        useChatStore
          .getState()
          .setMessages((messages) =>
            messages.map((message) => (message.id === assistantId ? fn(message) : message))
          )
      }
      try {
        await chatStream(
          {
            userId,
            knowledgeBaseId,
            question,
            topK,
            conversation_session_id: session.conversationSessionId!
          },
          {
            onMessage: (content) =>
              update((message) => ({ ...message, content: message.content + content })),
            onReferences: (references) => update((message) => ({ ...message, references })),
            onError: (error) => {
              if (controller.signal.aborted) return
              update((message) => ({ ...message, error }))
              toast.error(error)
            },
            onDone: (result) =>
              update((message) => ({
                ...message,
                content: result.answer || message.content,
                conversationId: result.conversationId ?? undefined,
                isStreaming: false
              }))
          },
          controller.signal
        )
      } finally {
        if (activeController === controller) {
          update((message) => ({ ...message, isStreaming: false }))
          useChatStore.getState().setIsStreaming(false)
          activeController = null
        }
        if (useUserStore.getState().userInfo?.id === userId)
          void client.invalidateQueries({ queryKey: ['chat-sessions', userId] })
      }
    },
    [client]
  )
  return { ...state, sendMessage, stopStreaming: stopChatStream }
}
