import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type DialogTitleComponentProps = HTMLAttributes<HTMLHeadingElement>

export function DialogTitleComponent(props: DialogTitleComponentProps): JSX.Element {
  const { className, children, ...titleProps } = props

  return (
    <h2 className={cn('ui-dialog-title', className)} {...titleProps}>
      {children}
    </h2>
  )
}
