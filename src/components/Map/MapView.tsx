import { MapContainer, TileLayer } from 'react-leaflet';
import { EditableLayer } from './EditableLayer';
import { MapBoundsHandler } from './MapBoundsHandler';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

export function MapView() {
  return (
    <MapContainer
      center={[-33.9, 25.6]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <EditableLayer />
      <MapBoundsHandler />
    </MapContainer>
  );
}
