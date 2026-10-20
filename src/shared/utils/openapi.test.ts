import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
const root = resolve(import.meta.dirname, '../../..')
const contract = JSON.parse(readFileSync(resolve(root, 'docs/openapi.json'), 'utf8')) as {
  paths: Record<string, Record<string, unknown>>
}
it('all feature API methods exist in the captured backend OpenAPI', () => {
  let checked = 0
  for (const feature of readdirSync(resolve(root, 'src/features'))) {
    const file = resolve(root, 'src/features', feature, 'api/index.ts')
    let source: string
    try {
      source = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    for (const match of source.matchAll(
      /\b(get|post|put|patch|del)(?:<[^\n]*?>)?\(\s*['"]([^'"]+)['"]/g
    )) {
      const method = match[1] === 'del' ? 'delete' : match[1]
      expect(
        contract.paths['/api' + match[2]]?.[method],
        feature + ': ' + method + ' ' + match[2]
      ).toBeDefined()
      checked++
    }
  }
  expect(checked).toBeGreaterThan(20)
})

it('the SSE endpoint exists as POST in the captured backend OpenAPI', () => {
  const source = readFileSync(resolve(root, 'src/features/chat/api/index.ts'), 'utf8')
  const path = source.match(/url: ['"]([^'"]+)['"]/)?.[1]
  expect(path).toBe('/conversations/ask/stream')
  expect(contract.paths['/api' + path]?.post).toBeDefined()
})
