import { useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import type { JSX } from 'react'
import dishMapData from './data/DISH-MAP.json'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Link } from './components/ui/link'
import { H2, Text } from './components/ui/typography'

type DishItem = {
  Label: string
  Location: {
    Latitude: number
    Longitude: number
  } | null
}

type DishGroup = {
  id: string
  location: LatLngExpression
  labels: string[]
}

type DishGroupMarkerProps = {
  group: DishGroup
  onSelect(group: DishGroup): void
}

const mapCenter: LatLngExpression = [20, 0]
const dishGroups: DishGroup[] = buildDishGroups(dishMapData.Items as DishItem[])

function buildDishGroups(items: DishItem[]): DishGroup[] {
  const groupedItems = new Map<string, DishGroup>()

  for (const item of items) {
    if (!item.Location) {
      continue
    }

    const latitude = item.Location.Latitude
    const longitude = item.Location.Longitude
    const key = `${latitude},${longitude}`
    let group = groupedItems.get(key)

    if (!group) {
      group = {
        id: key,
        location: [latitude, longitude],
        labels: [],
      }
      groupedItems.set(key, group)
    }

    group.labels.push(item.Label)
  }

  return Array.from(groupedItems.values())
}

function buildWikipediaSearchUrl(label: string): string {
  const encodedLabel = encodeURIComponent(label)
  return `https://en.wikipedia.org/w/index.php?search=${encodedLabel}`
}

function formatTooltipLabel(group: DishGroup): string {
  if (group.labels.length > 1) {
    return `${group.labels.length} dishes in this location`
  }

  return group.labels[0]
}

function getMarkerRadius(count: number): number {
  if (count > 1) {
    return 4
  }

  return 2
}

function DishGroupMarker(props: DishGroupMarkerProps): JSX.Element {
  const group = props.group

  function handleClick(): void {
    props.onSelect(group)
  }

  return (
    <CircleMarker
      center={group.location}
      radius={getMarkerRadius(group.labels.length)}
      pathOptions={{
        color: '#111827',
        weight: group.labels.length > 1 ? 2 : 1,
        fillColor: '#111827',
        fillOpacity: group.labels.length > 1 ? 0.85 : 0.55,
      }}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" opacity={0.95}>
        {formatTooltipLabel(group)}
      </Tooltip>
    </CircleMarker>
  )
}

export default function App(): JSX.Element {
  const [activeGroup, setActiveGroup] = useState<DishGroup | null>(null)

  function handleCloseDialog(): void {
    setActiveGroup(null)
  }

  function handleSelectGroup(group: DishGroup): void {
    setActiveGroup(group)
  }

  function renderMarkers(): JSX.Element[] {
    const markerElements: JSX.Element[] = []

    for (const group of dishGroups) {
      markerElements.push(
        <DishGroupMarker key={group.id} group={group} onSelect={handleSelectGroup} />,
      )
    }

    return markerElements
  }

  function renderDialogLinks(): JSX.Element[] {
    const dishLinks: JSX.Element[] = []

    if (!activeGroup) {
      return dishLinks
    }

    for (const label of activeGroup.labels) {
      dishLinks.push(
        <li key={label} className="dish-list-item">
          <Link href={buildWikipediaSearchUrl(label)} target="_blank" rel="noreferrer noopener">
            {label}
          </Link>
        </li>,
      )
    }

    return dishLinks
  }

  function renderDialog(): JSX.Element | null {
    if (!activeGroup) {
      return null
    }

    return (
      <Dialog open className="group-dialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <H2>{activeGroup.labels.length > 1 ? 'Dishes in this location' : 'Dish'}</H2>
            </DialogTitle>
            <Button type="button" tone="ghost" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogHeader>
          <Text>Open a dish to search it on Wikipedia.</Text>
          <ul className="dish-list">{renderDialogLinks()}</ul>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <main className="app-shell">
      <MapContainer
        center={mapCenter}
        zoom={2}
        minZoom={2}
        preferCanvas
        className="map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        {renderMarkers()}
      </MapContainer>
      {renderDialog()}
    </main>
  )
}
