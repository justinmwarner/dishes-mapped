import type { AnchorHTMLAttributes, JSX } from 'react'
import { cn } from '../../lib/utils'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

export function Link(props: LinkProps): JSX.Element {
  const { className, children, ...anchorProps } = props

  return (
    <a className={cn('ui-link', className)} {...anchorProps}>
      {children}
    </a>
  )
}
