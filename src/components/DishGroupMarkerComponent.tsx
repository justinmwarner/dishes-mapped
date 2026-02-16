import { CircleMarker, Tooltip } from 'react-leaflet'
import type { PathOptions } from 'leaflet'
import type { JSX } from 'react'

type DishGroupMarkerComponentProps = {
  id: string
  location: [number, number]
  labels: string[]
  markerStyle: PathOptions
  onSelectGroup(groupId: string): void
  onOpenPrimaryLink(label: string): void
}

export function DishGroupMarkerComponent(props: DishGroupMarkerComponentProps): JSX.Element {
  function handleClick(): void {
    props.onSelectGroup(props.id)

    if (props.labels.length > 0) {
      props.onOpenPrimaryLink(props.labels[0])
    }
  }

  return (
    <CircleMarker
      center={props.location}
      radius={10}
      pathOptions={props.markerStyle}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" opacity={0.95}>
        {formatTooltipLabel(props.labels)}
      </Tooltip>
    </CircleMarker>
  )
}

function formatTooltipLabel(labels: string[]): string {
  if (labels.length > 1) {
    return `${labels.length} dishes in this location`
  }

  return labels[0]
}
