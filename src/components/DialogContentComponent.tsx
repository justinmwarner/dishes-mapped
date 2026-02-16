import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type DialogContentComponentProps = HTMLAttributes<HTMLDivElement>

export function DialogContentComponent(
  props: DialogContentComponentProps,
): JSX.Element {
  const { className, children, ...contentProps } = props

  return (
    <div className={cn('ui-dialog-content', className)} {...contentProps}>
      {children}
    </div>
  )
}
