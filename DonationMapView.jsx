import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FlyToSelected({ donations, selectedId }) {
  const map = useMap();
  useEffect(() => {
    const d = donations.find(d => d.id === selectedId);
    if (d) map.flyTo([d.pickup_lat, d.pickup_lng], 13, { duration: 0.8 });
  }, [selectedId, donations, map]);
  return null;
}

function FitBounds({ donations }) {
  const map = useMap();
  useEffect(() => {
    if (donations.length > 1) {
      const bounds = L.latLngBounds(donations.map(d => [d.pickup_lat, d.pickup_lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (donations.length === 1) {
      map.setView([donations[0].pickup_lat, donations[0].pickup_lng], 12);
    }
  }, [donations.length]);
  return null;
}

export default function DonationMapView({ donations, selectedId, onSelect }) {
  const center = donations.length > 0
    ? [donations[0].pickup_lat, donations[0].pickup_lng]
    : [15.9129, 79.7400]; // Andhra Pradesh default

  return (
    <MapContainer center={center} zoom={5} className="w-full h-full z-0" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds donations={donations} />
      <FlyToSelected donations={donations} selectedId={selectedId} />
      {donations.map(d => (
        <Marker
          key={d.id}
          position={[d.pickup_lat, d.pickup_lng]}
          icon={d.id === selectedId ? selectedIcon : orangeIcon}
          eventHandlers={{ click: () => onSelect(d.id) }}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <strong className="block mb-1">{d.title}</strong>
              <span className="text-gray-500 text-xs">{d.quantity}</span><br/>
              <span className="text-gray-500 text-xs">{d.pickup_address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
