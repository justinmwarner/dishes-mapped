import type { JSX } from 'react'
import { LinkComponent } from './LinkComponent'

type DishListItemComponentProps = {
  label: string
  url: string
}

export function DishListItemComponent(props: DishListItemComponentProps): JSX.Element {
  return (
    <li className="dish-list-item">
      <LinkComponent href={props.url} target="_blank" rel="noreferrer noopener">
        {props.label}
      </LinkComponent>
    </li>
  )
}
