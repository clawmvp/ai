
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default Leaflet markers in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

interface Park {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
}

interface MapProps {
    parks: Park[];
    userLocation: { lat: number; lng: number } | null;
}

const MapComponent = ({ parks, userLocation }: MapProps) => {
    const center = userLocation || { lat: 44.4268, lng: 26.1025 }; // Default to Bucharest center
    const zoom = 12;

    return (
        <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700 z-0 relative">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={icon}>
                        <Popup>
                            <strong>Locația Ta</strong>
                        </Popup>
                    </Marker>
                )}

                {/* Park Markers */}
                {parks.map((park) => (
                    <Marker key={park.id} position={[park.lat, park.lng]} icon={icon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>{park.name}</strong><br />
                                {park.address} <br />
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${park.lat},${park.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    Navighează
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
