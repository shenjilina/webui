import { create } from 'zustand'
import { storage } from '@/shared/utils/storage'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

function applyThemeToDOM(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// 初始化时从 localStorage 读取，或跟随系统偏好
const initialTheme = storage.getTheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
applyThemeToDOM(initialTheme)

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: initialTheme,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      storage.setTheme(next)
      applyThemeToDOM(next)
      return { theme: next }
    }),

  setTheme: (theme) => {
    storage.setTheme(theme)
    applyThemeToDOM(theme)
    set({ theme })
  },
}))
