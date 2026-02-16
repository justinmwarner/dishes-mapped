import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type PageShellComponentProps = HTMLAttributes<HTMLElement>

export function PageShellComponent(props: PageShellComponentProps): JSX.Element {
  const { className, children, ...mainProps } = props

  return (
    <main className={cn('app-shell', className)} {...mainProps}>
      {children}
    </main>
  )
}
