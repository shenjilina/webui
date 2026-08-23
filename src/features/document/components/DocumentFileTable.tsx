import { FileText, Play, RotateCcw, Trash2, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { DataTable, type DataTableColumn } from '@/shared/components/ui/data-table'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { formatDateTime } from '@/shared/utils/format'
import type { DocumentInfo, FileInfo } from '../types'

interface DocumentFileTableProps {
  files: FileInfo[]
  documentsByFile: Map<number, DocumentInfo>
  loading: boolean
  writable: boolean
  toolbarLeftSlot?: ReactNode
  onRefresh: () => void
  onDetail: (document: DocumentInfo) => void
  onParse: (fileId: number, retry: boolean) => void
  onDeleteDocument: (documentId: number) => void
  onDeleteSource: (fileId: number) => void
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant={value.includes('FAILED') || value === 'DISABLED' ? 'destructive' : 'secondary'}>
      {value}
    </Badge>
  )
}

function Action({
  label,
  onClick,
  children,
  disabled
}: {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
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
  onDeleteDocument,
  onDeleteSource
}: DocumentFileTableProps) {
  const columns: DataTableColumn<FileInfo>[] = [
    {
      key: 'filename',
      title: '文件',
      accessor: 'filename',
      slot: ({ row }) => (
        <div
          className={
            row.storageStatus === 'PHYSICAL_DELETED'
              ? 'text-muted-foreground line-through opacity-60'
              : ''
          }
        >
          <p className="max-w-52 truncate font-medium">{row.filename}</p>
          <p className="text-muted-foreground text-xs">
            {row.fileType || row.mimeType || '未知'} · {formatFileSize(row.fileSize)}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      title: '文件状态',
      accessor: 'status',
      slot: ({ row }) => <StatusBadge value={row.status} />
    },
    {
      key: 'storageStatus',
      title: '存储状态',
      accessor: 'storageStatus',
      slot: ({ row }) => <StatusBadge value={row.storageStatus} />
    },
    {
      key: 'parseStatus',
      title: '解析状态',
      slot: ({ row }) => {
        const documentInfo = documentsByFile.get(row.id)
        return documentInfo ? (
          <StatusBadge value={documentInfo.parseStatus} />
        ) : (
          <span className="text-muted-foreground">未创建</span>
        )
      }
    },
    {
      key: 'chunkCount',
      title: '分片',
      align: 'center',
      slot: ({ row }) => documentsByFile.get(row.id)?.chunkCount ?? '-'
    },
    {
      key: 'createdAt',
      title: '创建时间',
      accessor: 'createdAt',
      slot: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right',
      slot: ({ row }) => {
        const documentInfo = documentsByFile.get(row.id)
        const canStart =
          writable &&
          row.storageStatus === 'PRESENT' &&
          row.status === 'UPLOADED' &&
          documentInfo?.parseStatus === 'PENDING'
        const canRetry =
          writable &&
          row.storageStatus === 'PRESENT' &&
          (row.status === 'PARSE_FAILED' || documentInfo?.parseStatus === 'FAILED')
        const canDeleteSource =
          writable &&
          row.storageStatus === 'PRESENT' &&
          !['UPLOADING', 'PARSE_PENDING', 'PARSING'].includes(row.status)
        return (
          <div className="flex justify-end gap-1">
            <Action
              label="详情"
              disabled={!documentInfo}
              onClick={() => documentInfo && onDetail(documentInfo)}
            >
              <FileText className="h-4 w-4" />
            </Action>
            {canStart && (
              <Action label="开始解析" onClick={() => onParse(row.id, false)}>
                <Play className="h-4 w-4" />
              </Action>
            )}
            {canRetry && (
              <Action label="重新解析" onClick={() => onParse(row.id, true)}>
                <RotateCcw className="h-4 w-4" />
              </Action>
            )}
            {documentInfo && writable && row.status !== 'PARSING' && (
              <Action label="软删除文档" onClick={() => onDeleteDocument(documentInfo.id)}>
                <XCircle className="text-destructive h-4 w-4" />
              </Action>
            )}
            {canDeleteSource && (
              <Action label="物理删除源文件" onClick={() => onDeleteSource(row.id)}>
                <Trash2 className="text-destructive h-4 w-4" />
              </Action>
            )}
          </div>
        )
      }
    }
  ]
  return (
    <DataTable
      data={files}
      columns={columns}
      rowKey="id"
      loading={loading}
      toolbarLeftSlot={toolbarLeftSlot}
      onRefresh={onRefresh}
    />
  )
}
