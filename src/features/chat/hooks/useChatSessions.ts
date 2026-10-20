import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listConversations, deleteConversation } from '../api'
import { groupConversations } from '../utils'
import { useChatStore } from '../store/chatStore'
import { useUserStore } from '@/features/auth/store/userStore'
export function useChatSessions() {
  const client = useQueryClient()
  const userId = useUserStore((state) => state.userInfo?.id)
  const currentSessionId = useChatStore((state) => state.currentSessionId)
  const isDeleting = useChatStore((state) => state.isDeleting)
  const isStreaming = useChatStore((state) => state.isStreaming)
  const query = useQuery({
    queryKey: ['chat-sessions', userId],
    queryFn: () => listConversations(userId!),
    enabled: !!userId
  })
  const sessions = groupConversations(query.data ?? [])
  const deletion = useMutation({
    mutationFn: async (sessionId: string) => {
      if (useChatStore.getState().isStreaming || useChatStore.getState().isDeleting)
        throw new Error('请等待当前操作完成')
      useChatStore.getState().setIsDeleting(true)
      const session = sessions.find((item) => item.id === sessionId)
      if (!session) return
      // A session is a group of records, not a server-side session resource.
      for (const record of session.records) await deleteConversation(record.id)
    },
    onSuccess: (_, sessionId) => {
      if (useChatStore.getState().currentSessionId === sessionId) useChatStore.getState().reset()
      toast.success('会话记录已删除')
    },
    onError: () => toast.error('删除未全部完成，已刷新历史，请检查剩余记录后重试'),
    onSettled: (_, error, sessionId) => {
      useChatStore.getState().setIsDeleting(false)
      if (error && useChatStore.getState().currentSessionId === sessionId)
        useChatStore.getState().reset()
      void client.invalidateQueries({ queryKey: ['chat-sessions', userId] })
    }
  })
  return {
    sessions,
    currentSessionId,
    isStreaming,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isDeleting,
    switchSession: (id: string) => {
      const session = sessions.find((item) => item.id === id)
      if (session) useChatStore.getState().selectSession(session)
    },
    newSession: () => useChatStore.getState().newSession(),
    deleteSession: deletion.mutate
  }
}
