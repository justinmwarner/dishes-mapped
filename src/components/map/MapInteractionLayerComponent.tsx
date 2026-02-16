import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { canvas, latLng } from 'leaflet'
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
  onDrawComplete(): void
  onDrawingStateChange(isDrawing: boolean): void
}

export function MapInteractionLayerComponent(props: MapInteractionLayerProps): JSX.Element {
  const [zoom, setZoom] = useState<number>(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawCenter, setDrawCenter] = useState<[number, number] | null>(null)
  const [draftRadius, setDraftRadius] = useState(0)
  const map = useMap()
  const canvasRenderer = useMemo(() => canvas({ padding: 0.5 }), [])

  const isDrawingRef = useRef(isDrawing)
  const drawCenterRef = useRef(drawCenter)
  const draftRadiusRef = useRef(draftRadius)

  useEffect(() => {
    isDrawingRef.current = isDrawing
  }, [isDrawing])

  useEffect(() => {
    drawCenterRef.current = drawCenter
  }, [drawCenter])

  useEffect(() => {
    draftRadiusRef.current = draftRadius
  }, [draftRadius])

  useEffect(() => {
    if (!props.drawMode) {
      map.dragging.enable()
      setIsDrawing(false)
      props.onDrawingStateChange(false)
      return
    }

    map.dragging.disable()

    return () => {
      map.dragging.enable()
    }
  }, [map, props.drawMode, props.onDrawingStateChange])

  function finishDrawing(finalRadius: number): void {
    const center = drawCenterRef.current

    setIsDrawing(false)
    props.onDrawingStateChange(false)

    if (!center) {
      return
    }

    if (finalRadius > 1000) {
      props.onShapeChange({ center, radius: finalRadius })
      props.onDrawComplete()
      return
    }

    props.onShapeChange(null)
    props.onDrawComplete()
  }

  function startDrawing(event: LeafletMouseEvent): void {
    if (!props.drawMode) {
      return
    }

    setIsDrawing(true)
    props.onDrawingStateChange(true)
    setDrawCenter([event.latlng.lat, event.latlng.lng])
    setDraftRadius(0)
  }

  function updateDrawing(event: LeafletMouseEvent): void {
    if (!props.drawMode || !isDrawingRef.current || !drawCenterRef.current) {
      return
    }

    const center = drawCenterRef.current
    setDraftRadius(latLng(center[0], center[1]).distanceTo(event.latlng))
  }

  function stopDrawing(event: LeafletMouseEvent | null): void {
    if (!props.drawMode || !isDrawingRef.current || !drawCenterRef.current) {
      return
    }

    const center = drawCenterRef.current
    const finalRadius =
      event === null
        ? draftRadiusRef.current
        : latLng(center[0], center[1]).distanceTo(event.latlng)

    finishDrawing(finalRadius)
  }

  useEffect(() => {
    function handleWindowMouseUp(): void {
      if (!props.drawMode || !isDrawingRef.current) {
        return
      }

      finishDrawing(draftRadiusRef.current)
    }

    window.addEventListener('mouseup', handleWindowMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [props.drawMode])

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
          renderer={canvasRenderer}
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
          renderer={canvasRenderer}
          pathOptions={{ color: '#38bdf8', weight: 2, fillOpacity: 0.12 }}
        />
      ) : null}
    </>
  )
}
