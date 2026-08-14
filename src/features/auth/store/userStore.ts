import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storage } from '@/shared/utils/storage'
import type { UserInfo } from '../types'

interface UserState {
  token: string | null
  userInfo: UserInfo | null
  isLogin: boolean
  login: (token: string, userInfo: UserInfo) => void
  logout: () => void
  updateUserInfo: (info: Partial<UserInfo>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      isLogin: false,

      login: (token, userInfo) => {
        // 同步写入 storage，保证 http/sse 拦截器能读取到 token
        storage.setToken(token)
        set({
          token,
          userInfo,
          isLogin: true,
        })
      },

      logout: () => {
        storage.removeToken()
        set({
          token: null,
          userInfo: null,
          isLogin: false,
        })
      },

      updateUserInfo: (info) =>
        set((state) => ({
          userInfo: state.userInfo ? { ...state.userInfo, ...info } : null,
        })),
    }),
    {
      name: 'rag-user-store',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
        isLogin: state.isLogin,
      }),
    },
  ),
)

// 页面刷新后：将 persist 恢复的 token 回写 storage，保持两处一致
const restored = useUserStore.getState()
if (restored.token) {
  storage.setToken(restored.token)
} else {
  storage.removeToken()
}

// 全局 401 事件：http 层触发，同步清空登录态（避免路由守卫状态不一致）
window.addEventListener('auth:unauthorized', () => {
  useUserStore.getState().logout()
})
