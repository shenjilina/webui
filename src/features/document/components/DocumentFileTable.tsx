import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/shared/components/ui/data-table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { formatDateTime } from '@/shared/utils/format'
import type { DocumentInfo, FileInfo } from '../types'
interface Props {
  files: FileInfo[]
  documentsByFile: Map<number, DocumentInfo>
  loading: boolean
  writable: boolean
  toolbarLeftSlot?: ReactNode
  onRefresh: () => void
  onDetail: (document: DocumentInfo) => void
  onParse: (fileId: number, retry: boolean) => void
  onDeleteDocument: (documentId: number) => void
}
export function DocumentFileTable({
  files,
  documentsByFile,
  loading,
  writable,
  toolbarLeftSlot,
  onRefresh,
  onDetail,
  onParse,
  onDeleteDocument
}: Props) {
  const columns: DataTableColumn<DocumentInfo>[] = [
    {
      key: 'title',
      title: '文档',
      slot: ({ row }) => (
        <div>
          <p className="font-medium">{row.title}</p>
          <p className="text-muted-foreground text-xs">
            文档 #{row.id} · 源文件 #{row.fileId}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      title: '解析状态',
      slot: ({ row }) => (
        <Badge variant={row.parseStatus === 'FAILED' ? 'destructive' : 'secondary'}>
          {row.parseStatus}
        </Badge>
      )
    },
    { key: 'chunks', title: '分块', slot: ({ row }) => row.chunkCount },
    { key: 'createdAt', title: '创建时间', slot: ({ row }) => formatDateTime(row.createdAt) },
    {
      key: 'actions',
      title: '操作',
      slot: ({ row }) => {
        const file = files.find((item) => item.id === row.fileId)
        const processing =
          ['PARSING', 'PARSE_PENDING', 'UPLOADING'].includes(file?.status ?? '') ||
          row.parseStatus === 'PARSING'
        return (
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" onClick={() => onDetail(row)}>
              详情/分块
            </Button>
            {writable &&
              file?.storageStatus === 'PRESENT' &&
              !processing &&
              ['PENDING', 'FAILED'].includes(row.parseStatus) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onParse(row.fileId, row.parseStatus === 'FAILED')}
                >
                  {row.parseStatus === 'FAILED' ? '重试' : '解析'}
                </Button>
              )}
            {writable && (
              <Button
                size="sm"
                variant="ghost"
                disabled={processing}
                onClick={() => {
                  if (window.confirm('删除文档并清理向量？源文件将保留。')) onDeleteDocument(row.id)
                }}
              >
                删除文档
              </Button>
            )}
          </div>
        )
      }
    }
  ]
  return (
    <div className="space-y-6">
      <DataTable
        data={[...documentsByFile.values()]}
        columns={columns}
        rowKey="id"
        loading={loading}
        toolbarLeftSlot={toolbarLeftSlot}
        onRefresh={onRefresh}
      />
    </div>
  )
}
