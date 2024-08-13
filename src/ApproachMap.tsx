import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';

// Centered over KATL.
const DEFAULT_MAP_LOCATION: [number, number] = [33.63, -84.42];

export default function ApproachMap() {
    return <MapContainer style={{height: "60vh", minHeight: "300px"}} center={DEFAULT_MAP_LOCATION} zoom={10}>
        <TileLayer
            attribution='&copy; <a href="https://vfrmap.com/about.html">VFRMap</a>'
            url='https://vfrmap.com/20240711/tiles/vfrc/{z}/{y}/{x}.jpg'
            tms={true}
        />
    </MapContainer>
}