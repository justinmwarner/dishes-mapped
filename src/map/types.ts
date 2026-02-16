import type { PathOptions } from 'leaflet'

export type ThemeName = 'brutalist-dark' | 'brutalist-light'

export type DishItem = {
  Label: string
  Location: {
    Latitude: number
    Longitude: number
  } | null
}

export type DishGroup = {
  id: string
  location: [number, number]
  labels: string[]
}

export type ThemeConfig = {
  mapClassName: string
  baseUrl: string
  labelUrl: string
  countryOutlineUrl: string
  elevationUrl: string
  elevationOpacity: number
  attribution: string
}

export type DrawShape = {
  center: [number, number]
  radius: number
}

export type ActiveSelection = {
  id: string
  title: string
  labels: string[]
}

export type ShapeListItem = {
  id: string
  label: string
  distanceFromViewCenter: number
}

export type ClusterPoint = {
  id: string
  center: [number, number]
  labels: string[]
  count: number
}

export type MarkerStyleGetter = (theme: ThemeName, count: number) => PathOptions
