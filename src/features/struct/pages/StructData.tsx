import { useState } from 'react'
import { Plus, Search, Trash2, Pencil, Database } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { useStructData } from '../hooks/useStructData'
import { DEFAULT_PAGE_SIZE } from '@/shared/utils/constants'
import { formatDateTime } from '@/shared/utils/format'

export default function StructDataPage() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string; key: string; value: string; metadata?: string } | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newMeta, setNewMeta] = useState('')

  const { list, isLoading, createItem, updateItem, deleteItem } = useStructData({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    keyword: keyword || undefined,
  })

  const items = list?.list ?? []
  const total = list?.total ?? 0
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  const handleCreate = () => {
    if (!newKey.trim() || !newValue.trim()) return
    createItem({ key: newKey, value: newValue, metadata: newMeta || undefined })
    setShowCreateDialog(false)
    setNewKey('')
    setNewValue('')
    setNewMeta('')
  }

  const handleEdit = () => {
    if (!editingItem || !editingItem.key.trim()) return
    updateItem({ id: editingItem.id, data: { key: editingItem.key, value: editingItem.value, metadata: editingItem.metadata } })
    setEditingItem(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">结构化数据管理</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          新增条目
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">键</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">值</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">更新时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">加载中...</td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Database className="h-8 w-8" />
                      <p className="text-sm">暂无数据</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium">{item.key}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{item.value}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingItem(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm('确认删除？')) deleteItem(item.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">共 {total} 条</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
              <span className="flex items-center px-3 text-sm">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增条目</DialogTitle>
            <DialogDescription>添加结构化数据条目</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>键 (Key)</Label>
              <Input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="数据键" />
            </div>
            <div className="space-y-2">
              <Label>值 (Value)</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="数据值"
              />
            </div>
            <div className="space-y-2">
              <Label>元数据 (可选)</Label>
              <Input value={newMeta} onChange={(e) => setNewMeta(e.target.value)} placeholder="JSON 格式元数据" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!newKey.trim() || !newValue.trim()}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑条目</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>键</Label>
              <Input value={editingItem?.key || ''} onChange={(e) => setEditingItem(editingItem ? { ...editingItem, key: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <Label>值</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={editingItem?.value || ''}
                onChange={(e) => setEditingItem(editingItem ? { ...editingItem, value: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label>元数据</Label>
              <Input value={editingItem?.metadata || ''} onChange={(e) => setEditingItem(editingItem ? { ...editingItem, metadata: e.target.value } : null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>取消</Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
