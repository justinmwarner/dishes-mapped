import type { ButtonHTMLAttributes, JSX } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'ghost'
}

export function Button(props: ButtonProps): JSX.Element {
  const { className, tone = 'default', ...buttonProps } = props

  return (
    <button
      className={cn('ui-button', tone === 'ghost' ? 'ui-button-ghost' : null, className)}
      {...buttonProps}
    />
  )
}
