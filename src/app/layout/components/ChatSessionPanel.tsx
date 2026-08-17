import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { cn } from '@/shared/lib/utils'
import { useChatSessions } from '@/features/chat/hooks/useChatSessions'

/**
 * 布局层会话面板：新建对话 + 最近会话列表。
 * 数据由 useChatSessions 自取（react-query + 全局 chatStore），
 * 不再依赖聊天页 portal 挂载，仅在智能问答路由下由 MainLayout 直接渲染。
 */
export function ChatSessionPanel() {
  const { sessions, currentSessionId, switchSession, newSession, deleteSession } =
    useChatSessions()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 标题行：最近会话 + 右侧新建对话入口 */}
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <span className="text-sm text-muted-foreground">最近</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground"
              onClick={newSession}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">新建对话</TooltipContent>
        </Tooltip>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-3">
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => switchSession(session.id)}
              className={cn(
                'group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left',
                currentSessionId === session.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              )}
            >
              <span className="flex-1 min-w-0 truncate">{session.title || '新对话'}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-60 hover:opacity-100! focus-visible:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteSession(session.id)
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
