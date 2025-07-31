'use client';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Circle } from 'react-leaflet';
import { LatLngExpression, DivIcon } from 'leaflet';

const centerFrance: LatLngExpression = [46.603354, 1.888334];

const userClickIcon = new DivIcon({
  html: '<div style="background-color: #dc2626; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const correctLocationIcon = new DivIcon({
  html: '<div style="background-color: #059669; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
  className: 'custom-div-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

interface MapComponentProps {
  clickPosition: LatLngExpression | null;
  showResult: boolean;
  ville: { nom: string; lat: number; lon: number };
  distance: number | null;
  onMapClick: (lat: number, lng: number) => void;
}

function MapClicker({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e: any) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({ clickPosition, showResult, ville, distance, onMapClick }: MapComponentProps) {
  return (
    <MapContainer center={centerFrance} zoom={6} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; CartoDB'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      <MapClicker onMapClick={onMapClick} />
      {clickPosition && (
        <Marker position={clickPosition} icon={userClickIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>Ton clic</strong><br />
              🔴 Tu as cliqué ici
            </div>
          </Popup>
        </Marker>
      )}
      {showResult && (
        <Marker position={[ville.lat, ville.lon]} icon={correctLocationIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>{ville.nom}</strong><br />
              🟢 Position correcte
            </div>
          </Popup>
        </Marker>
      )}
      {showResult && clickPosition && distance && (
        <Circle 
          center={clickPosition} 
          radius={distance * 1000} 
          pathOptions={{ 
            color: '#dc2626', 
            fillColor: '#dc2626', 
            fillOpacity: 0.1, 
            weight: 2,
            dashArray: '5, 5'
          }} 
        />
      )}
    </MapContainer>
  );
}
