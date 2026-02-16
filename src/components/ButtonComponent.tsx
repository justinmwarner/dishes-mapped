import type { ButtonHTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type ButtonComponentProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'default' | 'ghost'
}

export function ButtonComponent(props: ButtonComponentProps): JSX.Element {
  const { className, tone = 'default', ...buttonProps } = props

  return (
    <button
      className={cn(
        'ui-button',
        tone === 'ghost' ? 'ui-button-ghost' : null,
        className,
      )}
      {...buttonProps}
    />
  )
}
