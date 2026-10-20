import { beforeEach, expect, it, vi } from 'vitest'
import { useDocuments } from './useDocuments'
const state = vi.hoisted(() => ({
  queries: [] as { queryKey: unknown[]; enabled?: boolean }[],
  mutations: [] as { onSuccess?: () => void }[],
  invalidate: vi.fn()
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: state.invalidate }),
  useQuery: (options: { queryKey: unknown[]; enabled?: boolean }) => {
    state.queries.push(options)
    return { data: [], isLoading: false, isFetching: false, isError: false }
  },
  useMutation: (options: { onSuccess?: () => void }) => {
    state.mutations.push(options)
    return { mutate: vi.fn(), isPending: false }
  }
}))
vi.mock('@/features/auth/store/userStore', () => ({
  useUserStore: (selector: (store: { userInfo: { id: number } }) => unknown) =>
    selector({ userInfo: { id: 7 } })
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }))
beforeEach(() => {
  state.queries.length = 0
  state.mutations.length = 0
  state.invalidate.mockClear()
})
it('loads user files even without a selected knowledge base, while disabling documents', () => {
  useDocuments(null)
  expect(state.queries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ queryKey: ['files', 7], enabled: true }),
      expect.objectContaining({ queryKey: ['documents', null], enabled: false })
    ])
  )
})
it('invalidates cached detail and chunks after a parse is queued', () => {
  useDocuments(3)
  state.mutations[1].onSuccess?.()
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['document-detail'] })
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['document-chunks'] })
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['documents', 3] })
})
