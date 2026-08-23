import { post } from '@/shared/utils/http'
import type {
  ChunkInfo,
  DocumentCreateRequest,
  DocumentIdRequest,
  DocumentInfo,
  DocumentListRequest,
  FileIdRequest,
  FileInfo,
  FileListRequest,
  FileStatus,
  FileUploadResult,
  PageResponse,
  ParseDocumentRequest
} from '../types'

export function uploadFiles(files: File[]): Promise<FileUploadResult[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return post<FileUploadResult[]>('/files/upload', formData)
}

export function listFiles(data: FileListRequest): Promise<PageResponse<FileInfo>> {
  return post<PageResponse<FileInfo>>('/files/list', data)
}

export function getFileDetail(data: FileIdRequest): Promise<FileInfo> {
  return post<FileInfo>('/files/detail', data)
}

export function deleteFileSource(data: FileIdRequest): Promise<void> {
  return post<void>('/files/delete-source', data)
}

export function createDocument(data: DocumentCreateRequest): Promise<DocumentInfo> {
  return post<DocumentInfo>('/documents/create', data)
}

export function listDocuments(data: DocumentListRequest): Promise<PageResponse<DocumentInfo>> {
  return post<PageResponse<DocumentInfo>>('/documents/list', data)
}

export function getDocumentDetail(data: DocumentIdRequest): Promise<DocumentInfo> {
  return post<DocumentInfo>('/documents/detail', data)
}

export function deleteDocument(data: DocumentIdRequest): Promise<void> {
  return post<void>('/documents/delete', data)
}

export function parseDocument(
  data: ParseDocumentRequest
): Promise<{ fileId: number; documentId: number; status: FileStatus }> {
  return post<{ fileId: number; documentId: number; status: FileStatus }>('/documents/parse', data)
}

export function retryDocuments(knowledgeBaseId: number): Promise<{ queuedFileIds: number[] }> {
  return post<{ queuedFileIds: number[] }>('/documents/retry', { knowledgeBaseId })
}

export function listDocumentChunks(
  documentId: number,
  page = 1,
  pageSize = 20
): Promise<PageResponse<ChunkInfo>> {
  return post<PageResponse<ChunkInfo>>('/documents/chunks', { documentId, page, pageSize })
}
