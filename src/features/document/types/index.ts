export type FileStatus =
  | 'UPLOADING'
  | 'UPLOAD_CANCELLED'
  | 'UPLOADED'
  | 'PARSE_PENDING'
  | 'PARSING'
  | 'SUCCESS'
  | 'PARSE_FAILED'

export type FileStorageStatus = 'PRESENT' | 'PHYSICAL_DELETED'
export type DocumentParseStatus = 'PENDING' | 'PARSING' | 'SUCCESS' | 'FAILED'

export interface FileInfo {
  id: number
  ownerId: number
  filename: string
  fileType: string | null
  mimeType: string | null
  fileSize: number
  fileMd5: string
  status: FileStatus
  storageStatus: FileStorageStatus
  createdAt: string
  updatedAt: string
}

export interface DocumentInfo {
  id: number
  fileId: number
  knowledgeBaseId: number
  title: string
  description: string | null
  chunkCount: number
  parseStatus: DocumentParseStatus
  errorMsg: string | null
  vectorCleaned: boolean
  fileSize: number
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface FileUploadResult {
  filename: string
  accepted: boolean
  file: FileInfo | null
  fileId: number | null
  error: string | null
}

export interface UploadedFile {
  fileId: number
  filename: string
}

export interface DocumentCreateRequest {
  fileId: number
  knowledgeBaseId: number
  title: string
  description?: string | null
}

export interface DocumentListRequest {
  knowledgeBaseId: number
  parseStatus?: DocumentParseStatus | null
  page?: number
  pageSize?: number
}

export interface FileListRequest {
  knowledgeBaseId: number
  fileStatus?: FileStatus | null
  page?: number
  pageSize?: number
}

export interface FileIdRequest {
  fileId: number
}

export interface DocumentIdRequest {
  documentId: number
}

export interface ParseDocumentRequest extends FileIdRequest {
  retry?: boolean
}

export interface ChunkInfo {
  id: number
  chunkIndex: number
  content: string
  createdAt: string
}
