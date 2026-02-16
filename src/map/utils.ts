import { latLng } from 'leaflet'
import type { LatLngExpression, PathOptions } from 'leaflet'
import type {
  DishGroup,
  DishItem,
  DrawShape,
  ShapeListItem,
  ThemeConfig,
  ThemeName,
} from './types'

export const mapCenter: LatLngExpression = [20, 0]

export function buildDishGroups(items: DishItem[]): DishGroup[] {
  const groupedItems = new Map<string, DishGroup>()

  for (const item of items) {
    if (!item.Location) {
      continue
    }

    const latitude = item.Location.Latitude
    const longitude = item.Location.Longitude
    const key = `${latitude},${longitude}`
    const existingGroup = groupedItems.get(key)

    if (existingGroup) {
      existingGroup.labels.push(item.Label)
      continue
    }

    groupedItems.set(key, {
      id: key,
      location: [latitude, longitude],
      labels: [item.Label],
    })
  }

  return Array.from(groupedItems.values())
}

export function buildWikipediaSearchUrl(label: string): string {
  return `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(label)}`
}

export function getMarkerStyle(theme: ThemeName, count: number): PathOptions {
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

export function getThemeConfig(theme: ThemeName): ThemeConfig {
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

export function getThemePanelTitle(theme: ThemeName): string {
  return theme === 'brutalist-light' ? 'Brutalist Light' : 'Brutalist Dark'
}

export function buildItemsInsideShape(
  shape: DrawShape | null,
  mapViewCenter: [number, number],
  groups: DishGroup[],
): ShapeListItem[] {
  if (!shape) {
    return []
  }

  const shapeCenterPoint = latLng(shape.center[0], shape.center[1])
  const viewportCenterPoint = latLng(mapViewCenter[0], mapViewCenter[1])
  const inside: ShapeListItem[] = []

  for (const group of groups) {
    const locationPoint = latLng(group.location[0], group.location[1])
    if (shapeCenterPoint.distanceTo(locationPoint) > shape.radius) {
      continue
    }

    for (const label of group.labels) {
      inside.push({
        id: `${group.id}-${label}`,
        label,
        distanceFromViewCenter: viewportCenterPoint.distanceTo(locationPoint),
      })
    }
  }

  inside.sort((left, right) => left.distanceFromViewCenter - right.distanceFromViewCenter)
  return inside
}
