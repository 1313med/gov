import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with Vite/webpack
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Approximate coordinates for major Moroccan cities
const CITY_COORDS = {
  casablanca:   [33.5731, -7.5898],
  rabat:        [34.0209, -6.8416],
  marrakech:    [31.6295, -7.9811],
  fes:          [34.0331, -5.0003],
  tanger:       [35.7595, -5.8340],
  agadir:       [30.4278, -9.5981],
  meknes:       [33.8935, -5.5547],
  oujda:        [34.6814, -1.9086],
  tetouan:      [35.5785, -5.3684],
  safi:         [32.2994, -9.2372],
  kenitra:      [34.2610, -6.5802],
  nador:        [35.1681, -2.9335],
  "el jadida":  [33.2549, -8.5079],
  "beni mellal":  [32.3373, -6.3498],
};

function getCityCoords(city) {
  if (!city) return null;
  const key = city.trim().toLowerCase();
  return CITY_COORDS[key] || null;
}

export default function MapView({ city, label }) {
  const coords = getCityCoords(city);
  if (!coords) return null;

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e5e7eb", marginTop: 16 }}>
      <MapContainer
        center={coords}
        zoom={12}
        style={{ height: 260, width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{label || city}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
