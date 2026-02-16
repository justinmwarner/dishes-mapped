import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type ThemePanelComponentProps = HTMLAttributes<HTMLElement>

export function ThemePanelComponent(props: ThemePanelComponentProps): JSX.Element {
  const { className, children, ...panelProps } = props

  return (
    <aside className={cn('theme-panel', className)} {...panelProps}>
      {children}
    </aside>
  )
}
