import { useState } from 'react'
import { Plus, Upload, Search, Trash2, Zap, Pencil, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { TaskStatusBadge } from '../components/TaskStatusBadge'
import { FileUpload } from '../components/FileUpload'
import { useDocuments } from '../hooks/useDocuments'
import { useVectorTask } from '../hooks/useVectorTask'
import { DEFAULT_PAGE_SIZE, VectorTaskStatus } from '@/shared/utils/constants'
import { formatDateTime } from '@/shared/utils/format'

export default function DocumentListPage() {
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [editingDoc, setEditingDoc] = useState<{ id: string; title: string; content: string } | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const { list, isLoading, createDoc, updateDoc, deleteDoc, uploadDoc, isUploading } = useDocuments({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    keyword: keyword || undefined,
  })
  const { startTask } = useVectorTask()

  const documents = list?.list ?? []
  const total = list?.total ?? 0
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  const handleCreate = () => {
    if (!newTitle.trim()) return
    createDoc({ title: newTitle, content: newContent, type: 'txt' })
    setShowCreateDialog(false)
    setNewTitle('')
    setNewContent('')
  }

  const handleEdit = () => {
    if (!editingDoc || !editingDoc.title.trim()) return
    updateDoc({ id: editingDoc.id, data: { title: editingDoc.title, content: editingDoc.content } })
    setEditingDoc(null)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">文档管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4" />
            上传文件
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            新建文档
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜索文档..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">向量状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    加载中...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p className="text-sm">暂无文档</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{doc.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="uppercase">{doc.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <TaskStatusBadge status={doc.vectorStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(doc.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {doc.vectorStatus === VectorTaskStatus.PENDING && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startTask(doc.id)} title="向量化">
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDoc({ id: doc.id, title: doc.title, content: doc.content })} title="编辑">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm('确认删除？')) deleteDoc(doc.id) }} title="删除">
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
        {/* Pagination */}
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
            <DialogTitle>新建文档</DialogTitle>
            <DialogDescription>创建文本文档</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="文档标题" />
            </div>
            <div className="space-y-2">
              <Label>内容</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="文档内容..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文档</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>标题</Label>
              <Input value={editingDoc?.title || ''} onChange={(e) => setEditingDoc(editingDoc ? { ...editingDoc, title: e.target.value } : null)} />
            </div>
            <div className="space-y-2">
              <Label>内容</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={editingDoc?.content || ''}
                onChange={(e) => setEditingDoc(editingDoc ? { ...editingDoc, content: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoc(null)}>取消</Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription>支持 TXT / MD / PDF 格式</DialogDescription>
          </DialogHeader>
          <FileUpload
            onFileSelect={(file) => {
              uploadDoc(file)
              setShowUploadDialog(false)
            }}
            isUploading={isUploading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
