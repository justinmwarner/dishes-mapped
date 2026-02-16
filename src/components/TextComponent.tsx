import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type TextComponentProps = HTMLAttributes<HTMLParagraphElement>

export function TextComponent(props: TextComponentProps): JSX.Element {
  const { className, children, ...textProps } = props

  return (
    <p className={cn('ui-text', className)} {...textProps}>
      {children}
    </p>
  )
}
