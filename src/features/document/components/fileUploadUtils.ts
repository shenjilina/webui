import type { UploadedFile } from '../types'

export function getRemainingUploadCapacity(fileList: UploadedFile[], maxFiles: number) {
  return Math.max(0, maxFiles - fileList.length)
}

export function appendUploadedFiles(
  fileList: UploadedFile[],
  uploadedFiles: UploadedFile[],
  maxFiles: number
) {
  return [...fileList, ...uploadedFiles].slice(0, maxFiles)
}
