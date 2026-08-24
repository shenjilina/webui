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
  const [errors, setErrors] = useState({ title: '', description: '', file: '' })
  useEffect(() => {
    if (!open) return
    setTitle('')
    setDescription('')
    setFileList([])
    setErrors({ title: '', description: '', file: '' })
  }, [open])
  const handleSubmit = () => {
    const nextErrors = {
      title: title.trim() ? '' : '请输入标题',
      description: description.trim() ? '' : '请输入描述',
      file: fileList.length > 0 ? '' : '请上传文件'
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean) || submitting) return
    onSubmit({ fileId: fileList[0].fileId, title: title.trim(), description: description.trim() })
  }
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
              required
              aria-invalid={Boolean(errors.title)}
              onChange={(event) => {
                setTitle(event.target.value)
                if (errors.title && event.target.value.trim()) {
                  setErrors((current) => ({ ...current, title: '' }))
                }
              }}
              placeholder="留空时使用文件名"
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-description">描述</Label>
            <textarea
              id="document-description"
              className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={description}
              required
              aria-invalid={Boolean(errors.description)}
              onChange={(event) => {
                setDescription(event.target.value)
                if (errors.description && event.target.value.trim()) {
                  setErrors((current) => ({ ...current, description: '' }))
                }
              }}
            />
            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label>文件</Label>
            <FileUpload
              fileList={fileList}
              onFileListChange={(files) => {
                setFileList(files)
                if (files.length > 0) setErrors((current) => ({ ...current, file: '' }))
              }}
            />
            {errors.file && <p className="text-destructive text-xs">{errors.file}</p>}
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '提交'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
