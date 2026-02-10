import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { GeomanLayer } from './GeomanLayer';
import { MapBoundsHandler } from './MapBoundsHandler';
import 'leaflet/dist/leaflet.css';

export function MapView() {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <GeomanLayer />
      <MapBoundsHandler />
    </MapContainer>
  );
}
