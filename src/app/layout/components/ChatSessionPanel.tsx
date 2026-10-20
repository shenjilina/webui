import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useChatSessions } from '@/features/chat/hooks/useChatSessions'
import { cn } from '@/shared/lib/utils'
export function ChatSessionPanel() {
  const {
    sessions,
    currentSessionId,
    switchSession,
    newSession,
    deleteSession,
    isStreaming,
    isLoading,
    isError,
    refetch,
    isDeleting
  } = useChatSessions()
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-muted-foreground text-sm">最近对话</span>
        <div className="flex gap-1">
          <Button
            title="刷新历史"
            variant="ghost"
            size="sm"
            disabled={isStreaming || isDeleting}
            onClick={() => void refetch()}
          >
            刷新
          </Button>
          <Button
            title="新建对话"
            aria-label="新建对话"
            variant="ghost"
            size="icon"
            disabled={isStreaming || isDeleting}
            onClick={newSession}
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {isLoading && <p className="text-muted-foreground p-2 text-xs">加载历史中…</p>}
        {isError && (
          <p role="alert" className="text-destructive p-2 text-xs">
            历史加载失败，请刷新重试
          </p>
        )}
        {!isLoading && !isError && !sessions.length && (
          <p className="text-muted-foreground p-2 text-xs">发送问题后自动保存会话</p>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              'group flex items-center rounded-lg',
              currentSessionId === session.id ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
            )}
          >
            <button
              disabled={isStreaming || isDeleting}
              className="min-w-0 flex-1 p-2 text-left disabled:opacity-50"
              onClick={() => switchSession(session.id)}
            >
              <p className="truncate text-sm">{session.title}</p>
              <p className="text-muted-foreground text-xs">
                知识库 #{session.knowledgeBaseId} · {session.records.length} 轮
              </p>
            </button>
            <Button
              title="删除会话记录"
              aria-label="删除会话记录"
              className="h-7 w-7 shrink-0"
              variant="ghost"
              size="icon"
              disabled={isStreaming || isDeleting}
              onClick={() => {
                if (window.confirm('删除该会话的所有问答记录？此操作不可撤销。'))
                  deleteSession(session.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
