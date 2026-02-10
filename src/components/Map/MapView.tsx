import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { GeomanLayer } from './GeomanLayer';
import { LabelToggleControl } from './LabelToggleControl';
import { MapBoundsHandler } from './MapBoundsHandler';
import { useThemeStore } from '../../store/themeStore';
import 'leaflet/dist/leaflet.css';

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

export function MapView() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        key={theme}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={TILE_URLS[theme]}
      />
      <ZoomControl position="bottomright" />
      <GeomanLayer />
      <LabelToggleControl />
      <MapBoundsHandler />
    </MapContainer>
  );
}
