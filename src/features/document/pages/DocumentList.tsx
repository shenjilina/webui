import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Plus, RotateCcw } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { formatDateTime } from '@/shared/utils/format'
import { DeleteKnowledgeBaseDialog } from '../components/DeleteKnowledgeBaseDialog'
import { DocumentCreateDialog } from '../components/DocumentCreateDialog'
import { DocumentDetailDialog } from '../components/DocumentDetailDialog'
import { DocumentFileTable } from '../components/DocumentFileTable'
import { KnowledgeBaseFormDialog } from '../components/KnowledgeBaseFormDialog'
import { KnowledgeBaseSidebar } from '../components/KnowledgeBaseSidebar'
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
        <KnowledgeBaseSidebar
          userId={userId}
          knowledgeBases={knowledgeBases}
          isLoading={knowledge.isLoading}
          isError={knowledge.isError}
          total={knowledge.page?.total ?? 0}
          page={page}
          hasNextPage={Boolean(knowledge.page && page * PAGE_SIZE < knowledge.page.total)}
          searchInput={searchInput}
          status={status}
          selectedId={selectedId}
          onSearchInputChange={setSearchInput}
          onStatusChange={(nextStatus) => {
            setStatus(nextStatus)
            setPage(1)
          }}
          onPageChange={setPage}
          onSelect={setSelectedId}
          onCreate={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          onEdit={(knowledgeBase) => {
            setEditing(knowledgeBase)
            setFormOpen(true)
          }}
          onChangeStatus={changeStatus}
          onDelete={setDeleteTarget}
          onRetry={knowledge.refetch}
        />

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
              <Card className="rounded-lg mb-4">
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
              <Card className="rounded-lg border-none">
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
