import { createPortal } from 'react-dom'
import { useChat } from '../hooks/useChat'
import { ChatSidebar } from '../components/ChatSidebar'
import { ChatInterface } from '../components/ChatInterface'
import { useLayoutContext } from '@/app/layout/LayoutContext'

export default function ChatPage() {
  const {
    sessions,
    currentSessionId,
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    switchSession,
    newSession,
    deleteSession,
  } = useChat()
  const { leftPanelEl } = useLayoutContext()

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      {/* 会话面板通过 portal 挂载到左侧导航侧栏内（工作台 + 新建对话 + 会话列表） */}
      {leftPanelEl &&
        createPortal(
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={switchSession}
            onNewSession={newSession}
            onDeleteSession={deleteSession}
          />,
          leftPanelEl,
        )}
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
