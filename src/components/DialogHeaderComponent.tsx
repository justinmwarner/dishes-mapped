import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type DialogHeaderComponentProps = HTMLAttributes<HTMLDivElement>

export function DialogHeaderComponent(props: DialogHeaderComponentProps): JSX.Element {
  const { className, children, ...headerProps } = props

  return (
    <header className={cn('ui-dialog-header', className)} {...headerProps}>
      {children}
    </header>
  )
}
