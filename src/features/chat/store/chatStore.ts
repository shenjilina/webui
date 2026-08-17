import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface ChatState {
  /** 当前会话 ID */
  currentSessionId: string | null
  /** 当前会话的消息列表 */
  messages: ChatMessage[]
  /** 是否正在流式输出 */
  isStreaming: boolean

  setCurrentSessionId: (id: string | null) => void
  /** 支持直接传数组或基于前值的更新函数（与 useState 语义一致） */
  setMessages: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void
  setIsStreaming: (streaming: boolean) => void
  /** 重置对话（切换/新建会话时调用） */
  resetConversation: (sessionId?: string | null) => void
}

/**
 * 聊天全局状态：会话选择与对话内容存于 store，
 * 供布局层会话面板与聊天页共享，跨页面切换不丢失。
 */
export const useChatStore = create<ChatState>()((set) => ({
  currentSessionId: null,
  messages: [],
  isStreaming: false,

  setCurrentSessionId: (id) => set({ currentSessionId: id }),

  setMessages: (updater) =>
    set((state) => ({
      messages: typeof updater === 'function' ? updater(state.messages) : updater,
    })),

  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  resetConversation: (sessionId = null) => set({ currentSessionId: sessionId, messages: [] }),
}))
