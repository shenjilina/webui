import { useCallback, useMemo, useState } from 'react'
import { FileText, Trash2, Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { ALLOWED_FILE_EXTENSIONS } from '@/shared/utils/constants'
import { validateFile } from '@/shared/utils/file'
import { uploadFiles } from '../api'
import type { UploadedFile } from '../types'
import { appendUploadedFiles, getRemainingUploadCapacity } from './fileUploadUtils'

export interface FileUploadProps {
  fileList?: UploadedFile[]
  maxFiles?: number
  onFileListChange?: (files: UploadedFile[]) => void
  onUploaded?: (fileId: number, filename: string) => void
  className?: string
}

export function FileUpload({
  fileList = [],
  maxFiles = 1,
  onFileListChange,
  onUploaded,
  className
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const effectiveMaxFiles = Math.max(1, maxFiles)
  const remainingCapacity = useMemo(
    () => getRemainingUploadCapacity(fileList, effectiveMaxFiles),
    [effectiveMaxFiles, fileList]
  )
  const isFull = remainingCapacity === 0

  const upload = useCallback(
    async (files: File[]) => {
      if (isFull) {
        toast.error(`最多只能上传 ${effectiveMaxFiles} 个文件`)
        return
      }
      const validFiles = files.filter((file) => {
        const result = validateFile(file)
        if (!result.valid) toast.error(result.error)
        return result.valid
      })
      const filesToUpload = validFiles.slice(0, remainingCapacity)
      if (validFiles.length > filesToUpload.length) {
        toast.error(`最多还能上传 ${remainingCapacity} 个文件`)
      }
      if (filesToUpload.length === 0) return

      setIsUploading(true)
      try {
        const results = await uploadFiles(filesToUpload)
        const uploadedFiles = results.flatMap((result) => {
          const fileId = result.fileId ?? result.file?.id
          return fileId ? [{ fileId, filename: result.filename }] : []
        })
        const failed = results.length - uploadedFiles.length
        if (uploadedFiles.length > 0) {
          onFileListChange?.(appendUploadedFiles(fileList, uploadedFiles, effectiveMaxFiles))
          uploadedFiles.forEach((file) => onUploaded?.(file.fileId, file.filename))
          toast.success(`已上传 ${uploadedFiles.length} 个文件`)
        }
        if (failed > 0) toast.error(`${failed} 个文件上传失败`)
      } finally {
        setIsUploading(false)
      }
    },
    [effectiveMaxFiles, fileList, isFull, onFileListChange, onUploaded, remainingCapacity]
  )

  const onDrop = useCallback((acceptedFiles: File[]) => void upload(acceptedFiles), [upload])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: true,
    multiple: true,
    maxFiles: 0,
    disabled: isUploading || isFull
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isFull || isUploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50',
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          ) : (
            <Upload className="text-muted-foreground h-6 w-6" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isFull ? `已达到最多 ${effectiveMaxFiles} 个文件` : '拖拽文件到此处，或选择文件'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              支持 {ALLOWED_FILE_EXTENSIONS.join(' / ')}，单个文件最大 100MB
            </p>
          </div>
        </div>
      </div>
      {fileList.length > 0 && (
        <div className="space-y-1">
          {fileList.map((file) => (
            <div
              key={file.fileId}
              className="bg-muted/50 flex items-center gap-2 rounded-md px-3 py-2"
            >
              <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-sm">{file.filename}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                disabled={isUploading}
                title="从列表移除"
                onClick={() =>
                  onFileListChange?.(fileList.filter((item) => item.fileId !== file.fileId))
                }
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
