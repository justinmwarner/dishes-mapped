import type { JSX } from 'react'
import { ButtonComponent } from '../ButtonComponent'
import { DialogComponent } from '../DialogComponent'
import { DialogContentComponent } from '../DialogContentComponent'
import { DialogHeaderComponent } from '../DialogHeaderComponent'
import { DialogTitleComponent } from '../DialogTitleComponent'
import { DishListComponent } from '../DishListComponent'
import { DishListItemComponent } from '../DishListItemComponent'
import { TextComponent } from '../TextComponent'
import { buildWikipediaSearchUrl } from '../../map/utils'
import type { ActiveSelection } from '../../map/types'

type SelectionDialogComponentProps = {
  selection: ActiveSelection | null
  onClose(): void
}

export function SelectionDialogComponent(props: SelectionDialogComponentProps): JSX.Element | null {
  if (!props.selection) {
    return null
  }

  return (
    <DialogComponent open className="group-dialog">
      <DialogContentComponent>
        <DialogHeaderComponent>
          <DialogTitleComponent>{props.selection.title}</DialogTitleComponent>
          <ButtonComponent type="button" tone="ghost" onClick={props.onClose}>
            Close
          </ButtonComponent>
        </DialogHeaderComponent>
        <TextComponent>Open a dish to search it on Wikipedia.</TextComponent>
        <DishListComponent>
          {props.selection.labels.map(label => (
            <DishListItemComponent key={label} label={label} url={buildWikipediaSearchUrl(label)} />
          ))}
        </DishListComponent>
      </DialogContentComponent>
    </DialogComponent>
  )
}
