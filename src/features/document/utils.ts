import type { DocumentInfo, FileInfo, FileStatus } from './types'

const processingStatuses: FileStatus[] = ['UPLOADING', 'PARSE_PENDING', 'PARSING']

export function mapDocumentsByFile(documents: DocumentInfo[]) {
  return new Map(documents.map((document) => [document.fileId, document]))
}

export function isProcessingFile(file: FileInfo) {
  return processingStatuses.includes(file.status)
}

export function canStartParsing(
  file: FileInfo,
  document: DocumentInfo | undefined,
  writable: boolean
) {
  return (
    writable &&
    file.storageStatus === 'PRESENT' &&
    file.status === 'UPLOADED' &&
    document?.parseStatus === 'PENDING'
  )
}

export function canRetryParsing(
  file: FileInfo,
  document: DocumentInfo | undefined,
  writable: boolean
) {
  return (
    writable &&
    file.storageStatus === 'PRESENT' &&
    (file.status === 'PARSE_FAILED' || document?.parseStatus === 'FAILED')
  )
}

export function canDeleteSourceFile(file: FileInfo, writable: boolean) {
  return writable && file.storageStatus === 'PRESENT' && !isProcessingFile(file)
}
