import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { validateFile } from '@/shared/utils/file'
import { ALLOWED_FILE_EXTENSIONS } from '@/shared/utils/constants'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isUploading?: boolean
  className?: string
}

export function FileUpload({ onFileSelect, isUploading, className }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const result = validateFile(file)
        if (!result.valid) {
          toast.error(result.error)
          return
        }
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50',
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {isUploading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? '松开以上传文件' : '拖拽文件到此处，或'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            支持 {ALLOWED_FILE_EXTENSIONS.join(' / ')} 格式，最大 10MB
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={open} disabled={isUploading}>
          <FileText className="h-4 w-4" />
          选择文件
        </Button>
      </div>
    </div>
  )
}

/** 已选文件展示 */
export function FilePreview({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm truncate flex-1">{name}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
