import { useChat } from '../hooks/useChat'
import { ChatInterface } from '../components/ChatInterface'

/**
 * 智能问答页：仅负责对话主区域。
 * 会话面板由 MainLayout 直接渲染（ChatSessionPanel），
 * 会话/消息状态存于全局 chatStore，跨页面切换不丢失。
 */
export default function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat()

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      <div className="flex-1">
        <ChatInterface
          messages={messages}
          isStreaming={isStreaming}
          onSendMessage={sendMessage}
          onStopStreaming={stopStreaming}
        />
      </div>
    </div>
  )
}
