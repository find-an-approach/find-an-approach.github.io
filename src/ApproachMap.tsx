import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Centered over KATL.
const DEFAULT_MAP_LOCATION: [number, number] = [33.63, -84.42];

export default function ApproachMap(props: { dttpCycleNumber: string }) {
  // vfrmap uses the full year in the cycle, so 20240711, therefore we
  // prefix a 20. Hopefully no one is using this in the year 3000 :)
  const tileUrl = `https://vfrmap.com/20${props.dttpCycleNumber}/tiles/vfrc/{z}/{y}/{x}.jpg`;

  return (
    <MapContainer
      style={{ height: "60vh", minHeight: "300px" }}
      center={DEFAULT_MAP_LOCATION}
      zoom={10}
    >
      <TileLayer
        attribution='&copy; <a href="https://vfrmap.com/about.html">VFRMap</a>'
        url={tileUrl}
        tms={true}
      />
    </MapContainer>
  );
}
