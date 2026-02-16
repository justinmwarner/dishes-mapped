import { useMemo, useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import type { JSX } from 'react'
import dishMapData from './data/DISH-MAP.json'
import { PageShellComponent } from './components/PageShellComponent'
import { MapInteractionLayerComponent } from './components/map/MapInteractionLayerComponent'
import { SelectionDialogComponent } from './components/map/SelectionDialogComponent'
import { ShapeSelectionPanelComponent } from './components/map/ShapeSelectionPanelComponent'
import { ThemeControlsComponent } from './components/map/ThemeControlsComponent'
import type { ActiveSelection, DishItem, DrawShape, ThemeName } from './map/types'
import { buildDishGroups, buildItemsInsideShape, getThemeConfig, mapCenter } from './map/utils'

const dishGroups = buildDishGroups(dishMapData.Items as DishItem[])

export default function App(): JSX.Element {
  const [activeSelection, setActiveSelection] = useState<ActiveSelection | null>(null)
  const [theme, setTheme] = useState<ThemeName>('brutalist-dark')
  const [drawMode, setDrawMode] = useState(false)
  const [shape, setShape] = useState<DrawShape | null>(null)
  const [mapViewCenter, setMapViewCenter] = useState<[number, number]>([20, 0])
  const [isDrawingInProgress, setIsDrawingInProgress] = useState(false)

  const themeConfig = getThemeConfig(theme)
  const shapeItems = useMemo(
    () => buildItemsInsideShape(shape, mapViewCenter, dishGroups),
    [shape, mapViewCenter],
  )

  return (
    <PageShellComponent
      className={`${themeConfig.mapClassName} ${drawMode ? 'map-draw-mode' : ''}`.trim()}
    >
      <ThemeControlsComponent
        theme={theme}
        onThemeDark={() => setTheme('brutalist-dark')}
        onThemeLight={() => setTheme('brutalist-light')}
      />
      <ShapeSelectionPanelComponent
        drawMode={drawMode}
        isDrawingInProgress={isDrawingInProgress}
        shapeItems={shapeItems}
        onToggleDrawMode={() => setDrawMode(current => !current)}
        onClearShape={() => setShape(null)}
      />
      <MapContainer
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
        <MapInteractionLayerComponent
          groups={dishGroups}
          theme={theme}
          drawMode={drawMode}
          shape={shape}
          onShapeChange={setShape}
          onMapCenterChange={setMapViewCenter}
          onSelectCluster={setActiveSelection}
          onDrawComplete={() => setDrawMode(false)}
          onDrawingStateChange={setIsDrawingInProgress}
        />
      </MapContainer>
      <SelectionDialogComponent selection={activeSelection} onClose={() => setActiveSelection(null)} />
    </PageShellComponent>
  )
}
