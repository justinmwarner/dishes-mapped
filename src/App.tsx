import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { LatLngExpression, PathOptions } from 'leaflet'
import type { JSX } from 'react'
import dishMapData from './data/DISH-MAP.json'
import { ButtonComponent } from './components/ButtonComponent'
import { DialogComponent } from './components/DialogComponent'
import { DialogContentComponent } from './components/DialogContentComponent'
import { DialogHeaderComponent } from './components/DialogHeaderComponent'
import { DialogTitleComponent } from './components/DialogTitleComponent'
import { DishGroupMarkerComponent } from './components/DishGroupMarkerComponent'
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
      weight: count > 1 ? 2.2 : 1.6,
      fillColor: '#0f172a',
      fillOpacity: count > 1 ? 0.92 : 0.65,
    }
  }

  return {
    color: '#f8fafc',
    weight: count > 1 ? 2.2 : 1.6,
    fillColor: '#f8fafc',
    fillOpacity: count > 1 ? 0.92 : 0.65,
  }
}

function getThemeConfig(theme: ThemeName): ThemeConfig {
  if (theme === 'brutalist-light') {
    return {
      mapClassName: 'map-theme-light',
      baseUrl: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      labelUrl: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
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
    labelUrl: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
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

function findGroupById(groupId: string): DishGroup | null {
  for (const group of dishGroups) {
    if (group.id === groupId) {
      return group
    }
  }

  return null
}

export default function App(): JSX.Element {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemeName>('brutalist-dark')

  const themeConfig = getThemeConfig(theme)
  const activeGroup = activeGroupId ? findGroupById(activeGroupId) : null

  function handleCloseDialog(): void {
    setActiveGroupId(null)
  }

  function handleSelectGroup(groupId: string): void {
    setActiveGroupId(groupId)
  }

  function handleThemeDark(): void {
    setTheme('brutalist-dark')
  }

  function handleThemeLight(): void {
    setTheme('brutalist-light')
  }

  function handleOpenPrimaryLink(label: string): void {
    const url = buildWikipediaSearchUrl(label)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function renderMarkers(): JSX.Element[] {
    const markerElements: JSX.Element[] = []

    for (const group of dishGroups) {
      markerElements.push(
        <DishGroupMarkerComponent
          key={group.id}
          id={group.id}
          location={group.location}
          labels={group.labels}
          markerStyle={getMarkerStyle(theme, group.labels.length)}
          onSelectGroup={handleSelectGroup}
          onOpenPrimaryLink={handleOpenPrimaryLink}
        />,
      )
    }

    return markerElements
  }

  function renderThemeControls(): JSX.Element {
    const isDark = theme === 'brutalist-dark'
    const isLight = theme === 'brutalist-light'

    return (
      <ThemePanelComponent>
        <DialogTitleComponent>{getThemePanelTitle(theme)}</DialogTitleComponent>
        <TextComponent>
          City labels are visible. Borders and relief are layered for bold geography.
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

  function renderDialog(): JSX.Element | null {
    if (!activeGroup) {
      return null
    }

    const listItems: JSX.Element[] = []

    for (const label of activeGroup.labels) {
      listItems.push(
        <DishListItemComponent
          key={label}
          label={label}
          url={buildWikipediaSearchUrl(label)}
        />,
      )
    }

    return (
      <DialogComponent open className="group-dialog">
        <DialogContentComponent>
          <DialogHeaderComponent>
            <DialogTitleComponent>
              {activeGroup.labels.length > 1 ? 'Dishes in this location' : 'Dish'}
            </DialogTitleComponent>
            <ButtonComponent type="button" tone="ghost" onClick={handleCloseDialog}>
              Close
            </ButtonComponent>
          </DialogHeaderComponent>
          <TextComponent>Open a dish to search it on Wikipedia.</TextComponent>
          <DishListComponent>{listItems}</DishListComponent>
        </DialogContentComponent>
      </DialogComponent>
    )
  }

  return (
    <PageShellComponent className={themeConfig.mapClassName}>
      {renderThemeControls()}
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
          opacity={0.88}
        />
        <TileLayer
          attribution={themeConfig.attribution}
          className="city-label-layer"
          url={themeConfig.labelUrl}
          opacity={0.93}
        />
        {renderMarkers()}
      </MapContainer>
      {renderDialog()}
    </PageShellComponent>
  )
}
