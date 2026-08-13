import type * as GeoJSON from 'geojson'
import type { MarkerOptions, PopupOptions } from 'maplibre-gl'
import type MapLibreGL from 'maplibre-gl'
import type { ReactNode } from 'react'

import type { Theme } from './theme'

/** Map viewport state */
type MapViewport = {
  /** Center coordinates [longitude, latitude] */
  center: [number, number]
  /** Zoom level */
  zoom: number
  /** Bearing (rotation) in degrees */
  bearing: number
  /** Pitch (tilt) in degrees */
  pitch: number
}

type MapStyleOption = string | MapLibreGL.StyleSpecification

type MapRef = MapLibreGL.Map

type MapProps = {
  children?: ReactNode
  /** Additional CSS classes for the map container */
  className?: string
  /**
   * Theme for the map. If not provided, automatically detects system preference.
   * Pass your theme value here.
   */
  theme?: Theme
  /** Custom map styles for light and dark themes. Overrides the default Carto styles. */
  styles?: {
    light?: MapStyleOption
    dark?: MapStyleOption
  }
  /**
   * Use a transparent, tile-less basemap instead of the default Carto street
   * basemap — a blank canvas. Used alone it renders nothing; add your own
   * layers on top (`<MapGeoJSON>`, `<MapArc>`, markers, etc.). Ideal for data
   * visualizations (choropleths, arcs, dot maps).
   * Ignored when an explicit `styles` prop is provided.
   */
  blank?: boolean
  /** Map projection type. Use `{ type: "globe" }` for 3D globe view. */
  projection?: MapLibreGL.ProjectionSpecification
  /**
   * Controlled viewport. When provided with onViewportChange,
   * the map becomes controlled and viewport is driven by this prop.
   */
  viewport?: Partial<MapViewport>
  /**
   * Callback fired continuously as the viewport changes (pan, zoom, rotate, pitch).
   * Can be used standalone to observe changes, or with `viewport` prop
   * to enable controlled mode where the map viewport is driven by your state.
   */
  onViewportChange?: (viewport: MapViewport) => void
  /** Show a loading indicator on the map */
  loading?: boolean
} & Omit<MapLibreGL.MapOptions, 'container' | 'style'>

type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number
  /** Latitude coordinate for marker position */
  latitude: number
  /** Marker subcomponents (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel) */
  children: ReactNode
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void
} & Omit<MarkerOptions, 'element'>

type MarkerContentProps = {
  /** Custom marker content. Defaults to a blue dot if not provided */
  children?: ReactNode
  /** Additional CSS classes for the marker container */
  className?: string
}

type MarkerPopupProps = {
  /** Popup content */
  children: ReactNode
  /** Additional CSS classes for the popup container */
  className?: string
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean
} & Omit<PopupOptions, 'className' | 'closeButton'>

type MarkerTooltipProps = {
  /** Tooltip content */
  children: ReactNode
  /** Additional CSS classes for the tooltip container */
  className?: string
} & Omit<PopupOptions, 'className' | 'closeButton' | 'closeOnClick'>

type MarkerLabelProps = {
  /** Label text content */
  children: ReactNode
  /** Additional CSS classes for the label */
  className?: string
  /** Position of the label relative to the marker (default: "top") */
  position?: 'top' | 'bottom'
}

type MapControlsProps = {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean
  /** Additional CSS classes for the controls container */
  className?: string
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void
}

type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number
  /** Latitude coordinate for popup position */
  latitude: number
  /** Callback when popup is closed */
  onClose?: () => void
  /** Popup content */
  children: ReactNode
  /** Additional CSS classes for the popup container */
  className?: string
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean
} & Omit<PopupOptions, 'className' | 'closeButton'>

type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string
  /** Array of [longitude, latitude] coordinate pairs defining the route */
  coordinates: [number, number][]
  /** Line color as CSS color value (default: "#4285F4") */
  color?: string
  /** Line width in pixels (default: 3) */
  width?: number
  /** Line opacity from 0 to 1 (default: 0.8) */
  opacity?: number
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number]
  /** Callback when the route line is clicked */
  onClick?: () => void
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean
}

type MapGeoJSONData<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> =
  | GeoJSON.FeatureCollection<GeoJSON.Geometry, P>
  | GeoJSON.Feature<GeoJSON.Geometry, P>
  | GeoJSON.Geometry
  | string

type MapFillPaint = NonNullable<MapLibreGL.FillLayerSpecification['paint']>
type MapLinePaint = NonNullable<MapLibreGL.LineLayerSpecification['paint']>

/** A rendered feature with strongly-typed `properties`. */
type MapGeoJSONFeature<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = Omit<MapLibreGL.MapGeoJSONFeature, 'properties'> & { properties: P }

/** Event payload passed to MapGeoJSON interaction callbacks. */
type MapGeoJSONEvent<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** The feature under the cursor, with its typed GeoJSON properties. */
  feature: MapGeoJSONFeature<P>
  /** Longitude of the cursor at the time of the event. */
  longitude: number
  /** Latitude of the cursor at the time of the event. */
  latitude: number
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapLayerMouseEvent
}

type MapGeoJSONProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON data (FeatureCollection, Feature, Geometry) or a URL to fetch it from. */
  data: MapGeoJSONData<P>
  /** Optional unique identifier prefix for the source/layers. Auto-generated if not provided. */
  id?: string
  /**
   * Feature property to promote to the feature `id`. Required for hover
   * feature-state (`fillHoverPaint`) and stable `onHover`/`onClick` payloads.
   */
  promoteId?: string
  /**
   * Paint for the polygon fill layer. Merged on top of a theme-aware monochrome
   * surface tone (`fill-color`). Pass `false` to omit the fill layer entirely
   * (e.g. outlines only).
   */
  fillPaint?: MapFillPaint | false
  /**
   * Paint for the outline layer. Merged on top of a hairline default
   * (`line-color` = a near-surface neutral, `line-width` = 0.5) for thin
   * separators. Override `line-color` if your container differs, or pass
   * `false` to omit the layer.
   */
  linePaint?: MapLinePaint | false
  /**
   * Paint merged onto the fill layer for the feature under the cursor, applied
   * as a `case` expression keyed on hover feature-state. Requires `promoteId`.
   */
  fillHoverPaint?: MapFillPaint
  /** Callback when a feature is clicked. */
  onClick?: (e: MapGeoJSONEvent<P>) => void
  /** Callback fired when the hovered feature changes; `null` when the cursor leaves. */
  onHover?: (e: MapGeoJSONEvent<P> | null) => void
  /** Whether features respond to mouse events (default: false). */
  interactive?: boolean
  /** Optional MapLibre layer id to insert the layers before (z-order control). */
  beforeId?: string
}

/** A single arc to render inside <MapArc data={...}>. */
type MapArcDatum = {
  /** Unique identifier for this arc. Required for hover state tracking and event payloads. */
  id: string | number
  /** Start coordinate as [longitude, latitude]. */
  from: [number, number]
  /** End coordinate as [longitude, latitude]. */
  to: [number, number]
}

/** Event payload passed to MapArc interaction callbacks. */
type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
  /** The arc datum that was hovered or clicked. */
  arc: T
  /** Longitude of the cursor at the time of the event. */
  longitude: number
  /** Latitude of the cursor at the time of the event. */
  latitude: number
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapMouseEvent
}

type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification['paint']>
type MapArcLineLayout = NonNullable<MapLibreGL.LineLayerSpecification['layout']>

type MapArcProps<T extends MapArcDatum = MapArcDatum> = {
  /** Array of arcs to render. Each arc must have a unique `id`. */
  data: T[]
  /** Optional unique identifier prefix for the arc source/layers. Auto-generated if not provided. */
  id?: string
  /**
   * How far each arc bows away from a straight line. `0` renders straight
   * lines; higher values bend further. Negative values bend to the opposite
   * side. Arcs are computed as a quadratic Bézier in lng/lat space; the
   * destination longitude is unwrapped relative to the origin so that arcs
   * cross the antimeridian via the shorter great-circle direction. (default: 0.2)
   */
  curvature?: number
  /** Number of samples used to render each curve. Higher = smoother. (default: 64) */
  samples?: number
  /**
   * MapLibre paint properties for the arc layer. Merged on top of sensible
   * defaults (`line-color: #4285F4`, `line-width: 2`, `line-opacity: 0.85`).
   * Any value can be a MapLibre expression for per-feature styling, every
   * field on each arc datum (besides `from`/`to`) is exposed via `["get", ...]`.
   */
  paint?: MapArcLinePaint
  /** MapLibre layout properties for the arc layer. Defaults to rounded joins/caps. */
  layout?: MapArcLineLayout
  /**
   * Paint properties applied to the arc currently under the cursor. Each key
   * is merged into `paint` as a `case` expression keyed on per-feature hover
   * state, so only the hovered arc changes appearance.
   */
  hoverPaint?: MapArcLinePaint
  /** Callback when an arc is clicked. */
  onClick?: (e: MapArcEvent<T>) => void
  /**
   * Callback fired when the hovered arc changes. Receives the cursor's
   * lng/lat at the moment of entry, and `null` when the cursor leaves the
   * last hovered arc.
   */
  onHover?: (e: MapArcEvent<T> | null) => void
  /** Whether arcs respond to mouse events (default: true). */
  interactive?: boolean
  /** Optional MapLibre layer id to insert the arc layers before (z-order control). */
  beforeId?: string
}

type MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON FeatureCollection data or URL to fetch GeoJSON from */
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number
  /** Colors for cluster circles: [small, medium, large] based on point count (default: ["#3b82f6", "#1d4ed8", "#1e3a8a"]) */
  clusterColors?: [string, string, string]
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number]
  /** Color for unclustered individual points (default: "#3b82f6") */
  pointColor?: string
  /** Callback when an unclustered point is clicked */
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number]
  ) => void
  /** Callback when a cluster is clicked. If not provided, zooms into the cluster */
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number
  ) => void
}

export type {
  MapArcDatum,
  MapArcEvent,
  MapArcLineLayout,
  MapArcLinePaint,
  MapArcProps,
  MapClusterLayerProps,
  MapControlsProps,
  MapFillPaint,
  MapGeoJSONData,
  MapGeoJSONEvent,
  MapGeoJSONFeature,
  MapGeoJSONProps,
  MapLinePaint,
  MapMarkerProps,
  MapPopupProps,
  MapProps,
  MapRef,
  MapRouteProps,
  MapStyleOption,
  MapViewport,
  MarkerContentProps,
  MarkerLabelProps,
  MarkerPopupProps,
  MarkerTooltipProps,
}
