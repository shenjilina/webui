import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Archive,
  CheckCircle2,
  Database,
  FileText,
  FolderPlus,
  Pencil,
  RotateCcw,
  Search,
  Trash2,
  Plus
} from 'lucide-react'
import { useUserStore } from '@/features/auth/store/userStore'
import { getKnowledgeBaseSummary } from '@/features/knowledge/api'
import { useKnowledgeBases } from '@/features/knowledge/hooks/useKnowledgeBases'
import type {
  KnowledgeBase,
  KnowledgeBaseStatus,
  KnowledgeBaseVisibility
} from '@/features/knowledge/types'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { formatDateTime } from '@/shared/utils/format'
import { DeleteKnowledgeBaseDialog } from '../components/DeleteKnowledgeBaseDialog'
import { DocumentCreateDialog } from '../components/DocumentCreateDialog'
import { DocumentDetailDialog } from '../components/DocumentDetailDialog'
import { DocumentFileTable } from '../components/DocumentFileTable'
import { KnowledgeBaseFormDialog } from '../components/KnowledgeBaseFormDialog'
import { useDocuments } from '../hooks/useDocuments'
import type { DocumentInfo } from '../types'
import { isProcessingFile, mapDocumentsByFile } from '../utils'

const PAGE_SIZE = 12
function StatusBadge({ value }: { value: string }) {
  const variant = value.includes('FAILED') || value === 'DISABLED' ? 'destructive' : 'secondary'
  return <Badge variant={variant}>{value}</Badge>
}

