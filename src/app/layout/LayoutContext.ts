import { createContext, useContext } from 'react'

interface LayoutContextValue {
  /** 左侧导航侧栏内的面板挂载点，页面可通过 portal 渲染自定义左侧内容（如会话列表） */
  leftPanelEl: HTMLElement | null
}

export const LayoutContext = createContext<LayoutContextValue>({ leftPanelEl: null })

export function useLayoutContext() {
  return useContext(LayoutContext)
}
