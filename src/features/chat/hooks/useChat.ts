import { useCallback } from 'react'
import { toast } from 'sonner'
import { chatStream } from '../api'
import { useChatStore } from '../store/chatStore'
import type { ChatMessage } from '../types'

// 模块级流式控制器：聊天页卸载后流式请求继续进行，结果仍写入全局 store
let abortController: AbortController | null = null

/**
 * 聊天对话逻辑：消息收发与流式控制。
 * 对话状态存于全局 chatStore，跨页面切换不丢失。
 */
export function useChat() {
  const currentSessionId = useChatStore((s) => s.currentSessionId)
  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)

  const sendMessage = useCallback(
    async (question: string, documentIds?: string[]) => {
      const store = useChatStore.getState()
      if (!store.currentSessionId || store.isStreaming) return

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question,
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        isStreaming: true,
      }

      store.setMessages((prev) => [...prev, userMsg, assistantMsg])
      store.setIsStreaming(true)

      const controller = new AbortController()
      abortController = controller

      await chatStream(
        {
          sessionId: store.currentSessionId,
          question,
          documentIds,
        },
        {
          onMessage: (content) => {
            useChatStore.getState().setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, content: last.content + content }]
            })
          },
          onReferences: (items) => {
            useChatStore.getState().setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, references: items }]
            })
          },
          onDone: () => {
            const s = useChatStore.getState()
            s.setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, isStreaming: false }]
            })
            s.setIsStreaming(false)
            abortController = null
          },
          onError: (message) => {
            const s = useChatStore.getState()
            s.setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content || `问答异常: ${message}`, isStreaming: false },
              ]
            })
            s.setIsStreaming(false)
            abortController = null
            toast.error(message)
          },
        },
        controller.signal,
      )
    },
    [currentSessionId, isStreaming],
  )

  const stopStreaming = useCallback(() => {
    abortController?.abort()
    abortController = null
    const store = useChatStore.getState()
    store.setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      return [...prev.slice(0, -1), { ...last, isStreaming: false }]
    })
    store.setIsStreaming(false)
  }, [])

  return {
    currentSessionId,
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
  }
}
