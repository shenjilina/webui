import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileUpload } from './FileUpload'
import { listAllFiles } from '../api'
import { useUserStore } from '@/features/auth/store/userStore'
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
interface Props {
  open: boolean
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: { fileId: number; title: string; description: string }) => void
}
export function DocumentCreateDialog({ open, submitting, onOpenChange, onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileList, setFileList] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const userId = useUserStore((state) => state.userInfo?.id)
  const client = useQueryClient()
  const files = useQuery({ queryKey: ['files', userId], queryFn: listAllFiles, enabled: open })
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setFileList([])
      setError('')
    }
  }, [open])
  const submit = () => {
    if (!fileList.length) {
      setError('请选择已上传文件或上传新文件')
      return
    }
    const effectiveTitle = title.trim() || fileList[0].filename
    if (!effectiveTitle || effectiveTitle.length > 255 || description.length > 2000) {
      setError('标题需为 1–255 字，描述最多 2000 字')
      return
    }
    if (!submitting)
      onSubmit({
        fileId: fileList[0].fileId,
        title: effectiveTitle,
        description: description.trim()
      })
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!submitting) onOpenChange(value)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>关联源文件，创建文档</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">标题（留空使用文件名）</Label>
            <Input
              id="document-title"
              value={title}
              maxLength={255}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="document-description">描述（可选）</Label>
            <textarea
              id="document-description"
              className="bg-background min-h-20 w-full rounded-md border p-2 text-sm"
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="existing-file">选择已上传文件</Label>
            <select
              id="existing-file"
              className="bg-background w-full rounded-md border p-2 text-sm"
              disabled={submitting || files.isLoading}
              value={fileList[0]?.fileId ?? ''}
              onChange={(e) => {
                const file = files.data?.find((item) => item.id === Number(e.target.value))
                setFileList(file ? [{ fileId: file.id, filename: file.filename }] : [])
              }}
            >
              <option value="">请选择文件</option>
              {files.data
                ?.filter((file) => file.storageStatus === 'PRESENT')
                .map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.filename}（#{file.id}）
                  </option>
                ))}
            </select>
            {files.isError && (
              <p role="alert" className="text-destructive text-xs">
                已有文件加载失败 <button onClick={() => void files.refetch()}>重试</button>
              </p>
            )}
          </div>
          {!submitting && (
            <FileUpload
              fileList={fileList}
              onFileListChange={setFileList}
              onUploaded={() => {
                void client.invalidateQueries({ queryKey: ['files'] })
              }}
            />
          )}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? '创建中…' : '创建文档'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
