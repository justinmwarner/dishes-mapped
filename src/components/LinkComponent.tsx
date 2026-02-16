import type { AnchorHTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type LinkComponentProps = AnchorHTMLAttributes<HTMLAnchorElement>

export function LinkComponent(props: LinkComponentProps): JSX.Element {
  const { className, children, ...anchorProps } = props

  return (
    <a className={cn('ui-link', className)} {...anchorProps}>
      {children}
    </a>
  )
}
