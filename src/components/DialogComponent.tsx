import type { DialogHTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type DialogComponentProps = DialogHTMLAttributes<HTMLDialogElement>

export function DialogComponent(props: DialogComponentProps): JSX.Element {
  const { className, children, ...dialogProps } = props

  return (
    <dialog className={cn('ui-dialog', className)} {...dialogProps}>
      {children}
    </dialog>
  )
}
