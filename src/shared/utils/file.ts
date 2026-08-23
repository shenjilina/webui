import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from './constants'

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/**
 * 校验文件格式与大小
 */
export function validateFile(file: File): FileValidationResult {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!ALLOWED_FILE_EXTENSIONS.includes(ext as (typeof ALLOWED_FILE_EXTENSIONS)[number])) {
    return {
      valid: false,
      error: `不支持的文件格式: ${ext}，仅支持 PDF / DOCX / TXT / MD / MARKDOWN`
    }
  }

  if (file.size === 0) {
    return { valid: false, error: '文件内容为空' }
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxMB = Math.round(MAX_FILE_SIZE / 1024 / 1024)
    return { valid: false, error: `文件大小超过限制（最大 ${maxMB}MB）` }
  }

  return { valid: true }
}

/**
 * 预留：分片上传参数计算
 */
export function calculateChunks(
  file: File,
  chunkSize: number = 2 * 1024 * 1024
): {
  totalChunks: number
  chunks: Blob[]
} {
  const totalChunks = Math.ceil(file.size / chunkSize)
  const chunks: Blob[] = []
  for (let i = 0; i < totalChunks; i++) {
    chunks.push(file.slice(i * chunkSize, (i + 1) * chunkSize))
  }
  return { totalChunks, chunks }
}
