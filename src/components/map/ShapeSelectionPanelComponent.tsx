import type { JSX } from 'react'
import { ButtonComponent } from '../ButtonComponent'
import { DialogTitleComponent } from '../DialogTitleComponent'
import { DishListComponent } from '../DishListComponent'
import { DishListItemComponent } from '../DishListItemComponent'
import { TextComponent } from '../TextComponent'
import { buildSearchUrl } from '../../map/utils'
import type { ShapeListItem } from '../../map/types'

type ShapeSelectionPanelComponentProps = {
  drawMode: boolean
  isDrawingInProgress: boolean
  shapeItems: ShapeListItem[]
  onToggleDrawMode(): void
  onClearShape(): void
}

export function ShapeSelectionPanelComponent(props: ShapeSelectionPanelComponentProps): JSX.Element {
  const shouldShowItems = !props.isDrawingInProgress

  return (
    <section className="shape-panel">
      <DialogTitleComponent>Draw shape selection</DialogTitleComponent>
      <TextComponent>
        Enable drawing, then click-and-drag on the map to draw a circle. Items are sorted by
        distance to your current map center.
      </TextComponent>
      <div className="shape-actions">
        <ButtonComponent
          type="button"
          className={props.drawMode ? 'theme-button-active' : undefined}
          onClick={props.onToggleDrawMode}
        >
          {props.drawMode ? 'Drawing enabled' : 'Enable drawing'}
        </ButtonComponent>
        <ButtonComponent type="button" tone="ghost" onClick={props.onClearShape}>
          Clear shape
        </ButtonComponent>
      </div>
      <DishListComponent>
        {!shouldShowItems ? (
          <li className="dish-list-item shape-list-empty">
            <TextComponent>Release to finish drawing, then the matching dishes will appear.</TextComponent>
          </li>
        ) : props.shapeItems.length === 0 ? (
          <li className="dish-list-item shape-list-empty">
            <TextComponent>Draw a shape to list all dishes inside it.</TextComponent>
          </li>
        ) : (
          props.shapeItems.map(item => (
            <DishListItemComponent
              key={item.id}
              label={`${item.label} · ${Math.round(item.distanceFromViewCenter / 1000)} km`}
              url={buildSearchUrl(item.label)}
            />
          ))
        )}
      </DishListComponent>
    </section>
  )
}
