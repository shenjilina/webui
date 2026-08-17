import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getChatSessionList, createChatSession, deleteChatSession } from '../api'
import { useChatStore } from '../store/chatStore'

/**
 * 会话管理：列表查询、新建、删除、切换。
 * 会话选中状态写入全局 chatStore，供布局层会话面板与聊天页共享。
 */
export function useChatSessions() {
  const queryClient = useQueryClient()
  const currentSessionId = useChatStore((s) => s.currentSessionId)

  const sessionsQuery = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => getChatSessionList(),
  })

  const createSessionMutation = useMutation({
    mutationFn: () => createChatSession(),
    onSuccess: (session) => {
      useChatStore.getState().resetConversation(session.id)
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: (_, deletedId) => {
      if (useChatStore.getState().currentSessionId === deletedId) {
        useChatStore.getState().resetConversation()
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      toast.success('会话已删除')
    },
  })

  const switchSession = useCallback((sessionId: string) => {
    useChatStore.getState().resetConversation(sessionId)
  }, [])

  const newSession = useCallback(() => {
    createSessionMutation.mutate()
  }, [createSessionMutation])

  return {
    sessions: sessionsQuery.data ?? [],
    currentSessionId,
    switchSession,
    newSession,
    deleteSession: deleteSessionMutation.mutate,
  }
}
