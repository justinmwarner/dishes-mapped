import { useMemo, useState } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import type { LatLngExpression, PathOptions } from 'leaflet'
import { latLng } from 'leaflet'
import type { JSX } from 'react'
import dishMapData from './data/DISH-MAP.json'
import { ButtonComponent } from './components/ButtonComponent'
import { DialogComponent } from './components/DialogComponent'
import { DialogContentComponent } from './components/DialogContentComponent'
import { DialogHeaderComponent } from './components/DialogHeaderComponent'
import { DialogTitleComponent } from './components/DialogTitleComponent'
import { DishListComponent } from './components/DishListComponent'
import { DishListItemComponent } from './components/DishListItemComponent'
import { PageShellComponent } from './components/PageShellComponent'
import { TextComponent } from './components/TextComponent'
import { ThemePanelComponent } from './components/ThemePanelComponent'

type ThemeName = 'brutalist-dark' | 'brutalist-light'

type DishItem = {
  Label: string
  Location: {
    Latitude: number
    Longitude: number
  } | null
}

type DishGroup = {
  id: string
  location: [number, number]
  labels: string[]
}

type ThemeConfig = {
  mapClassName: string
  baseUrl: string
  labelUrl: string
  countryOutlineUrl: string
  elevationUrl: string
  elevationOpacity: number
  attribution: string
}

type ActiveSelection = {
  id: string
  title: string
  labels: string[]
}

type DrawShape = {
  center: [number, number]
  radius: number
}

type ClusterPoint = {
  id: string
  center: [number, number]
  labels: string[]
  groupIds: string[]
  count: number
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

function getMarkerStyle(theme: ThemeName, count: number): PathOptions {
  if (theme === 'brutalist-light') {
    return {
      color: '#0f172a',
      weight: count > 1 ? 2.6 : 1.6,
      fillColor: '#0f172a',
      fillOpacity: count > 1 ? 0.96 : 0.65,
    }
  }

  return {
    color: '#f8fafc',
    weight: count > 1 ? 2.6 : 1.6,
    fillColor: '#f8fafc',
    fillOpacity: count > 1 ? 0.96 : 0.65,
  }
}

function getThemeConfig(theme: ThemeName): ThemeConfig {
  if (theme === 'brutalist-light') {
    return {
      mapClassName: 'map-theme-light',
      baseUrl: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      countryOutlineUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png',
      elevationUrl: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
      elevationOpacity: 0.26,
      attribution:
        '&copy; OpenStreetMap contributors &copy; CARTO &copy; Stadia Maps &copy; OpenTopoMap',
    }
  }

  return {
    mapClassName: 'map-theme-dark',
    baseUrl: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    labelUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    countryOutlineUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png',
    elevationUrl: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
    elevationOpacity: 0.22,
    attribution:
      '&copy; OpenStreetMap contributors &copy; CARTO &copy; Stadia Maps &copy; OpenTopoMap',
  }
}

function getThemePanelTitle(theme: ThemeName): string {
  if (theme === 'brutalist-light') {
    return 'Brutalist Light'
  }

  return 'Brutalist Dark'
}

function computeClusters(groups: DishGroup[], zoom: number): ClusterPoint[] {
  const clusterRadiusPx = Math.max(18, 54 - zoom * 3)
  const clusters: Array<{
    centerPoint: { x: number; y: number }
    latTotal: number
    lngTotal: number
    labels: string[]
    groupIds: string[]
    count: number
  }> = []

  for (const group of groups) {
    const [lat, lng] = group.location
    const scale = 2 ** zoom
    const x = ((lng + 180) / 360) * 256 * scale
    const latRad = (lat * Math.PI) / 180
    const mercatorY =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 256 * scale

    let joinedCluster = false

    for (const cluster of clusters) {
      const dx = x - cluster.centerPoint.x
      const dy = mercatorY - cluster.centerPoint.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= clusterRadiusPx) {
        cluster.count += 1
        cluster.latTotal += lat
        cluster.lngTotal += lng
        cluster.labels.push(...group.labels)
        cluster.groupIds.push(group.id)
        cluster.centerPoint.x = (cluster.centerPoint.x * (cluster.count - 1) + x) / cluster.count
        cluster.centerPoint.y =
          (cluster.centerPoint.y * (cluster.count - 1) + mercatorY) / cluster.count
        joinedCluster = true
        break
      }
    }

    if (!joinedCluster) {
      clusters.push({
        centerPoint: { x, y: mercatorY },
        latTotal: lat,
        lngTotal: lng,
        labels: [...group.labels],
        groupIds: [group.id],
        count: 1,
      })
    }
  }

  return clusters.map((cluster, index) => ({
    id: `cluster-${index}-${cluster.groupIds.join('|')}`,
    center: [cluster.latTotal / cluster.count, cluster.lngTotal / cluster.count],
    labels: cluster.labels,
    groupIds: cluster.groupIds,
    count: cluster.count,
  }))
}