export default function DocumentListPage() {
  const userId = useUserStore((state) => state.userInfo?.id ?? null)
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<KnowledgeBaseStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<KnowledgeBase | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBase | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailDocument, setDetailDocument] = useState<DocumentInfo | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(searchInput)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const knowledge = useKnowledgeBases({
    query: query || null,
    status: status || null,
    page,
    pageSize: PAGE_SIZE
  })
  const knowledgeBases = knowledge.list
  useEffect(() => {
    if (knowledgeBases.length === 0) {
      setSelectedId(null)
      return
    }
    if (!knowledgeBases.some((item) => item.id === selectedId)) setSelectedId(knowledgeBases[0].id)
  }, [knowledgeBases, selectedId])

  const selected = knowledgeBases.find((item) => item.id === selectedId) ?? null
  const documents = useDocuments(selectedId)
  const summaryQuery = useQuery({
    queryKey: ['knowledge-base-summary', selectedId],
    queryFn: () => getKnowledgeBaseSummary({ knowledgeBaseId: selectedId! }),
    enabled: selectedId !== null
  })
  const documentByFile = mapDocumentsByFile(documents.documents)
  const isOwner = selected?.ownerId === userId
  const writable = isOwner && selected?.status === 'ACTIVE'
  const hasProcessing = documents.files.some(isProcessingFile)
  const failedCount = documents.documents.filter(
    (document) => document.parseStatus === 'FAILED'
  ).length
  useEffect(() => {
    if (!selectedId || !hasProcessing) return
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        documents.refetch()
        summaryQuery.refetch()
      }
    }
    const interval = window.setInterval(refresh, 3000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [selectedId, hasProcessing, documents.refetch, summaryQuery.refetch])

  const refresh = () => {
    documents.refetch()
    // summaryQuery.refetch()
    // knowledge.refetch()
  }
  const submitKnowledgeBase = (values: {
    name: string
    description: string
    visibility: KnowledgeBaseVisibility
  }) => {
    if (editing) {
      knowledge.update(
        { knowledgeBaseId: editing.id, ...values, description: values.description || null },
        {
          onSuccess: (updated) => {
            setSelectedId(updated.id)
            setFormOpen(false)
            setEditing(null)
          }
        }
      )
      return
    }
    knowledge.create(
      { ...values, description: values.description || null },
      {
        onSuccess: (created) => {
          setSelectedId(created.id)
          setFormOpen(false)
        }
      }
    )
  }
  const changeStatus = (knowledgeBase: KnowledgeBase, nextStatus: KnowledgeBaseStatus) => {
    knowledge.updateStatus(
      { knowledgeBaseId: knowledgeBase.id, status: nextStatus },
      { onSuccess: () => refresh() }
    )
  }
  const openCreateDocument = () => {
    setUploadOpen(true)
  }
  const submitDocument = (values: { fileId: number; title: string; description: string }) => {
    if (!selected) return
    documents.create(
      {
        fileId: values.fileId,
        knowledgeBaseId: selected.id,
        title: values.title,
        description: values.description || null
      },
      {
        onSuccess: () => {
          refresh()
          setUploadOpen(false)
        }
      }
    )
  }
  return (
    <div className="h-full min-h-0 p-4 md:p-6">
      <div className="grid h-full min-h-[640px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="flex min-h-0 flex-col rounded-lg">
          <CardContent className="flex min-h-0 flex-1 flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Database className="h-4 w-4" />
                知识库
              </div>
              <Button
                size="icon"
                variant="ghost"
                title="新建知识库"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mb-2">
              <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
              <Input
                className="pl-9"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="搜索知识库"
              />
            </div>
            <select
              className="border-input bg-background mb-3 h-9 w-full rounded-md border px-3 text-sm"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as KnowledgeBaseStatus | '')
                setPage(1)
              }}
            >
              <option value="">全部状态</option>
              <option value="ACTIVE">启用</option>
              <option value="DISABLED">已禁用</option>
              <option value="ARCHIVED">已归档</option>
            </select>
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {knowledge.isLoading ? (
                <p className="text-muted-foreground py-8 text-center text-sm">加载中...</p>
              ) : null}
              {knowledge.isError ? (
                <Empty text="知识库加载失败" action={knowledge.refetch} />
              ) : null}
              {!knowledge.isLoading && !knowledge.isError && knowledgeBases.length === 0 ? (
                <Empty
                  text="暂无知识库"
                  action={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                />
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
                      onClick={() => setSelectedId(item.id)}
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
                          onClick={() => {
                            setEditing(item)
                            setFormOpen(true)
                          }}
                          icon={<Pencil className="h-3.5 w-3.5" />}
                        />
                        <IconAction
                          label={item.status === 'DISABLED' ? '启用' : '禁用'}
                          onClick={() =>
                            changeStatus(item, item.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED')
                          }
                          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        />
                        <IconAction
                          label={item.status === 'ARCHIVED' ? '取消归档' : '归档'}
                          onClick={() =>
                            changeStatus(item, item.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED')
                          }
                          icon={<Archive className="h-3.5 w-3.5" />}
                        />
                        <IconAction
                          label="删除"
                          onClick={() => {
                            setDeleteTarget(item)
                          }}
                          icon={<Trash2 className="text-destructive h-3.5 w-3.5" />}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
              <span className="text-muted-foreground">{knowledge.page?.total ?? 0} 个</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  上一页
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!knowledge.page || page * PAGE_SIZE >= knowledge.page.total}
                  onClick={() => setPage((current) => current + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <main className="min-w-0 overflow-y-auto">
          {!selected ? (
            <Empty
              text="选择或创建一个知识库以开始管理文件"
              action={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            />
          ) : (
            <>
              <Card className="rounded-lg">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-semibold">{selected.name}</h1>
                      <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                        {selected.description || '暂无描述'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge value={selected.visibility} />
                        <StatusBadge value={selected.status} />
                        <span className="text-muted-foreground text-xs">
                          创建于 {formatDateTime(selected.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-right text-sm">
                      <Metric label="文件" value={summaryQuery.data?.fileCount} />
                      <Metric label="有效文档" value={summaryQuery.data?.validDocumentCount} />
                      <Metric label="失败文档" value={summaryQuery.data?.failedDocumentCount} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg">
                <CardContent className="p-0">
                  {documents.isError ? (
                    <Empty text="文件或文档加载失败" action={documents.refetch} />
                  ) : (
                    <DocumentFileTable
                      files={documents.files}
                      documentsByFile={documentByFile}
                      loading={documents.isLoading || documents.isFetching}
                      writable={writable}
                      toolbarLeftSlot={
                        <div className="flex flex-wrap gap-2">
                          <DisabledAction
                            disabled={!writable}
                            reason={isOwner ? '知识库未启用，无法写入' : '仅创建者可操作'}
                          >
                            <Button onClick={openCreateDocument} disabled={!writable}>
                              <Plus className="h-4 w-4" /> 新增文档
                            </Button>
                          </DisabledAction>
                          <DisabledAction
                            disabled={!writable || failedCount === 0}
                            reason={failedCount === 0 ? '没有失败文档可重试' : '知识库不可写'}
                          >
                            <Button
                              variant="outline"
                              onClick={() => documents.retry(undefined, { onSuccess: refresh })}
                              disabled={!writable || failedCount === 0 || documents.isRetrying}
                            >
                              <RotateCcw className="h-4 w-4" /> 批量重试
                            </Button>
                          </DisabledAction>
                        </div>
                      }
                      onRefresh={refresh}
                      onDetail={setDetailDocument}
                      onParse={(fileId, retry) =>
                        documents.parse(
                          { fileId, retry: retry || undefined },
                          { onSuccess: refresh }
                        )
                      }
                      onDeleteDocument={(documentId) =>
                        documents.remove({ documentId }, { onSuccess: refresh })
                      }
                      onDeleteSource={(fileId) =>
                        documents.deleteSource({ fileId }, { onSuccess: refresh })
                      }
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>

      <KnowledgeBaseFormDialog
        open={formOpen}
        knowledgeBase={editing}
        submitting={knowledge.isCreating || knowledge.isUpdating}
        onOpenChange={setFormOpen}
        onSubmit={submitKnowledgeBase}
      />
      <DocumentCreateDialog
        open={uploadOpen}
        submitting={documents.isCreating}
        onOpenChange={setUploadOpen}
        onSubmit={submitDocument}
      />
      <DeleteKnowledgeBaseDialog
        knowledgeBase={deleteTarget}
        deleting={knowledge.isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={(confirmationName) => {
          if (!deleteTarget) return
          knowledge.remove(
            { knowledgeBaseId: deleteTarget.id, confirmationName },
            {
              onSuccess: () => {
                setDeleteTarget(null)
                setSelectedId(null)
              }
            }
          )
        }}
      />
      <DocumentDetailDialog
        document={detailDocument}
        onOpenChange={(open) => !open && setDetailDocument(null)}
      />
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <p className="text-lg font-semibold">{value ?? '-'}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  )
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
  icon: React.ReactNode
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
function DisabledAction({
  disabled,
  reason,
  children
}: {
  disabled: boolean
  reason: string
  children: React.ReactNode
}) {
  return disabled ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{children}</span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  ) : (
    <>{children}</>
  )
}
