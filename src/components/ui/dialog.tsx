import type { DialogHTMLAttributes, HTMLAttributes, JSX } from 'react'
import { cn } from '../../lib/utils'

type DialogProps = DialogHTMLAttributes<HTMLDialogElement>
type DivProps = HTMLAttributes<HTMLDivElement>
type HeadingProps = HTMLAttributes<HTMLHeadingElement>

export function Dialog(props: DialogProps): JSX.Element {
  const { className, children, ...dialogProps } = props

  return (
    <dialog className={cn('ui-dialog', className)} {...dialogProps}>
      {children}
    </dialog>
  )
}

export function DialogContent(props: DivProps): JSX.Element {
  const { className, children, ...contentProps } = props

  return (
    <div className={cn('ui-dialog-content', className)} {...contentProps}>
      {children}
    </div>
  )
}

export function DialogHeader(props: DivProps): JSX.Element {
  const { className, children, ...headerProps } = props

  return (
    <header className={cn('ui-dialog-header', className)} {...headerProps}>
      {children}
    </header>
  )
}

export function DialogTitle(props: HeadingProps): JSX.Element {
  const { className, children, ...titleProps } = props

  return (
    <h2 className={cn('ui-dialog-title', className)} {...titleProps}>
      {children}
    </h2>
  )
}
