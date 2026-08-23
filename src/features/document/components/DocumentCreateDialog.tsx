import { useEffect, useState } from 'react'
import { FileUpload } from './FileUpload'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { UploadedFile } from '../types'

interface DocumentCreateDialogProps {
  open: boolean
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { fileId: number; title: string; description: string }) => void
}

export function DocumentCreateDialog({
  open,
  submitting,
  onOpenChange,
  onSubmit
}: DocumentCreateDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState<UploadedFile[]>([])
  useEffect(() => {
    if (!open) return
    setTitle('')
    setDescription('')
    setFileList([])
  }, [open])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增文档</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">标题</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="留空时使用文件名"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-description">描述</Label>
            <textarea
              id="document-description"
              className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <FileUpload fileList={fileList} onFileListChange={setFileList} />
          <DialogFooter>
            <Button
              onClick={() =>
                fileList[0] &&
                onSubmit({
                  fileId: fileList[0].fileId,
                  title: title.trim() || fileList[0].filename,
                  description: description.trim()
                })
              }
              disabled={fileList.length === 0 || submitting}
            >
              {submitting ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
