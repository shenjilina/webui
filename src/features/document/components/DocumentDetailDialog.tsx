import { useQuery } from '@tanstack/react-query'
import { getDocumentDetail, listDocumentChunks } from '../api'
import type { DocumentInfo } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { formatDateTime } from '@/shared/utils/format'

interface DocumentDetailDialogProps {
  document: DocumentInfo | null
  onOpenChange: (open: boolean) => void
}

export function DocumentDetailDialog({ document, onOpenChange }: DocumentDetailDialogProps) {
  const detailQuery = useQuery({
    queryKey: ['document-detail', document?.id],
    queryFn: () => getDocumentDetail({ documentId: document!.id }),
    enabled: document !== null
  })
  const parseStatus = detailQuery.data?.parseStatus ?? document?.parseStatus
  const chunksQuery = useQuery({
    queryKey: ['document-chunks', document?.id],
    queryFn: () => listDocumentChunks(document!.id),
    enabled: parseStatus === 'SUCCESS'
  })
  return (
    <Dialog open={document !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>解析详情</DialogTitle>
        </DialogHeader>
        {document && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>标题：{detailQuery.data?.title ?? document.title}</p>
              <p>
                状态：
                <Badge variant={parseStatus === 'FAILED' ? 'destructive' : 'secondary'}>
                  {parseStatus}
                </Badge>
              </p>
              <p>分片数：{detailQuery.data?.chunkCount ?? document.chunkCount}</p>
              <p>创建时间：{formatDateTime(document.createdAt)}</p>
            </div>
            {parseStatus === 'FAILED' && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {detailQuery.data?.errorMsg || document.errorMsg || '未返回错误日志'}
              </div>
            )}
            {parseStatus === 'SUCCESS' && (
              <div>
                <p className="mb-2 text-sm font-medium">切片预览</p>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {chunksQuery.data?.items.map((chunk) => (
                    <div key={chunk.id} className="bg-muted rounded-md p-3 text-sm">
                      <p className="text-muted-foreground mb-1 text-xs">切片 {chunk.chunkIndex}</p>
                      <p className="whitespace-pre-wrap">{chunk.content}</p>
                    </div>
                  ))}
                  {chunksQuery.isLoading && (
                    <p className="text-muted-foreground text-sm">加载切片中...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