function ClusterLayerComponent(props: {
  groups: DishGroup[]
  theme: ThemeName
  drawMode: boolean
  shape: DrawShape | null
  onShapeChange(shape: DrawShape | null): void
  onMapCenterChange(center: [number, number]): void
  onSelectCluster(selection: ActiveSelection): void
}): JSX.Element {
  const [zoom, setZoom] = useState<number>(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawCenter, setDrawCenter] = useState<[number, number] | null>(null)
  const [draftRadius, setDraftRadius] = useState(0)

  useMapEvents({
    zoomend: event => {
      setZoom(event.target.getZoom())
    },
    moveend: event => {
      const center = event.target.getCenter()
      props.onMapCenterChange([center.lat, center.lng])
    },
    mousedown: event => {
      if (!props.drawMode) {
        return
      }

      setIsDrawing(true)
      setDrawCenter([event.latlng.lat, event.latlng.lng])
      setDraftRadius(0)
    },
    mousemove: event => {
      if (!props.drawMode || !isDrawing || !drawCenter) {
        return
      }

      const centerPoint = latLng(drawCenter[0], drawCenter[1])
      setDraftRadius(centerPoint.distanceTo(event.latlng))
    },
    mouseup: () => {
      if (!props.drawMode || !isDrawing || !drawCenter) {
        return
      }

      setIsDrawing(false)
      if (draftRadius > 1000) {
        props.onShapeChange({ center: drawCenter, radius: draftRadius })
      } else {
        props.onShapeChange(null)
      }
    },
  })

  const clusters = useMemo(() => computeClusters(props.groups, zoom), [props.groups, zoom])

  function handleClickCluster(cluster: ClusterPoint): void {
    const labels = [...cluster.labels].sort((left, right) => left.localeCompare(right))
    props.onSelectCluster({
      id: cluster.id,
      title: cluster.count > 1 ? 'Dishes in this cluster' : 'Dish',
      labels,
    })
  }

  function renderCluster(cluster: ClusterPoint): JSX.Element {
    return (
      <CircleMarker
        key={cluster.id}
        center={cluster.center}
        radius={cluster.count > 1 ? 8 + Math.min(cluster.count, 24) : 10}
        pathOptions={getMarkerStyle(props.theme, cluster.count)}
        eventHandlers={{ click: () => handleClickCluster(cluster) }}
      >
        <Tooltip direction="top" opacity={0.95}>
          {cluster.count > 1
            ? `${cluster.count} nearby locations · ${cluster.labels.length} dishes`
            : cluster.labels[0]}
        </Tooltip>
      </CircleMarker>
    )
  }

  const liveShape =
    props.drawMode && isDrawing && drawCenter && draftRadius > 0
      ? { center: drawCenter, radius: draftRadius }
      : props.shape

  return (
    <>
      {clusters.map(cluster => renderCluster(cluster))}
      {liveShape ? <Circle center={liveShape.center} radius={liveShape.radius} pathOptions={{ color: '#0ea5e9', weight: 2, fillOpacity: 0.1 }} /> : null}
    </>
  )
}

