"use client"

import { MapContainer, TileLayer, Marker, useMapEvents, Polygon } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix leaflet icon issue
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Position = { lat: number, lng: number }

function LocationMarker({ positions, setPositions }: { positions: Position[], setPositions: (p: Position[]) => void }) {
  useMapEvents({
    click(e) {
      setPositions([...positions, { lat: e.latlng.lat, lng: e.latlng.lng }])
    },
  })

  return (
    <>
      {positions.map((pos, idx) => (
        <Marker key={idx} position={pos} icon={customIcon} />
      ))}
      {positions.length >= 3 && (
        <Polygon positions={positions} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.3 }} />
      )}
    </>
  )
}

export default function ParcelleMap({
  positions,
  setPositions,
  defaultCenter
}: {
  positions: Position[]
  setPositions: (p: Position[]) => void
  defaultCenter: { lat: number, lng: number }
}) {
  return (
    <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker positions={positions} setPositions={setPositions} />
    </MapContainer>
  )
}
