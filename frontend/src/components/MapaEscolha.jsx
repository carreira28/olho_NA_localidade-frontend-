import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const localizacaoInicial = { lat: 41.69536294033055, lng: -8.846697361528607 };
function EscolherPonto({ onEscolher }) {
  useMapEvents({
    click: (e) => onEscolher({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function MapaEscolha({ posicao, onEscolher, centro }) {
  return (
    <MapContainer
      center={centro ?? localizacaoInicial}
      zoom={15}
      className="mapa"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <EscolherPonto onEscolher={onEscolher} />
      {posicao && <Marker position={[posicao.lat, posicao.lng]} />}
    </MapContainer>
  );
}
