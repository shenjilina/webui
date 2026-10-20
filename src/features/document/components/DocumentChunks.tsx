import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listDocumentChunks } from '../api'
import { Button } from '@/shared/components/ui/button'
export function DocumentChunks({ documentId }: { documentId: number }) {
  const [page, setPage] = useState(1)
  const pageSize = 20
  const query = useQuery({
    queryKey: ['document-chunks', documentId, page],
    queryFn: () => listDocumentChunks(documentId, page, pageSize)
  })
  return (
    <div className="space-y-3">
      {query.isLoading && <p className="text-muted-foreground text-sm">加载分块中…</p>}
      {query.isError && (
        <div role="alert" className="text-destructive text-sm">
          分块加载失败{' '}
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            重试
          </Button>
        </div>
      )}
      {query.data && (
        <>
          <div className="max-h-[50vh] space-y-3 overflow-auto">
            {query.data.items.map((chunk) => (
              <article key={chunk.id} className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground mb-2 text-xs">
                  分块 {chunk.chunkIndex} · #{chunk.id}
                </p>
                <p className="text-sm break-words whitespace-pre-wrap">{chunk.content}</p>
              </article>
            ))}
            {!query.data.items.length && (
              <p className="text-muted-foreground p-4 text-sm">暂无分块</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 text-sm">
            <span>
              共 {query.data.total} 块 · 第 {page}/
              {Math.max(1, Math.ceil(query.data.total / pageSize))} 页
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              上一页
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * pageSize >= query.data.total || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
