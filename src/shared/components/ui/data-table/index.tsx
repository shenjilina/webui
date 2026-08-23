import { RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../button'

export interface DataTablePagination {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
}

export interface DataTableCellContext<T> {
  row: T
  value: unknown
  index: number
}

export interface DataTableColumn<T> {
  key: string
  title: ReactNode
  accessor?: keyof T
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  /** React equivalent of a slot for fully custom cell content. */
  slot?: (context: DataTableCellContext<T>) => ReactNode
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  rowKey: keyof T | ((row: T, index: number) => string | number)
  loading?: boolean
  pagination?: DataTablePagination
  emptyText?: string
  /** Content rendered at the left side of the table toolbar. */
  toolbarLeftSlot?: ReactNode
  /** Content rendered at the right side of the table toolbar, replacing the default refresh button. */
  toolbarRightSlot?: ReactNode
  onRefresh?: () => void
  onPaginationChange?: (pagination: Pick<DataTablePagination, 'page' | 'pageSize'>) => void
}

export function getDataTableValue<T>(row: T, accessor?: keyof T): unknown {
  return accessor ? row[accessor] : undefined
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  pagination,
  emptyText = '暂无数据',
  toolbarLeftSlot,
  toolbarRightSlot,
  onRefresh,
  onPaginationChange
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1
  const pageSizeOptions = pagination?.pageSizeOptions ?? [10, 20, 50, 100]
  const getRowKey = (row: T, index: number) =>
    typeof rowKey === 'function' ? rowKey(row, index) : String(row[rowKey])

  return (
    <div className="space-y-3">
      {(toolbarLeftSlot || toolbarRightSlot || onRefresh) && (
        <div className="flex items-center justify-between gap-3">
          <div>{toolbarLeftSlot}</div>
          <div>
            {toolbarRightSlot ??
              (onRefresh && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="刷新"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              ))}
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-left">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted-foreground px-4 py-16 text-center"
                >
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-muted-foreground px-4 py-16 text-center"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={getRowKey(row, index)} className="border-t">
                  {columns.map((column) => {
                    const value = getDataTableValue(row, column.accessor)
                    return (
                      <td
                        key={column.key}
                        className={`px-4 py-3 ${column.className ?? ''} ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}`}
                      >
                        {column.slot ? column.slot({ row, value, index }) : String(value ?? '-')}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && onPaginationChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
          <span className="text-muted-foreground">共 {pagination.total} 条</span>
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background h-8 rounded-md border px-2 text-xs"
              value={pagination.pageSize}
              onChange={(event) =>
                onPaginationChange({ page: 1, pageSize: Number(event.target.value) })
              }
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / 页
                </option>
              ))}
            </select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1 || loading}
              onClick={() =>
                onPaginationChange({ page: pagination.page - 1, pageSize: pagination.pageSize })
              }
            >
              上一页
            </Button>
            <span className="text-muted-foreground min-w-14 text-center text-xs">
              {pagination.page} / {totalPages}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pagination.page >= totalPages || loading}
              onClick={() =>
                onPaginationChange({ page: pagination.page + 1, pageSize: pagination.pageSize })
              }
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
