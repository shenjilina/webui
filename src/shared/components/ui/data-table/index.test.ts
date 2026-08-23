import { describe, expect, it } from 'vitest'
import { getDataTableValue } from './index'

describe('getDataTableValue', () => {
  it('reads the configured column accessor from a generic row', () => {
    expect(getDataTableValue({ id: 3, name: 'knowledge' }, 'name')).toBe('knowledge')
  })

  it('returns undefined when a column is fully custom rendered', () => {
    expect(getDataTableValue({ id: 3 }, undefined)).toBeUndefined()
  })
})
