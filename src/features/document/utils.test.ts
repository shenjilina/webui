import { describe, expect, it } from 'vitest'
import {
  canDeleteSourceFile,
  canRetryParsing,
  canStartParsing,
  isProcessingFile,
  mapDocumentsByFile
} from './utils'
import type { DocumentInfo, FileInfo } from './types'

const file: FileInfo = {
  id: 7,
  ownerId: 1,
  filename: 'report.pdf',
  fileType: 'pdf',
  mimeType: 'application/pdf',
  fileSize: 100,
  fileMd5: 'hash',
  status: 'UPLOADED',
  storageStatus: 'PRESENT',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
}

const document: DocumentInfo = {
  id: 9,
  fileId: 7,
  knowledgeBaseId: 3,
  title: 'report.pdf',
  description: null,
  chunkCount: 0,
  parseStatus: 'PENDING',
  errorMsg: null,
  vectorCleaned: false,
  fileSize: 100,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z'
}

describe('document file lifecycle helpers', () => {
  it('joins document records to their source file', () => {
    expect(mapDocumentsByFile([document]).get(file.id)).toEqual(document)
  })

  it('only enables first-time parsing for active source files with pending documents', () => {
    expect(canStartParsing(file, document, true)).toBe(true)
    expect(canStartParsing({ ...file, storageStatus: 'PHYSICAL_DELETED' }, document, true)).toBe(
      false
    )
    expect(canStartParsing(file, { ...document, parseStatus: 'SUCCESS' }, true)).toBe(false)
  })

  it('derives retry, deletion, and polling state from lifecycle statuses', () => {
    const failed = { ...file, status: 'PARSE_FAILED' as const }
    expect(canRetryParsing(failed, document, true)).toBe(true)
    expect(canRetryParsing(failed, document, false)).toBe(false)
    expect(isProcessingFile({ ...file, status: 'PARSING' })).toBe(true)
    expect(canDeleteSourceFile({ ...file, status: 'PARSING' }, true)).toBe(false)
    expect(canDeleteSourceFile(file, true)).toBe(true)
  })
})
