import type { HTMLAttributes, JSX } from 'react'
import { cn } from '../lib/utils'

type DishListComponentProps = HTMLAttributes<HTMLUListElement>

export function DishListComponent(props: DishListComponentProps): JSX.Element {
  const { className, children, ...listProps } = props

  return (
    <ul className={cn('dish-list', className)} {...listProps}>
      {children}
    </ul>
  )
}
