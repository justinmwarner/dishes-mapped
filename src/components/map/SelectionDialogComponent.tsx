import { useEffect, useRef, useState } from 'react'
import type { JSX, MouseEvent as ReactMouseEvent } from 'react'
import { ButtonComponent } from '../ButtonComponent'
import { DialogComponent } from '../DialogComponent'
import { DialogContentComponent } from '../DialogContentComponent'
import { DialogHeaderComponent } from '../DialogHeaderComponent'
import { DialogTitleComponent } from '../DialogTitleComponent'
import { DishListComponent } from '../DishListComponent'
import { DishListItemComponent } from '../DishListItemComponent'
import { TextComponent } from '../TextComponent'
import { buildSearchUrl } from '../../map/utils'
import type { ActiveSelection } from '../../map/types'

type SelectionDialogComponentProps = {
  selection: ActiveSelection | null
  onClose(): void
}

type DragState = {
  startMouseX: number
  startMouseY: number
  startOffsetX: number
  startOffsetY: number
}

export function SelectionDialogComponent(props: SelectionDialogComponentProps): JSX.Element | null {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStateRef = useRef<DragState | null>(null)

  useEffect(() => {
    function handleMouseMove(event: MouseEvent): void {
      const dragState = dragStateRef.current
      if (!dragState) {
        return
      }

      setOffset({
        x: dragState.startOffsetX + (event.clientX - dragState.startMouseX),
        y: dragState.startOffsetY + (event.clientY - dragState.startMouseY),
      })
    }

    function handleMouseUp(): void {
      dragStateRef.current = null
      document.body.classList.remove('group-dialog-dragging')
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.classList.remove('group-dialog-dragging')
    }
  }, [])

  if (!props.selection) {
    return null
  }

  function handleStartDrag(event: ReactMouseEvent<HTMLElement>): void {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    dragStateRef.current = {
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    }
    document.body.classList.add('group-dialog-dragging')
  }

  return (
    <DialogComponent
      open
      className="group-dialog"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      <DialogContentComponent>
        <DialogHeaderComponent className="group-dialog-drag-handle" onMouseDown={handleStartDrag}>
          <DialogTitleComponent>{props.selection.title}</DialogTitleComponent>
          <ButtonComponent type="button" tone="ghost" onClick={props.onClose}>
            Close
          </ButtonComponent>
        </DialogHeaderComponent>
        <TextComponent>Open a dish in your search engine (Kagi by default).</TextComponent>
        <DishListComponent>
          {props.selection.labels.map(label => (
            <DishListItemComponent key={label} label={label} url={buildSearchUrl(label)} />
          ))}
        </DishListComponent>
      </DialogContentComponent>
    </DialogComponent>
  )
}
