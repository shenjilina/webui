import type { ReactNode } from 'react'
import {
  Archive,
  CheckCircle2,
  Database,
  FileText,
  FolderPlus,
  Pencil,
  Search,
  Trash2
} from 'lucide-react'
import type { KnowledgeBase, KnowledgeBaseStatus } from '@/features/knowledge/types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'

interface KnowledgeBaseSidebarProps {
  // 查询、弹窗和数据变更状态由页面维护，侧栏仅渲染数据并转发用户操作。
  userId: number | null
  knowledgeBases: KnowledgeBase[]
  isLoading: boolean
  isError: boolean
  total: number
  page: number
  hasNextPage: boolean
  searchInput: string
  status: KnowledgeBaseStatus | ''
  selectedId: number | null
  onSearchInputChange: (value: string) => void
  onStatusChange: (value: KnowledgeBaseStatus | '') => void
  onPageChange: (updater: (page: number) => number) => void
  onSelect: (knowledgeBaseId: number) => void
  onCreate: () => void
  onEdit: (knowledgeBase: KnowledgeBase) => void
  onChangeStatus: (knowledgeBase: KnowledgeBase, status: KnowledgeBaseStatus) => void
  onDelete: (knowledgeBase: KnowledgeBase) => void
  onRetry: () => void
}

export function KnowledgeBaseSidebar({
  userId,
  knowledgeBases,
  isLoading,
  isError,
  total,
  page,
  hasNextPage,
  searchInput,
  status,
  selectedId,
  onSearchInputChange,
  onStatusChange,
  onPageChange,
  onSelect,
  onCreate,
  onEdit,
  onChangeStatus,
  onDelete,
  onRetry
}: KnowledgeBaseSidebarProps) {
  return (
    <Card className="flex min-h-0 flex-col rounded-lg">
      <CardContent className="flex min-h-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Database className="h-4 w-4" />
            知识库
          </div>
          <Button size="icon" variant="ghost" title="新建知识库" onClick={onCreate}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mb-2">
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
          <Input
            className="pl-9"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="搜索知识库"
          />
        </div>
        <select
          className="border-input bg-background mb-3 h-9 w-full rounded-md border px-3 text-sm"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as KnowledgeBaseStatus | '')}
        >
          <option value="">全部状态</option>
          <option value="ACTIVE">启用</option>
          <option value="DISABLED">已禁用</option>
          <option value="ARCHIVED">已归档</option>
        </select>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">加载中...</p>
          ) : null}
          {isError ? <Empty text="知识库加载失败" action={onRetry} /> : null}
          {!isLoading && !isError && knowledgeBases.length === 0 ? (
            <Empty text="暂无知识库" action={onCreate} />
          ) : null}
          {knowledgeBases.map((item) => {
            const own = item.ownerId === userId
            return (
              <div
                key={item.id}
                className={`group rounded-md border p-3 ${selectedId === item.id ? 'border-primary bg-primary/5' : 'hover:bg-muted border-transparent'}`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSelect(item.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{item.name}</span>
                    <StatusBadge value={item.status} />
                  </div>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {item.description || '暂无描述'}
                  </p>
                </button>
                {own && (
                  <div className="mt-2 flex justify-end gap-1">
                    <IconAction
                      label="编辑"
                      onClick={() => onEdit(item)}
                      icon={<Pencil className="h-3.5 w-3.5" />}
                    />
                    <IconAction
                      label={item.status === 'DISABLED' ? '启用' : '禁用'}
                      onClick={() =>
                        onChangeStatus(item, item.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED')
                      }
                      icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    />
                    <IconAction
                      label={item.status === 'ARCHIVED' ? '取消归档' : '归档'}
                      onClick={() =>
                        onChangeStatus(item, item.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED')
                      }
                      icon={<Archive className="h-3.5 w-3.5" />}
                    />
                    <IconAction
                      label="删除"
                      onClick={() => onDelete(item)}
                      icon={<Trash2 className="text-destructive h-3.5 w-3.5" />}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
          <span className="text-muted-foreground">{total} 个</span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange((current) => current - 1)}
            >
              上一页
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!hasNextPage}
              onClick={() => onPageChange((current) => current + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ value }: { value: string }) {
  const variant = value.includes('FAILED') || value === 'DISABLED' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{value}</Badge>
}

function Empty({ text, action }: { text: string; action?: () => void }) {
  return (
    <div className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center text-sm">
      <FileText className="h-7 w-7" />
      <p>{text}</p>
      {action && (
        <Button size="sm" variant="outline" onClick={action}>
          重新加载
        </Button>
      )}
    </div>
  )
}

function IconAction({
  label,
  onClick,
  icon,
  disabled
}: {
  label: string
  onClick: () => void
  icon: ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
