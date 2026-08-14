import { useThemeStore } from '@/shared/store/themeStore'

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useThemeStore()
  return { theme, toggleTheme, setTheme }
}