export default function App(): JSX.Element {
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null)
  const [theme, setTheme] = useState<ThemeName>('brutalist-dark')
  const [drawMode, setDrawMode] = useState(false)
  const [shape, setShape] = useState<DrawShape | null>(null)
  const [mapViewCenter, setMapViewCenter] = useState<[number, number]>([20, 0])

  const themeConfig = getThemeConfig(theme)

  const shapeItems = useMemo(() => {
    if (!shape) {
      return []
    }

    const centerPoint = latLng(shape.center[0], shape.center[1])
    const viewportCenter = latLng(mapViewCenter[0], mapViewCenter[1])
    const inside: Array<{ id: string; label: string; distanceFromViewCenter: number }> = []

    for (const group of dishGroups) {
      const location = latLng(group.location[0], group.location[1])
      if (centerPoint.distanceTo(location) <= shape.radius) {
        for (const label of group.labels) {
          inside.push({
            id: `${group.id}-${label}`,
            label,
            distanceFromViewCenter: viewportCenter.distanceTo(location),
          })
        }
      }
    }

    inside.sort((left, right) => left.distanceFromViewCenter - right.distanceFromViewCenter)
    return inside
  }, [shape, mapViewCenter])

  function handleCloseDialog(): void {
    setActiveSelection(null)
  }

  function handleThemeDark(): void {
    setTheme('brutalist-dark')
  }

  function handleThemeLight(): void {
    setTheme('brutalist-light')
  }

  function handleToggleDrawMode(): void {
    setDrawMode(current => !current)
  }

  function handleClearShape(): void {
    setShape(null)
  }

  function renderThemeControls(): JSX.Element {
    const isDark = theme === 'brutalist-dark'
    const isLight = theme === 'brutalist-light'

    return (
      <ThemePanelComponent>
        <DialogTitleComponent>{getThemePanelTitle(theme)}</DialogTitleComponent>
        <TextComponent>
          Country labels are cleaner, city labels are slightly larger, and markers now cluster.
        </TextComponent>
        <div className="theme-actions">
          <ButtonComponent
            type="button"
            className={isDark ? 'theme-button-active' : undefined}
            onClick={handleThemeDark}
          >
            Dark
          </ButtonComponent>
          <ButtonComponent
            type="button"
            className={isLight ? 'theme-button-active' : undefined}
            onClick={handleThemeLight}
          >
            Light
          </ButtonComponent>
        </div>
      </ThemePanelComponent>
    )
  }

  function renderSelectionPanel(): JSX.Element {
    return (
      <section className="shape-panel">
        <DialogTitleComponent>Draw shape selection</DialogTitleComponent>
        <TextComponent>
          Toggle draw mode, then click and drag on the map to draw a circle. Items are sorted by
          distance to your current map center.
        </TextComponent>
        <div className="shape-actions">
          <ButtonComponent
            type="button"
            className={drawMode ? 'theme-button-active' : undefined}
            onClick={handleToggleDrawMode}
          >
            {drawMode ? 'Drawing enabled' : 'Enable drawing'}
          </ButtonComponent>
          <ButtonComponent type="button" tone="ghost" onClick={handleClearShape}>
            Clear shape
          </ButtonComponent>
        </div>
        <DishListComponent>
          {shapeItems.length === 0 ? (
            <li className="dish-list-item shape-list-empty">
              <TextComponent>
                Draw a shape to list all dishes inside it.
              </TextComponent>
            </li>
          ) : (
            shapeItems.map(item => (
              <DishListItemComponent
                key={item.id}
                label={`${item.label} · ${Math.round(item.distanceFromViewCenter / 1000)} km`}
                url={buildWikipediaSearchUrl(item.label)}
              />
            ))
          )}
        </DishListComponent>
      </section>
    )
  }

  function renderDialog(): JSX.Element | null {
    if (!activeSelection) {
      return null
    }

    return (
      <DialogComponent open className="group-dialog">
        <DialogContentComponent>
          <DialogHeaderComponent>
            <DialogTitleComponent>{activeSelection.title}</DialogTitleComponent>
            <ButtonComponent type="button" tone="ghost" onClick={handleCloseDialog}>
              Close
            </ButtonComponent>
          </DialogHeaderComponent>
          <TextComponent>Open a dish to search it on Wikipedia.</TextComponent>
          <DishListComponent>
            {activeSelection.labels.map(label => (
              <DishListItemComponent key={label} label={label} url={buildWikipediaSearchUrl(label)} />
            ))}
          </DishListComponent>
        </DialogContentComponent>
      </DialogComponent>
    )
  }

  return (
    <PageShellComponent className={themeConfig.mapClassName}>
      {renderThemeControls()}
      {renderSelectionPanel()}
      <MapContainer
        key={theme}
        center={mapCenter}
        zoom={2}
        minZoom={2}
        preferCanvas
        className="map"
        zoomControl={false}
      >
        <TileLayer attribution={themeConfig.attribution} url={themeConfig.baseUrl} />
        <TileLayer
          attribution={themeConfig.attribution}
          className="elevation-layer"
          url={themeConfig.elevationUrl}
          opacity={themeConfig.elevationOpacity}
        />
        <TileLayer
          attribution={themeConfig.attribution}
          className="country-outline-layer"
          url={themeConfig.countryOutlineUrl}
          opacity={0.82}
        />
        <TileLayer
          attribution={themeConfig.attribution}
          className="city-label-layer"
          url={themeConfig.labelUrl}
          opacity={0.97}
        />
        <ClusterLayerComponent
          groups={dishGroups}
          theme={theme}
          drawMode={drawMode}
          shape={shape}
          onShapeChange={setShape}
          onMapCenterChange={setMapViewCenter}
          onSelectCluster={setActiveSelection}
        />
      </MapContainer>
      {renderDialog()}
    </PageShellComponent>
  )
}
