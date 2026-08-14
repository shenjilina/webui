import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getChatSessionList, createChatSession, deleteChatSession, chatStream } from '../api'
import type { ReferenceItem } from '../types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  references?: ReferenceItem[]
  isStreaming?: boolean
}

export function useChat() {
  const queryClient = useQueryClient()
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sessionsQuery = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => getChatSessionList(),
  })

  const createSessionMutation = useMutation({
    mutationFn: () => createChatSession(),
    onSuccess: (session) => {
      setCurrentSessionId(session.id)
      setMessages([])
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: (_, deletedId) => {
      if (currentSessionId === deletedId) {
        setCurrentSessionId(null)
        setMessages([])
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      toast.success('会话已删除')
    },
  })

  const sendMessage = useCallback(
    async (question: string, documentIds?: string[]) => {
      if (!currentSessionId || isStreaming) return

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

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      await chatStream(
        {
          sessionId: currentSessionId,
          question,
          documentIds,
        },
        {
          onMessage: (content) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, content: last.content + content }]
            })
          },
          onReferences: (items) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, references: items }]
            })
          },
          onDone: () => {
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [...prev.slice(0, -1), { ...last, isStreaming: false }]
            })
            setIsStreaming(false)
            abortRef.current = null
          },
          onError: (message) => {
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (!last || last.role !== 'assistant') return prev
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content || `问答异常: ${message}`, isStreaming: false },
              ]
            })
            setIsStreaming(false)
            abortRef.current = null
            toast.error(message)
          },
        },
        controller.signal,
      )
    },
    [currentSessionId, isStreaming],
  )

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== 'assistant') return prev
      return [...prev.slice(0, -1), { ...last, isStreaming: false }]
    })
    setIsStreaming(false)
  }, [])

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
    setMessages([])
  }, [])

  const newSession = useCallback(() => {
    createSessionMutation.mutate()
  }, [createSessionMutation])

  return {
    sessions: sessionsQuery.data ?? [],
    currentSessionId,
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    switchSession,
    newSession,
    deleteSession: deleteSessionMutation.mutate,
  }
}
