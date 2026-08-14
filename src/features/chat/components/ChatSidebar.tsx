import { PenLine, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import type { ChatSession } from '../types'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: ChatSidebarProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 快捷操作：新建对话 */}
      <div className="px-3 pt-3">
        <Button
          variant="ghost"
          onClick={onNewSession}
          className="w-full justify-start gap-3 px-3 font-normal text-sidebar-foreground"
        >
          <PenLine className="h-4 w-4 shrink-0" />
          新建对话
        </Button>
      </div>

      {/* 最近会话 */}
      <div className="px-4 pb-1 pt-4 text-xs text-muted-foreground">最近</div>
      <ScrollArea className="min-h-0 flex-1 px-3">
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
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
                  onDeleteSession(session.id)
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
