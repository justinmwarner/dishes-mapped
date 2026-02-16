import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../../lib/utils'

type TypographyProps = HTMLAttributes<HTMLHeadingElement>
type TextProps = HTMLAttributes<HTMLParagraphElement>

export function H2(props: TypographyProps): JSX.Element {
  const { className, children, ...headingProps } = props

  return (
    <h2 className={cn('ui-h2', className)} {...headingProps}>
      {children}
    </h2>
  )
}

export function Text(props: TextProps): JSX.Element {
  const { className, children, ...textProps } = props

  return (
    <p className={cn('ui-text', className)} {...textProps}>
      {children}
    </p>
  )
}
