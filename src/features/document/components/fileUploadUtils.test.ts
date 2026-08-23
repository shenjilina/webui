import { describe, expect, it } from 'vitest'
import { appendUploadedFiles, getRemainingUploadCapacity } from './fileUploadUtils'

describe('file upload list helpers', () => {
  it('appends uploaded files without clearing existing entries', () => {
    expect(
      appendUploadedFiles(
        [{ fileId: 1, filename: 'one.pdf' }],
        [{ fileId: 2, filename: 'two.pdf' }],
        3
      )
    ).toEqual([
      { fileId: 1, filename: 'one.pdf' },
      { fileId: 2, filename: 'two.pdf' }
    ])
  })

  it('caps appended files and restores capacity after local removal', () => {
    const files = appendUploadedFiles(
      [{ fileId: 1, filename: 'one.pdf' }],
      [{ fileId: 2, filename: 'two.pdf' }],
      1
    )
    expect(files).toHaveLength(1)
    expect(getRemainingUploadCapacity([], 1)).toBe(1)
  })
})
