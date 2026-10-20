import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DataTable, type DataTableColumn } from '@/shared/components/ui/data-table'
import { Button } from '@/shared/components/ui/button'
import { FileUpload } from './FileUpload'
import type { FileInfo, UploadedFile } from '../types'
interface Props {
  files: FileInfo[]
  loading: boolean
  error: boolean
  onRefresh: () => void
  onDeleteSource: (id: number) => void
}
export function SourceFileManager({ files, loading, error, onRefresh, onDeleteSource }: Props) {
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const client = useQueryClient()
  const fileColumns: DataTableColumn<FileInfo>[] = [
    {
      key: 'filename',
      title: '文件名',
      slot: ({ row }) => (
        <div>
          <p>{row.filename}</p>
          <p className="text-muted-foreground text-xs">
            #{row.id} · {(row.fileSize / 1024).toFixed(1)} KB
          </p>
        </div>
      )
    },
    { key: 'status', title: '文件状态', slot: ({ row }) => row.status },
    { key: 'storageStatus', title: '源文件', slot: ({ row }) => row.storageStatus },
    {
      key: 'actions',
      title: '操作',
      slot: ({ row }) => (
        <Button
          size="sm"
          variant="ghost"
          disabled={
            row.storageStatus !== 'PRESENT' ||
            ['UPLOADING', 'PARSE_PENDING', 'PARSING'].includes(row.status)
          }
          onClick={() => {
            if (window.confirm('永久删除该源文件？关联文档与解析记录保留，但无法再次解析。'))
              onDeleteSource(row.id)
          }}
        >
          删除源文件
        </Button>
      )
    }
  ]

  return (
    <section className="mt-6">
      {error && (
        <p role="alert" className="text-destructive text-sm">
          源文件加载失败{' '}
          <Button variant="outline" size="sm" onClick={onRefresh}>
            重试
          </Button>
        </p>
      )}
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">
          我的源文件（用户级资源，不按知识库过滤）
        </summary>
        <p className="text-muted-foreground my-3 text-sm">
          上传仅保存源文件。使用“新增文档”关联到当前知识库后，再启动解析；公开知识库的其他用户文档不会出现在我的源文件中。
        </p>
        <FileUpload
          maxFiles={10}
          fileList={uploads}
          onFileListChange={setUploads}
          onUploaded={() => {
            void client.invalidateQueries({ queryKey: ['files'] })
          }}
        />
        <DataTable
          data={files}
          columns={fileColumns}
          rowKey="id"
          loading={loading}
          onRefresh={onRefresh}
        />
      </details>
    </section>
  )
}
