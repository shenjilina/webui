import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listAllKnowledgeBases } from '@/features/knowledge/api'
import { listDocuments } from '@/features/document/api'
import { DocumentChunks } from '@/features/document/components/DocumentChunks'
import { Button } from '@/shared/components/ui/button'
export default function StructDataPage() {
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<number | null>(null)
  const [documentId, setDocumentId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const bases = useQuery({ queryKey: ['knowledge-bases', 'all'], queryFn: listAllKnowledgeBases })
  const docs = useQuery({
    queryKey: ['chunk-documents', knowledgeBaseId, page],
    queryFn: () => listDocuments({ knowledgeBaseId: knowledgeBaseId!, page, pageSize: 20 }),
    enabled: knowledgeBaseId !== null
  })
  const selected = docs.data?.items.find((item) => item.id === documentId)
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">文档分块查看</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          查看后端解析生成的真实文档片段。分块只读，解析和向量维护由后端处理。
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>知识库</span>
          <select
            aria-label="分块知识库"
            className="bg-background block w-full rounded-md border p-2"
            value={knowledgeBaseId ?? ''}
            onChange={(e) => {
              setKnowledgeBaseId(e.target.value ? Number(e.target.value) : null)
              setDocumentId(null)
              setPage(1)
            }}
          >
            <option value="">请选择知识库</option>
            {bases.data?.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span>文档</span>
          <select
            aria-label="分块文档"
            disabled={!knowledgeBaseId || docs.isLoading}
            className="bg-background block w-full rounded-md border p-2"
            value={documentId ?? ''}
            onChange={(e) => setDocumentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">请选择文档</option>
            {docs.data?.items.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}（{doc.parseStatus}）
              </option>
            ))}
          </select>
        </label>
      </div>
      {(bases.isLoading || docs.isLoading) && (
        <p className="text-muted-foreground text-sm">加载中…</p>
      )}
      {(bases.isError || docs.isError) && (
        <div role="alert" className="text-destructive text-sm">
          加载失败{' '}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void bases.refetch()
              if (knowledgeBaseId) void docs.refetch()
            }}
          >
            重试
          </Button>
        </div>
      )}
      {docs.data && (
        <div className="flex justify-end gap-3 text-sm">
          <span>
            文档共 {docs.data.total} 条 · 第 {page} 页
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || docs.isFetching}
            onClick={() => {
              setPage((p) => p - 1)
              setDocumentId(null)
            }}
          >
            上一页
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page * 20 >= docs.data.total || docs.isFetching}
            onClick={() => {
              setPage((p) => p + 1)
              setDocumentId(null)
            }}
          >
            下一页
          </Button>
        </div>
      )}
      {selected?.parseStatus === 'SUCCESS' ? (
        <DocumentChunks key={selected.id} documentId={selected.id} />
      ) : (
        <p className="text-muted-foreground rounded-lg border p-8 text-center text-sm">
          {selected
            ? selected.errorMsg || '该文档尚未解析成功，请到文档管理启动解析'
            : docs.data?.total === 0
              ? '当前知识库暂无文档'
              : '选择知识库和文档后查看分块'}
        </p>
      )}
    </div>
  )
}
