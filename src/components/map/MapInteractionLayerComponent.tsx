import { useEffect, useMemo, useState } from 'react'
import { Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { latLng } from 'leaflet'
import type { LeafletEvent, LeafletMouseEvent } from 'leaflet'
import type { JSX } from 'react'
import { computeClusters } from '../../map/clustering'
import { getMarkerStyle } from '../../map/utils'
import type { ActiveSelection, DishGroup, DrawShape, ThemeName } from '../../map/types'

type MapInteractionLayerProps = {
  groups: DishGroup[]
  theme: ThemeName
  drawMode: boolean
  shape: DrawShape | null
  onShapeChange(shape: DrawShape | null): void
  onMapCenterChange(center: [number, number]): void
  onSelectCluster(selection: ActiveSelection): void
}

export function MapInteractionLayerComponent(props: MapInteractionLayerProps): JSX.Element {
  const [zoom, setZoom] = useState<number>(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawCenter, setDrawCenter] = useState<[number, number] | null>(null)
  const [draftRadius, setDraftRadius] = useState(0)
  const map = useMap()

  useEffect(() => {
    if (!props.drawMode) {
      map.dragging.enable()
      setIsDrawing(false)
      return
    }

    map.dragging.disable()

    return () => {
      map.dragging.enable()
    }
  }, [map, props.drawMode])

  function startDrawing(event: LeafletMouseEvent): void {
    if (!props.drawMode) {
      return
    }

    setIsDrawing(true)
    setDrawCenter([event.latlng.lat, event.latlng.lng])
    setDraftRadius(0)
  }

  function updateDrawing(event: LeafletMouseEvent): void {
    if (!props.drawMode || !isDrawing || !drawCenter) {
      return
    }

    setDraftRadius(latLng(drawCenter[0], drawCenter[1]).distanceTo(event.latlng))
  }

  function stopDrawing(event: LeafletMouseEvent | null): void {
    if (!props.drawMode || !isDrawing || !drawCenter) {
      return
    }

    const finalRadius =
      event === null
        ? draftRadius
        : latLng(drawCenter[0], drawCenter[1]).distanceTo(event.latlng)

    setIsDrawing(false)

    if (finalRadius > 1000) {
      props.onShapeChange({
        center: drawCenter,
        radius: finalRadius,
      })
      return
    }

    props.onShapeChange(null)
  }

  function updateMapCenter(event: LeafletEvent): void {
    const center = event.target.getCenter()
    props.onMapCenterChange([center.lat, center.lng])
  }

  useMapEvents({
    zoomend: event => {
      setZoom(event.target.getZoom())
    },
    moveend: updateMapCenter,
    mousedown: startDrawing,
    mousemove: updateDrawing,
    mouseup: stopDrawing,
    mouseout: () => stopDrawing(null),
  })

  const clusters = useMemo(() => computeClusters(props.groups, zoom), [props.groups, zoom])

  function handleClickCluster(clusterId: string, labels: string[], count: number): void {
    props.onSelectCluster({
      id: clusterId,
      title: count > 1 ? 'Dishes in this cluster' : 'Dish',
      labels: [...labels].sort((left, right) => left.localeCompare(right)),
    })
  }

  const liveShape =
    props.drawMode && isDrawing && drawCenter && draftRadius > 0
      ? { center: drawCenter, radius: draftRadius }
      : props.shape

  return (
    <>
      {clusters.map(cluster => (
        <CircleMarker
          key={cluster.id}
          center={cluster.center}
          radius={cluster.count > 1 ? 8 + Math.min(cluster.count, 24) : 10}
          pathOptions={getMarkerStyle(props.theme, cluster.count)}
          eventHandlers={{ click: () => handleClickCluster(cluster.id, cluster.labels, cluster.count) }}
        >
          <Tooltip direction="top" opacity={0.95}>
            {cluster.count > 1
              ? `${cluster.count} nearby locations · ${cluster.labels.length} dishes`
              : cluster.labels[0]}
          </Tooltip>
        </CircleMarker>
      ))}
      {liveShape ? (
        <Circle
          center={liveShape.center}
          radius={liveShape.radius}
          pathOptions={{ color: '#0ea5e9', weight: 2, fillOpacity: 0.1 }}
        />
      ) : null}
    </>
  )
}
