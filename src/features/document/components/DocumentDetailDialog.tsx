import { useQuery } from '@tanstack/react-query'
import { getDocumentDetail } from '../api'
import type { DocumentInfo } from '../types'
import { DocumentChunks } from './DocumentChunks'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { formatDateTime } from '@/shared/utils/format'
interface Props {
  document: DocumentInfo | null
  onOpenChange: (open: boolean) => void
}
export function DocumentDetailDialog({ document, onOpenChange }: Props) {
  const query = useQuery({
    queryKey: ['document-detail', document?.id],
    queryFn: () => getDocumentDetail({ documentId: document!.id }),
    enabled: document !== null,
    refetchOnMount: 'always',
    refetchInterval: (query) => (query.state.data?.parseStatus === 'PARSING' ? 3000 : false)
  })
  const detail = query.data ?? document
  return (
    <Dialog open={!!document} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>文档详情与分块</DialogTitle>
        </DialogHeader>
        {query.isLoading && <p className="text-muted-foreground text-sm">刷新详情中…</p>}
        {query.isError && (
          <p role="alert" className="text-destructive text-sm">
            详情加载失败{' '}
            <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
              重试
            </Button>
          </p>
        )}
        {detail && (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <p>标题：{detail.title}</p>
              <p>
                解析状态：
                <Badge variant={detail.parseStatus === 'FAILED' ? 'destructive' : 'secondary'}>
                  {detail.parseStatus}
                </Badge>
              </p>
              <p>分块数：{detail.chunkCount}</p>
              <p>创建时间：{formatDateTime(detail.createdAt)}</p>
              <p>文件 ID：{detail.fileId}</p>
              <p>知识库 ID：{detail.knowledgeBaseId}</p>
            </div>
            {detail.description && <p className="text-sm">{detail.description}</p>}
            {detail.parseStatus === 'FAILED' && (
              <p role="alert" className="text-destructive text-sm">
                {detail.errorMsg || '解析失败，请重试'}
              </p>
            )}
            {detail.parseStatus === 'SUCCESS' ? (
              <DocumentChunks key={detail.id} documentId={detail.id} />
            ) : (
              <p className="text-muted-foreground text-sm">解析成功后可查看分块</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
